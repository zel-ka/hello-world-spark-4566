
-- Backfill profiles.phone from email prefix when empty and prefix is digits
UPDATE public.profiles p
SET phone = split_part(u.email, '@', 1)
FROM auth.users u
WHERE p.user_id = u.id
  AND (p.phone IS NULL OR p.phone = '')
  AND u.email IS NOT NULL
  AND split_part(u.email, '@', 1) ~ '^[0-9+]{7,15}$';

-- Update admin_list_users to prefer real phone, fallback to email prefix if numeric
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, full_name text, phone text, email text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    u.id AS user_id,
    COALESCE(p.full_name, '') AS full_name,
    COALESCE(
      NULLIF(p.phone, ''),
      NULLIF(u.phone, ''),
      CASE 
        WHEN split_part(COALESCE(u.email, ''), '@', 1) ~ '^[0-9+]{7,15}$'
          THEN split_part(u.email, '@', 1)
        ELSE ''
      END
    ) AS phone,
    COALESCE(u.email, '') AS email,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY u.created_at DESC
$function$;
