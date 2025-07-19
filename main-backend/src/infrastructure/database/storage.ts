import { createClient } from "@supabase/supabase-js";
import e from "express";
// -- สร้าง Instance ของ Repository --

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };