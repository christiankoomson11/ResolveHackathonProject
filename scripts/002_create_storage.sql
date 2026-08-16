-- Storage setup for case documents
-- Version 1.0

-- Create the private bucket used for case document uploads
insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false)
on conflict (id) do nothing;

-- RLS policies for the case-documents bucket
-- Users can read files for cases they can access (owner, or staff/admin)
create policy "Users can read case documents"
  on storage.objects
  for select
  using (
    bucket_id = 'case-documents' and (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('staff', 'admin')
      )
      or owner = auth.uid()
    )
  );

-- Authenticated users can upload files they own
create policy "Users can upload case documents"
  on storage.objects
  for insert
  with check (
    bucket_id = 'case-documents'
    and auth.uid() is not null
    and owner = auth.uid()
  );

-- Owners and admins can delete files
create policy "Users can delete own case documents"
  on storage.objects
  for delete
  using (
    bucket_id = 'case-documents' and (
      owner = auth.uid()
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );
