-- 1. Add invite_code to groups
alter table groups 
add column invite_code text unique default substr(md5(random()::text), 0, 7);

-- 2. Create index for faster lookups
create index groups_invite_code_idx on groups (invite_code);

-- 3. Update Profiles RLS for stricter privacy (Silo mode)
-- Drop old policy
drop policy "Profiles are viewable by everyone" on profiles;

-- Create new policy: Visible only if same group or it's me
-- Note: This is a bit complex for RLS performance, so for a simple app 
-- we often keep profiles public-read but restrict sensitive data. 
-- For strict silo:
create policy "Profiles visible to peers" 
  on profiles for select 
  using (
    id = auth.uid() -- It's me
    or 
    exists ( -- OR we share a group
      select 1 from participants p1
      join participants p2 on p1.group_id = p2.group_id
      where p1.user_id = profiles.id -- Profile being viewed
      and p2.user_id = auth.uid()   -- Me
    )
  );

-- 4. Allow any authenticated user to join a group via code (we need a function for this ideally, or open RLS)
-- Since we use Server Actions with Service Role for joining logic mostly, 
-- we can keep participants RLS simple:

create policy "Users can join groups" 
  on participants for insert 
  with check ( auth.uid() = user_id );
