
-- Move has_role out of the exposed public API schema into a private schema
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Only allow the roles that RLS policies evaluate under to execute it.
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Update dependent policy to use the private version
DROP POLICY IF EXISTS "Admins can read all rsvps" ON public.rsvps;
CREATE POLICY "Admins can read all rsvps"
ON public.rsvps
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Update trigger function that referenced public.has_role's schema search path (no direct call, safe)

-- Remove the public (API-exposed) SECURITY DEFINER function
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
