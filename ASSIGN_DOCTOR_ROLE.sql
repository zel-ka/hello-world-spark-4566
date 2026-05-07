-- ============================================================================
-- Assign Doctor Role to ayoubzela@gmail.com
-- ============================================================================
-- Run this in Supabase SQL Editor to assign doctor role

-- Step 1: Get the user ID for ayoubzela@gmail.com
SELECT id, email FROM auth.users WHERE email = 'ayoubzela@gmail.com';

-- Step 2: Insert doctor role (replace USER_ID with actual ID from Step 1)
-- Example: If user ID is 'abc-123-def', run:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('abc-123-def', 'doctor')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Or run this combined query that does it all:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'doctor'::public.app_role
FROM auth.users
WHERE email = 'ayoubzela@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify: Check if doctor role was assigned
SELECT user_id, role FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'ayoubzela@gmail.com');

-- Also check patient role if exists
SELECT 'Checking all roles for ayoubzela@gmail.com:';
SELECT ur.user_id, ur.role, au.email 
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'ayoubzela@gmail.com';
