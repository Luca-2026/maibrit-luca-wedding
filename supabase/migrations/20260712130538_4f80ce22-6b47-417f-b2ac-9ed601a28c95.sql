CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  attending boolean NOT NULL,
  party_size integer NOT NULL DEFAULT 1,
  companions text,
  message text
);

GRANT INSERT ON public.rsvps TO anon, authenticated;
GRANT ALL ON public.rsvps TO service_role;

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an rsvp"
  ON public.rsvps
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 120
    AND (companions IS NULL OR length(companions) <= 500)
    AND (message IS NULL OR length(message) <= 1000)
    AND party_size BETWEEN 1 AND 10
  );