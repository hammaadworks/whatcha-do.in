CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_base TEXT;
    proposed_username TEXT;
    random_suffix TEXT;
    is_unique BOOLEAN;
BEGIN
    -- Extract the local part of the email
    username_base := LOWER(SPLIT_PART(NEW.email, '@', 1));
    proposed_username := username_base;

    -- Loop to ensure username uniqueness
    LOOP
        SELECT public.check_username_uniqueness(proposed_username) INTO is_unique;
        IF is_unique THEN
            EXIT;
        END IF;

        -- If not unique, append a random 3-digit number
        random_suffix := LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        proposed_username := username_base || '_' || random_suffix;
    END LOOP;

    -- Insert into public.users
    INSERT INTO public.users (id, email, username)
    VALUES (NEW.id, NEW.email, proposed_username);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;