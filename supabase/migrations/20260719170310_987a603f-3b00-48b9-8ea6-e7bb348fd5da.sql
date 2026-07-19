revoke execute on function public.grant_admin_for_owner_email() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;