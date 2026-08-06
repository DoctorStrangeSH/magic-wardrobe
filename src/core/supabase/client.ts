import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://7slqozeltertgiw3derl4a.supabase.co'
const supabaseAnonKey = 'sb_publishable_7sLQOZELteRTgiw3dErl4A_rfQIhCEy'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)