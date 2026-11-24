create extension if not exists "pgcrypto";

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  email text not null,
  avatar_url text,
  special_request text,
  ticket_type text not null,
  quantity integer not null check (quantity between 1 and 4),
  amount_cents integer not null default 0,
  currency text not null default 'ngn',
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  ticket_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings add column if not exists paystack_reference text unique;
alter table public.bookings alter column currency set default 'ngn';

alter table public.bookings enable row level security;

drop policy if exists "Attendees can view their bookings" on public.bookings;
create policy "Attendees can view their bookings"
on public.bookings for select
to authenticated
using (auth.jwt() ->> 'email' = email or auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('attendee-avatars', 'attendee-avatars', false)
on conflict (id) do nothing;
