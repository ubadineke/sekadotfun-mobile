import { createContext, type PropsWithChildren, use, useMemo, useState, useEffect } from 'react'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { AppConfig } from '@/constants/app-config'
import { Account, useAuthorization } from '@/components/solana/use-authorization'
import { useMutation } from '@tanstack/react-query'
import { apiService } from '@/services/api'
import bs58 from 'bs58'
import 'text-encoding-polyfill'

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  signIn: () => Promise<Account>
  signOut: () => Promise<void>
}

const Context = createContext<AuthState>({} as AuthState)

export function useAuth() {
  const value = use(Context)
  if (!value) {
    throw new Error('useAuth must be wrapped in a <AuthProvider />')
  }

  return value
}



function useSignInMutation() {
  const { signIn, signMessage, disconnect } = useMobileWallet()

  return useMutation({
    mutationFn: async () => {
      // 1. Connect Wallet
      const account = await signIn({
        uri: AppConfig.uri,
      })

      try {
        // 2. Request Challenge
        const walletAddress = account.publicKey.toBase58()
        console.log('Requesting challenge for:', walletAddress)
        const challenge = await apiService.requestChallenge(walletAddress)

        // 3. Sign Challenge
        const encodedChallenge = new TextEncoder().encode(challenge)
        const signatureBytes = await signMessage(encodedChallenge)
        const signature = bs58.encode(signatureBytes)

        // 4. Verify & Login
        console.log('Verifying signature...')
        const result = await apiService.verifyChallenge({
          walletAddress,
          challenge,
          signature,
        })


        if (result.accessToken) {
          console.log('Backend auth success')
          await apiService.setAuthToken(result.accessToken)
          return { account, user: result.user }
        } else {
          throw new Error('Authentication failed: No access token received')
        }

      } catch (e) {
        console.error('Auth flow failed:', e)
        // Disconnect if backend auth fails
        await disconnect()
        throw e
      }
    },
  })
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { disconnect } = useMobileWallet()
  const { accounts, isLoading } = useAuthorization()
  const signInMutation = useSignInMutation()

  // We need to store the user in local state since useAuthorization only handles connection
  const [user, setUser] = useState<any>(null)

  // Hydrate user on mount or account change?
  // Ideally we persist user info or re-fetch it.
  // For now, let's rely on signIn setting it, or maybe a separate fetchMe?
  // Since we don't have persistence for user object logic easily here without adding more,
  // we can update it when signIn completes.

  useEffect(() => {
    if (signInMutation.isSuccess && signInMutation.data?.user) {
      setUser(signInMutation.data.user)
    }
  }, [signInMutation.isSuccess, signInMutation.data])


  const value: AuthState = useMemo(
    () => ({
      signIn: async () => {
        const res = await signInMutation.mutateAsync()
        return res.account
      },
      signOut: async () => {
        setUser(null)
        await disconnect()
      },
      isAuthenticated: (accounts?.length ?? 0) > 0,
      isLoading: signInMutation.isPending || isLoading,
      user,
    }),
    [accounts, disconnect, signInMutation, isLoading, user],
  )

  return <Context value={value}>{children}</Context>
}
