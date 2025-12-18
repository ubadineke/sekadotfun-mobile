import { useCallback, useState, useEffect } from 'react'
import { Alert } from 'react-native'
import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
} from '@solana/web3.js'
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { AnchorProvider, Program, BN, Idl } from '@coral-xyz/anchor'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useCluster } from '@/components/cluster/cluster-provider'
import { PROGRAM_ID, SKR_MINT, getBetPDA, API_BASE_URL } from '@/constants/program-config'
import { apiService } from '@/services/api'
import { SekadotfunEscrow } from '@/idl/sekadotfun-escrow'
import IDL from "@/idl/sekadotfun_escrow.json"
import axios from 'axios'

export interface CreateBetParams {
    description: string
    decisionMethod: 'voting' | 'creatorDecides'
    type: 'private' | 'public'
    endsAt: Date
}

export interface CreateBetResult {
    signature: string
    betPda: string
    betId: bigint
}

/**
 * Hook for creating bets on-chain and notifying the backend
 */
export function useCreateBet() {
    const { signAndSendTransaction } = useMobileWallet()
    const { selectedAccount } = useAuthorization()
    const { selectedCluster } = useCluster()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        console.log('useCreateBet hook mounted. API URL:', API_BASE_URL)
    }, [])

    const createBet = useCallback(
        async (params: CreateBetParams): Promise<CreateBetResult> => {
            if (!selectedAccount) {
                throw new Error('Wallet not connected')
            }

            setIsLoading(true)
            setError(null)

            try {
                const connection = new Connection(selectedCluster.endpoint)
                const creator = selectedAccount.publicKey

                // Generate a unique bet ID based on timestamp + random
                const betId = BigInt(Date.now()) * BigInt(1000) + BigInt(Math.floor(Math.random() * 1000))

                // Ensure end time is in the future and valid
                const endTimeUnix = BigInt(Math.floor(params.endsAt.getTime() / 1000))

                // Derive PDAs
                const [betPda] = getBetPDA(betId)
                const escrow = await getAssociatedTokenAddress(SKR_MINT, betPda, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

                // Setup Anchor Provider
                // We use a dummy wallet for the provider since we sign with MWA
                const dummyWallet = {
                    publicKey: creator,
                    signTransaction: async () => { throw new Error('Not implemented') },
                    signAllTransactions: async () => { throw new Error('Not implemented') }
                }

                const provider = new AnchorProvider(connection, dummyWallet, {})
                // Initialize the program with the IDL
                // Casting IDL to any to avoid strict type checks on the JSON object
                const program = new Program<SekadotfunEscrow>(IDL, provider)

                // Build the Create Bet instruction using the Anchor interface
                // This automatically handles the discriminator and argument encoding
                const instruction = await program.methods
                    .createBet(new BN(betId.toString()), new BN(endTimeUnix.toString()))
                    .accounts({
                        bet: betPda,
                        escrow: escrow,
                        creator: creator,
                        skrMint: SKR_MINT,
                        systemProgram: SystemProgram.programId,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    })
                    .instruction()

                // Build the transaction
                const transaction = new Transaction()
                transaction.add(instruction)

                // Get latest blockhash
                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
                transaction.recentBlockhash = blockhash
                transaction.feePayer = creator
                transaction.lastValidBlockHeight = lastValidBlockHeight

                // Sign and send via mobile wallet
                const { context } = await connection.getLatestBlockhashAndContext()
                const signature = await signAndSendTransaction(transaction, context.slot)

                console.log('Transaction sent! Signature:', signature)

                // Wait for confirmation
                try {
                    await connection.confirmTransaction({
                        signature,
                        blockhash,
                        lastValidBlockHeight,
                    })
                    console.log('Bet created successfully! Signature:', signature)
                } catch (confirmError) {
                    // Start fetching logs if confirmation fails
                    const tx = await connection.getTransaction(signature, {
                        commitment: 'confirmed',
                        maxSupportedTransactionVersion: 0,
                    })

                    if (tx && tx.meta && tx.meta.logMessages) {
                        console.error('Transaction logs:', tx.meta.logMessages)
                        throw new Error(`Transaction failed with logs:\n${tx.meta.logMessages.join('\n')}`)
                    }

                    throw confirmError
                }

                // Notify backend
                try {
                    console.log('Notifying backend at URL:', API_BASE_URL)
                    const backendRes = await apiService.createBet({
                        description: params.description,
                        pda: betPda.toBase58(),
                        decisionMethod: params.decisionMethod,
                        type: params.type,
                        endsAt: params.endsAt,
                        createdAt: new Date(),
                    })
                    console.log('Backend notified successfully:', backendRes)
                } catch (backendError) {
                    // Log but don't fail - the on-chain transaction succeeded
                    console.error('Failed to notify backend:', backendError)
                    if (axios.isAxiosError(backendError)) {
                        const error = backendError as any;
                        console.error('Axios Error Details:', {
                            message: error.message,
                            code: error.code,
                            response: error.response?.data,
                            request: error.request?._url || error.config?.url
                        })
                    }
                }

                return {
                    signature,
                    betPda: betPda.toBase58(),
                    betId,
                }
            } catch (err) {
                console.error('Create bet error:', err)
                const message = err instanceof Error ? err.message : 'Failed to create bet'
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [selectedAccount, selectedCluster.endpoint, signAndSendTransaction],
    )

    return {
        createBet,
        isLoading,
        error,
    }
}
