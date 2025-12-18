import { useCallback, useState } from 'react'
import {
    Connection,
    PublicKey,
    Transaction,
} from '@solana/web3.js'
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useCluster } from '@/components/cluster/cluster-provider'
import { PROGRAM_ID, getConfigPDA } from '@/constants/program-config'
import { SekadotfunEscrow } from '@/idl/sekadotfun-escrow'
import IDL from "@/idl/sekadotfun_escrow.json"
import { apiService } from '@/services/api'

export interface ResolveBetParams {
    betPda: string
    betId: number
    outcome: 'yes' | 'no'
}

export function useResolveBet() {
    const { signAndSendTransaction } = useMobileWallet()
    const { selectedAccount } = useAuthorization()
    const { selectedCluster } = useCluster()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const resolveBet = useCallback(
        async (params: ResolveBetParams) => {
            if (!selectedAccount) {
                throw new Error('Wallet not connected')
            }

            setIsLoading(true)
            setError(null)

            try {
                const connection = new Connection(selectedCluster.endpoint)
                const authority = selectedAccount.publicKey
                const betPda = new PublicKey(params.betPda)

                // 1. Setup Anchor Provider
                const dummyWallet = {
                    publicKey: authority,
                    signTransaction: async () => { throw new Error('Not implemented') },
                    signAllTransactions: async () => { throw new Error('Not implemented') }
                }
                const provider = new AnchorProvider(connection, dummyWallet, {})
                const program = new Program<SekadotfunEscrow>(IDL as any, provider);

                // 2. Fetch Bet ID from Account
                const betAccount = await program.account.bet.fetch(betPda)
                const betIdOnChain = betAccount.betId as BN

                // 3. Derive PDAs
                const [configPda] = getConfigPDA()

                // 4. Build Instruction
                const outcomeBool = params.outcome === 'yes'

                const instruction = await program.methods
                    .finishBet(betIdOnChain, outcomeBool)
                    .accounts({
                        bet: betPda,
                        authority: authority,
                        config: configPda,
                    })
                    .instruction()

                // 5. Build Transaction
                const transaction = new Transaction()
                transaction.add(instruction)

                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
                transaction.recentBlockhash = blockhash
                transaction.feePayer = authority
                transaction.lastValidBlockHeight = lastValidBlockHeight

                // 6. Sign and Send
                const { context } = await connection.getLatestBlockhashAndContext()
                const signature = await signAndSendTransaction(transaction, context.slot)

                console.log('Resolve transaction sent:', signature)

                await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight,
                })

                // Sync backend database
                try {
                    await apiService.resolveBet(params.betId, params.outcome === 'yes');
                    console.log('Backend synced successfully');
                } catch (backendErr) {
                    console.error('Failed to sync backend (on-chain resolution succeeded):', backendErr);
                    // Don't throw - on-chain resolution was successful
                }

                console.log('Bet Resolved!')
                return signature

            } catch (err) {
                console.error('Resolve bet error:', err)
                const message = err instanceof Error ? err.message : 'Failed to resolve bet'
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [selectedAccount, selectedCluster.endpoint, signAndSendTransaction]
    )

    return {
        resolveBet,
        isLoading,
        error
    }
}
