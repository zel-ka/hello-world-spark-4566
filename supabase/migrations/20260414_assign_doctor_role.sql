-- Assign doctor role to user with email ayoubzela@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'doctor'::public.app_role
FROM auth.users
WHERE email = 'ayoubzela@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
