// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gotkrzjpuwfpsfqviwsi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGtyempwdXdmcHNmcXZpd3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0OTcxMDEsImV4cCI6MjA1ODA3MzEwMX0._fSG6Nbzz6lBkkNP4UmSWUk8ahWQlDBQX8D0uosACms";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);