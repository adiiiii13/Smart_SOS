import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import { createWelcomeNotification } from '../lib/notificationUtils'
import { createProfile, findProfileByUserId } from '../lib/supabaseUtils'

// Lightweight adapter so existing code using user.uid continues to work
export interface AppUser {
  id: string
  uid: string // alias for id (Firebase compatibility)
  email: string | null
  displayName: string | null
  phoneNumber: string | null
}

type AuthContextType = {
  user: AppUser | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, phone: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)

  // Convert Supabase session user to AppUser
  const toAppUser = (u: any): AppUser => ({
    id: u.id,
    uid: u.id,
    email: u.email,
    displayName: u.user_metadata?.full_name || u.user_metadata?.name || null,
    phoneNumber: u.phone || u.phone_number || null
  })

  useEffect(() => {
    let mounted = true
    // Initial session fetch
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data.session?.user) setUser(toAppUser(data.session.user))
    })
    // Auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return
      if (session?.user) {
        setUser(toAppUser(session.user))
      } else {
        setUser(null)
      }
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (name: string, email: string, phone: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone } }
    })
    if (error) throw error
    if (data.user) {
      try {
  // Ensure custom users table row (needed for FK in emergencies)
  await ensureUserRow(data.user.id, email, name, phone)
        // Create profile row
        await createProfile({
          user_id: data.user.id,
          full_name: name,
          email,
            phone
        })
        await createWelcomeNotification(data.user.id, name)
      } catch (e) {
        console.error('Profile creation / welcome notification failed', e)
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) throw error
    // After redirect, onAuthStateChange will trigger. Profile creation handled lazily below.
  }

  // Ensure a profile exists once user is set
  useEffect(() => {
    if (!user) return
    (async () => {
      try {
        await ensureUserRow(user.id, user.email || '', user.displayName || 'User', user.phoneNumber || '')
        await findProfileByUserId(user.id)
      } catch (e: any) {
        // If not found, create
        try {
          await createProfile({
            user_id: user.id,
            full_name: user.displayName || 'User',
            email: user.email || '',
            phone: user.phoneNumber || ''
          })
          await createWelcomeNotification(user.id, user.displayName || 'User')
        } catch (err) {
          console.error('Failed to auto-create profile', err)
        }
      }
    })()
  }, [user?.id])

  // Helper to ensure a row exists in custom users table for FK references
  const ensureUserRow = async (id: string, email: string, name: string, phone?: string | null) => {
    try {
      const { data: existing, error } = await supabase
        .from(TABLES.USERS)
        .select('id')
        .eq('id', id)
        .maybeSingle()
      if (error) {
        // If table missing or permission issue, log and continue (won't block auth)
        console.warn('users table select error (can ignore if schema changed):', error.message)
        return
      }
      if (!existing) {
        const { error: insertErr } = await supabase
          .from(TABLES.USERS)
          .insert([{ id, email, display_name: name, phone }])
        if (insertErr) console.warn('users table insert failed:', insertErr.message)
      }
    } catch (err) {
      console.warn('ensureUserRow unexpected error:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, resetPassword, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
