
CREATE OR REPLACE FUNCTION public.claim_owner_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  em text;
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT lower(email) INTO em FROM auth.users WHERE id = uid;
  IF em IS NULL OR em <> 'maibritbreuer@gmail.com' THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_owner_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_owner_admin() TO authenticated;
