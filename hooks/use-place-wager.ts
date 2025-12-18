import { useCallback, useState } from 'react'
import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    ComputeBudgetProgram,
} from '@solana/web3.js'
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    createSyncNativeInstruction,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { AnchorProvider, Program, BN, Idl } from '@coral-xyz/anchor'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useCluster } from '@/components/cluster/cluster-provider'
import { PROGRAM_ID, SKR_MINT, getConfigPDA, getVotePDA } from '@/constants/program-config'
import { apiService } from '@/services/api'
import { SekadotfunEscrow } from '@/idl/sekadotfun-escrow'
import IDL from "@/idl/sekadotfun_escrow.json"
import axios from 'axios'

export interface PlaceWagerParams {
    betPda: string
    betIdBackend: number // Database ID for backend notification
    side: 'yes' | 'no'
    amount: number // Amount in Lamports (or smallest unit of token)
}

export interface PlaceWagerResult {
    signature: string
}

/**
 * Hook for placing wagers on-chain and notifying the backend
 */
export function usePlaceWager() {
    const { signAndSendTransaction } = useMobileWallet()
    const { selectedAccount } = useAuthorization()
    const { selectedCluster } = useCluster()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const placeWager = useCallback(
        async (params: PlaceWagerParams): Promise<PlaceWagerResult> => {
            if (!selectedAccount) {
                throw new Error('Wallet not connected')
            }

            setIsLoading(true)
            setError(null)

            try {
                const connection = new Connection(selectedCluster.endpoint)
                const user = selectedAccount.publicKey
                const betPda = new PublicKey(params.betPda)

                // 1. Setup Anchor Provider (Dummy Wallet)
                const dummyWallet = {
                    publicKey: user,
                    signTransaction: async () => { throw new Error('Not implemented') },
                    signAllTransactions: async () => { throw new Error('Not implemented') }
                }
                const provider = new AnchorProvider(connection, dummyWallet, {})
                console.log('Buffer check inside hook:', typeof Buffer.prototype.readUIntLE)
                const program = new Program<SekadotfunEscrow>(IDL, provider);

                // 2. Fetch Bet Account to get On-Chain Bet ID
                console.log('Fetching bet account:', betPda.toBase58())
                console.log("Got here")
                const betAccount = await program.account.bet.fetch(betPda)
                console.log('Bet Account:', betAccount)
                const betIdOnChain = betAccount.betId as BN // This is a BN

                console.log('Bet ID On-Chain:', betIdOnChain.toString())

                // 3. Derive PDAs
                // Escrow is the ATA of the Bet PDA for the Token Mint
                const escrow = await getAssociatedTokenAddress(SKR_MINT, betPda, true)
                const [configPda] = getConfigPDA()
                const [votePda] = getVotePDA(BigInt(betIdOnChain.toString()), user)

                // User Token Account (wSOL)
                const userToken = await getAssociatedTokenAddress(SKR_MINT, user)

                // Check Config Account existence (Debug)
                const configInfo = await connection.getAccountInfo(configPda)
                if (!configInfo) {
                    throw new Error(`Config account not initialized at ${configPda.toBase58()}. Please run initializeConfig.`)
                }

                // 4. Prepare Instructions
                const transaction = new Transaction()

                // Check if User Token Account exists
                const userTokenInfo = await connection.getAccountInfo(userToken)

                if (!userTokenInfo) {
                    console.log('Creating User wSOL ATA...')
                    transaction.add(
                        createAssociatedTokenAccountInstruction(
                            user,
                            userToken,
                            user,
                            SKR_MINT
                        )
                    )
                }

                // Wrap SOL: Transfer SOL to ATA & Sync
                console.log(' wrapping SOL:', params.amount)
                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: user,
                        toPubkey: userToken,
                        lamports: params.amount,
                    }),
                    createSyncNativeInstruction(userToken)
                )
                console.log("Wetin dey sup");

                // 5. Build ApplyBet Instruction
                const sideBool = params.side === 'yes'

                console.log("Got to this extent");
                const instruction = await program.methods
                    .applyBet(betIdOnChain, sideBool, new BN(params.amount.toString()))
                    .accounts({
                        bet: betPda,
                        vote: votePda,
                        escrow: escrow,
                        userToken: userToken,
                        user: user,
                        config: configPda,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .instruction()

                transaction.add(instruction)

                // 6. Sign and Send
                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
                transaction.recentBlockhash = blockhash
                transaction.feePayer = user
                transaction.lastValidBlockHeight = lastValidBlockHeight

                const { context } = await connection.getLatestBlockhashAndContext()
                const signature = await signAndSendTransaction(transaction, context.slot)

                console.log('Wager transaction sent:', signature)

                // 7. Confirm Transaction
                await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight,
                })

                console.log('Wager confirmed on-chain')

                // 8. Notify Backend with Vote PDA
                try {
                    await apiService.vote({
                        betId: params.betIdBackend,
                        choice: sideBool,
                        amount: params.amount,
                        pda: votePda.toBase58(),
                    })
                    console.log('Backend notified of wager with PDA:', votePda.toBase58())
                } catch (beError) {
                    console.error('Backend notification failed:', beError)
                    // Don't fail the whole operation if backend fails
                }

                return { signature }

            } catch (err) {
                console.error('Place wager error:', err)
                const message = err instanceof Error ? err.message : 'Failed to place wager'
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [selectedAccount, selectedCluster.endpoint, signAndSendTransaction]
    )

    return {
        placeWager,
        isLoading,
        error
    }
}
