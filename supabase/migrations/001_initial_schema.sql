-- Purpose: Initial schema for footy tipping application
-- Author: GitHub Copilot
-- Date: 2025-12-08
-- Description: Creates users table with authentication and profile data

-- Create users table
CREATE TABLE public.users (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid,
    first_name character varying(100) NOT NULL,
    surname character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    state character varying(3) NOT NULL,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add unique constraints
ALTER TABLE public.users
ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE public.users
ADD CONSTRAINT users_username_key UNIQUE (username);

-- Create indexes for performance
CREATE INDEX idx_users_auth_id ON public.users USING btree (auth_user_id);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_username ON public.users USING btree (username);

-- Add comments
COMMENT ON TABLE public.users IS 'Stores user account information for footy tipping application';
COMMENT ON COLUMN public.users.auth_user_id IS 'Reference to Supabase Auth user (if using Supabase Auth)';
COMMENT ON COLUMN public.users.state IS 'Australian state abbreviation (NSW, VIC, QLD, etc.)';
