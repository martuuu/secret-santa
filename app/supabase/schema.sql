-- Habilitar extensiones
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Usuarios)
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  avatar_url text,
  -- Este token es lo que mostras en tu QR. Es publico para escanear, 
  -- pero la logica de validacion se hace en backend.
  qr_token uuid default uuid_generate_v4() not null
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone" 
  on profiles for select using ( true );

create policy "Users can insert own profile" 
  on profiles for insert with check ( auth.uid() = id );

create policy "Users can update own profile" 
  on profiles for update using ( auth.uid() = id );

-- 2. GROUPS (Eventos)
create table groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  admin_id uuid references auth.users not null,
  status text check (status in ('open', 'drawn')) default 'open'
);

alter table groups enable row level security;

create policy "Groups are viewable by everyone" 
  on groups for select using ( true );

create policy "Authenticated users can create groups" 
  on groups for insert with check ( auth.role() = 'authenticated' );

create policy "Admin can update group" 
  on groups for update using ( auth.uid() = admin_id );

-- 3. PARTICIPANTS (Lista pública de quién juega)
create table participants (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups not null,
  user_id uuid references profiles(id) not null,
  lives int default 2, -- Para el juego del QR
  unique(group_id, user_id)
);

alter table participants enable row level security;

create policy "Participants viewable by everyone" 
  on participants for select using ( true );

create policy "Admin or Self can insert participant" 
  on participants for insert with check ( true ); -- Simplificado para MVP

create policy "System/Self can update lives" 
  on participants for update using ( true );

-- 4. MATCHES (LA TABLA SECRETA)
-- Aquí es donde vive la data sensible.
create table matches (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups not null,
  santa_id uuid references profiles(id) not null, -- Quien regala
  giftee_id uuid references profiles(id) not null, -- Quien recibe
  unique(group_id, santa_id),
  unique(group_id, giftee_id)
);

alter table matches enable row level security;

-- CRITICO: Solo puedes ver la fila donde TU eres el Santa.
-- Nadie puede ver quien le regala a él (porque no es el santa de esa fila).
create policy "Santa can see who they gift to" 
  on matches for select using ( auth.uid() = santa_id );

create policy "Admins can insert matches" 
  on matches for insert with check ( true );

-- 5. WISHLIST ITEMS
create table wishlist_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  title text not null,
  url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table wishlist_items enable row level security;

create policy "Wishlist public read" 
  on wishlist_items for select using ( true );

create policy "Users manage own wishlist" 
  on wishlist_items for all using ( auth.uid() = user_id );

-- 6. RPC FUNCTION PARA EL JUEGO (Anti-Trampas)
-- Esta funcion corre en el servidor de base de datos.
-- Verifica si el usuario scaneado (suspect_id) es realmente mi Santa.
create or replace function attempt_guess(group_id_input uuid, suspect_id uuid)
returns boolean
language plpgsql
security definer -- Corre con permisos de admin para poder leer la tabla matches
as $$
declare
  actual_santa_id uuid;
begin
  -- Busco quien es MI santa real en este grupo
  select santa_id into actual_santa_id
  from matches
  where group_id = group_id_input 
  and giftee_id = auth.uid(); -- auth.uid() soy yo, el adivinador

  -- Retorno true si el sospechoso es el santa
  return actual_santa_id = suspect_id;
end;
$$;