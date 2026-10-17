-- Privacy-minimal aggregate homepage analytics.
-- No IP addresses, visitor IDs, or individual event rows are stored.
create table if not exists public.analytics_daily (
  day date primary key,
  views bigint not null default 0 check (views >= 0),
  updated_at timestamptz not null default now()
);

alter table public.analytics_daily enable row level security;
revoke all on public.analytics_daily from public, anon, authenticated;
grant all on public.analytics_daily to service_role;

create or replace function public.increment_portfolio_view(p_day date)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.analytics_daily (day, views)
  values (p_day, 1)
  on conflict (day) do update
  set views = public.analytics_daily.views + 1,
      updated_at = now();
$$;

revoke all on function public.increment_portfolio_view(date) from public, anon, authenticated;
grant execute on function public.increment_portfolio_view(date) to service_role;

-- Shared throttling for serverless instances. The application sends an HMAC
-- of the client IP, not the IP itself; expired buckets are deleted routinely.
create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  window_started_at timestamptz not null,
  hits integer not null default 0 check (hits >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists rate_limit_buckets_updated_idx
  on public.rate_limit_buckets (updated_at);

alter table public.rate_limit_buckets enable row level security;
revoke all on public.rate_limit_buckets from public, anon, authenticated;
grant all on public.rate_limit_buckets to service_role;

create or replace function public.consume_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_started timestamptz;
  v_hits integer;
begin
  if length(p_bucket_key) > 128
    or p_limit < 1 or p_limit > 1000
    or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit parameters';
  end if;

  insert into public.rate_limit_buckets (bucket_key, window_started_at, hits, updated_at)
  values (p_bucket_key, now(), 1, now())
  on conflict (bucket_key) do update
  set window_started_at = case
        when public.rate_limit_buckets.window_started_at + make_interval(secs => p_window_seconds) <= now()
          then now()
        else public.rate_limit_buckets.window_started_at
      end,
      hits = case
        when public.rate_limit_buckets.window_started_at + make_interval(secs => p_window_seconds) <= now()
          then 1
        else public.rate_limit_buckets.hits + 1
      end,
      updated_at = now()
  returning window_started_at, hits into v_started, v_hits;

  delete from public.rate_limit_buckets
  where updated_at < now() - interval '48 hours';

  return query select
    v_hits <= p_limit,
    greatest(p_limit - v_hits, 0),
    greatest(0, ceil(p_window_seconds - extract(epoch from (now() - v_started))))::integer;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
