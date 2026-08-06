import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ykenhwmyyqfnqhqnevzm.supabase.co'
const supabaseAnonKey = 'sb_publishable_7sLQOZELteRTgiw3dErl4A_rfQIhCEy'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)