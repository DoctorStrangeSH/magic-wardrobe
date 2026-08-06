import { create } from 'zustand'
import { supabase } from '../core/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  username: string | null
  role: 'user' | 'admin'
}

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean

  initAuth: () => Promise<void>
  signUp: (email: string, password: string, username?: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  loadProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,

  initAuth: async () => {
    set({ isLoading: true })
    
    // Получаем текущую сессию
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      set({ user: session.user, session })
      await get().loadProfile()
    } else {
      set({ isLoading: false })
    }

    // Слушаем изменения авторизации
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ user: session.user, session })
        await get().loadProfile()
      } else {
        set({ user: null, session: null, profile: null, isAdmin: false, isLoading: false })
      }
    })
  },

  loadProfile: async () => {
    const { user } = get()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      set({ 
        profile: profile as Profile, 
        isAdmin: profile.role === 'admin',
        isLoading: false 
      })
    }
  },

  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      set({ user: data.user, session: data.session })
      await get().loadProfile()
    }

    return {}
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      set({ user: data.user, session: data.session })
      await get().loadProfile()
    }

    return {}
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null, isAdmin: false })
  },
}))