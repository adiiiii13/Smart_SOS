import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendEmailVerification, sendPasswordResetEmail, fetchSignInMethodsForEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

type AuthContextType = {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, phone: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (name: string, email: string, phone: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const createdUser = userCredential.user

      await setDoc(doc(db, 'profiles', createdUser.uid), {
        id: createdUser.uid,
        full_name: name,
        phone: phone,
        email: email
      })

      try {
        await sendEmailVerification(createdUser)
      } catch (_) {
        // non-fatal
      }
    } catch (err: any) {
      if (err && err.code === 'auth/email-already-in-use') {
        const methods = await fetchSignInMethodsForEmail(auth, email)
        const providerList = methods.length ? ` with: ${methods.join(', ')}` : ''
        throw new Error(`Email already has an account${providerList}. Please sign in or reset your password.`)
      }
      throw err
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const firebaseUser = result.user

    // Ensure profile document exists
    const profileRef = doc(db, 'profiles', firebaseUser.uid)
    const snap = await getDoc(profileRef)
    if (!snap.exists()) {
      await setDoc(profileRef, {
        id: firebaseUser.uid,
        full_name: firebaseUser.displayName ?? '',
        phone: firebaseUser.phoneNumber ?? '',
        email: firebaseUser.email ?? ''
      })
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
