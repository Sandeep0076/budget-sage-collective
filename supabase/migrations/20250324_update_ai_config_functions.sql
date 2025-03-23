
-- Update the get_ai_config_for_user function to have proper return types
DROP FUNCTION IF EXISTS get_ai_config_for_user;

CREATE OR REPLACE FUNCTION get_ai_config_for_user(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  provider TEXT,
  api_key TEXT,
  model_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.id,
    ac.user_id,
    ac.provider,
    ac.api_key,
    ac.model_name,
    ac.created_at,
    ac.updated_at
  FROM 
    ai_config ac
  WHERE 
    ac.user_id = user_id_param;
END;
$$;

-- This function updates an existing AI config
-- It takes a config_id and the new values as parameters
DROP FUNCTION IF EXISTS update_ai_config;

CREATE OR REPLACE FUNCTION update_ai_config(
  config_id UUID,
  new_provider TEXT,
  new_api_key TEXT,
  new_model_name TEXT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  provider TEXT,
  api_key TEXT,
  model_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE ai_config
  SET 
    provider = new_provider,
    api_key = new_api_key,
    model_name = new_model_name,
    updated_at = now()
  WHERE 
    id = config_id;
    
  RETURN QUERY
  SELECT 
    ac.id,
    ac.user_id,
    ac.provider,
    ac.api_key,
    ac.model_name,
    ac.created_at,
    ac.updated_at
  FROM 
    ai_config ac
  WHERE 
    ac.id = config_id;
END;
$$;

-- This function inserts a new AI config for a user
CREATE OR REPLACE FUNCTION insert_ai_config(
  for_user_id UUID,
  new_provider TEXT,
  new_api_key TEXT,
  new_model_name TEXT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  provider TEXT,
  api_key TEXT,
  model_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Insert the new record
  INSERT INTO ai_config (
    user_id, 
    provider, 
    api_key, 
    model_name
  )
  VALUES (
    for_user_id,
    new_provider,
    new_api_key,
    new_model_name
  )
  RETURNING id INTO new_id;
  
  -- Return the newly created record
  RETURN QUERY
  SELECT 
    ac.id,
    ac.user_id,
    ac.provider,
    ac.api_key,
    ac.model_name,
    ac.created_at,
    ac.updated_at
  FROM 
    ai_config ac
  WHERE 
    ac.id = new_id;
END;
$$;
