Role & Objective
You are a Principal Full Stack Engineer specialized in Next.js and Supabase. Your goal is to build a "Secret Santa" (Amigo Invisible) MVP in a single session. Priority: Speed, Mobile-First UX (Consumer Grade), and strict Data Privacy (RLS).

Tech Stack
Framework: Next.js 14+ (App Router).

Backend/DB: Supabase (Auth, Postgres, Realtime).

Styling: Tailwind CSS + Shadcn/UI.

Animations: framer-motion (Crucial for the "attractive" mobile feel).

Icons: lucide-react.

QR Features: react-qr-code (display) and react-qr-reader (or html5-qrcode) for scanning.

Forms: react-hook-form + zod.

Project Constraints & Rules
Mobile First: The UI must look like a native app. Use bottom sheets (Drawer) for details and clean headers.

Privacy is Law: A user must never be able to inspect the network response to see who is gifting them. This must be handled via Supabase RLS policies.

Simplicity: No complex invitation emails. Admin adds users via UI logic (or users join a group code).

1. Database Schema & Security (Supabase)
Generate the SQL migration for the following structure. Do not hallucinate policies, use these strict rules:

Tables
profiles

id (uuid, references auth.users)

username (text, unique)

avatar_url (text, optional)

secret_qr_token (uuid, default gen_random_uuid()) -> Used for the QR game verification.

RLS: Public Read, Update only for auth.uid() = id.

groups (The event)

id (uuid)

name (text)

status (enum: 'open', 'drawn')

admin_id (uuid)

RLS: Public Read. Create/Update for authenticated.

participants

group_id (uuid)

user_id (uuid)

giftee_id (uuid, nullable) -> The person user_id has to buy a gift for.

lives (int, default 2) -> For the QR game.

RLS (CRITICAL):

Insert: Public (or Admin only depending on logic).

Select (Others): Can see user_id, group_id, lives. CANNOT SEE giftee_id.

Select (Self): Can see giftee_id ONLY IF auth.uid() = user_id.

Note to AI: You might need a PostgreSQL View or specific Policy to strictly hide giftee_id from non-owners, or handle this via a Supabase Edge Function for the draw to ensure 100% opacity, but for this MVP, try RLS with column selection security if possible, or simple "Owner can see giftee, others cannot" policy.

wishlist_items

id (uuid)

user_id (uuid)

title (text)

url (text, optional)

RLS: Public Read. Insert/Update/Delete only auth.uid() = user_id.

2. Core Features & User Flow
A. Authentication & Onboarding
Simple Email/Password Sign up/Login (Supabase Auth).

If profiles entry is missing, redirect to /setup-profile (Set Username).

B. The Group & Draw (Admin)
User creates a Group.

Admin "Adds" participants. Simplification: Admin searches users by Username/Email and adds them. Or create a "Join Link" page where users click "Join Group".

Action: "Realizar Sorteo" (Execute Draw).

Logic: Shuffle array of participants. Assign A->B, B->C, C->A. No self-gifting.

Update participants table filling giftee_id.

Update groups status to 'drawn'.

C. Dashboard (The Participant View)
State 1 (Pre-Draw): "Waiting for Admin to start..."

State 2 (Post-Draw):

Display a beautiful Card/Animation.

Button: "Reveal my Secret Person".

Interaction: Tap -> Explosion/Confetti -> Shows Profile Card of the Giftee (Name + Link to view Wishlist).

D. Wishlists
Profile page shows a list of items.

Owner sees "+ Add Item" (Drawer with Form: Title, Link).

Owner can delete items.

Visitors can only click the links.

E. The "QR Challenge" (Game Mode)
Context: I received a gift. I suspect User X gave it to me.

My Action: I go to User X's profile. I click "Desafiar (Challenge)".

Scanner: Opens Camera.

Target Action: User X shows their "Santa ID" QR Code (found in their own profile).

Logic:

If Scan matches my santa_id (derived from who has me as giftee): WIN (Show celebration).

If Scan fails: LOSE LIFE. (Update participants.lives).

If Lives == 0: Game Over for guesser.

3. UI/UX Guidelines (Theme: "Modern Midnight Christmas")
Colors: Deep Blue/Slate background (slate-950), Vibrant Red Accents (red-500), Gold/Yellow for winners (yellow-400).

Typography: Sans-serif, bold headings, readable inputs.

Components (Shadcn):

Card for profiles and gifts.

Drawer for forms (mobile friendly).

Toast for actions (Item added, Wrong QR).

Avatar for users.

Motion: Use AnimatePresence for page transitions and the "Reveal" moment.

4. Implementation Steps for AI
Setup: Initialize Next.js, Shadcn (Button, Input, Card, Drawer, Dialog, Avatar, Toast), Supabase Client.

Database: Create migration file based on schema above.

Auth: Implement Login/Register pages.

Logic: Create useSecretSanta hook to handle group joining and wishlist fetching.
Draw Logic: Implement the shuffling algorithm (fisher-yates) inside a server action or Supabase function to ensure atomic updates.
UI Construction: Build the screens defined in User Flow.

QR Feature: Implement the Scanner component last.

GOAL: Fully functional MVP ready to deploy to Vercel.

Nota: react-qr-reader a veces da problemas con React 18 strict mode, si la AI se traba, dile que use react-html5-qrcode-scanner o una implementación custom simple

## Recommended Project Structure

/app
  /auth
    /login/page.tsx
    /callback/route.ts
  /dashboard
    /page.tsx         (List of groups)
    /group
      /[id]
        /page.tsx     (Group Details / Participant List / My Giftee Card)
        /draw-action.ts (Server action for the admin to trigger draw)
  /profile
    /[id]/page.tsx    (View wishlist, challenge button)
    /edit/page.tsx    (Edit own wishlist)
  /game
    /scan/page.tsx    (The QR Scanner UI)
  layout.tsx          (Main layout with Toaster & AuthProvider)
  page.tsx            (Landing)

/components
  /ui                 (Shadcn components)
  /santa
    ParticipantList.tsx
    GifteeRevealCard.tsx (The explosion animation)
    WishlistGrid.tsx
    QRDisplay.tsx     (Shows my user QR)
    QRScanner.tsx     (Handles camera logic)

/lib
  supabase/
    client.ts
    server.ts
  utils.ts

/types
  database.types.ts   (Generated from Supabase)