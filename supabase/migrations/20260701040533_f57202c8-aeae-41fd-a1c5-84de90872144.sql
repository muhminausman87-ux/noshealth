
DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@nos.local') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated',
      'admin@nos.local', crypt('Admin@12345', gen_salt('bf')),
      now(), now(), now(),
      jsonb_build_object('provider','email','providers', jsonb_build_array('email')),
      jsonb_build_object('full_name','System Administrator','title','Administrator'),
      false, false
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_id,
      jsonb_build_object('sub', new_id::text, 'email', 'admin@nos.local', 'email_verified', true),
      'email', new_id::text, now(), now(), now());
  END IF;
END $$;

-- Ensure profile exists (trigger may have created it)
INSERT INTO public.profiles (id, full_name, title)
SELECT u.id, 'System Administrator', 'Administrator'
FROM auth.users u
WHERE u.email = 'admin@nos.local'
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, title = EXCLUDED.title;

-- Assign admin role (remove any auto-added nurse role for this user)
DELETE FROM public.user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@nos.local')
  AND role <> 'admin';

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@nos.local'
ON CONFLICT (user_id, role) DO NOTHING;
