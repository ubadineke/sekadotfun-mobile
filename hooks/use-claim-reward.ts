import { useCallback, useState } from 'react'
import {
    Connection,
    PublicKey,
    Transaction,
    AccountInfo,
} from '@solana/web3.js'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useCluster } from '@/components/cluster/cluster-provider'
import { PROGRAM_ID, getConfigPDA, getVotePDA } from '@/constants/program-config'
import { SekadotfunEscrow } from '@/idl/sekadotfun-escrow'
import IDL from "@/idl/sekadotfun_escrow.json"

export interface ClaimRewardParams {
    betPda: string
    votePda?: string // Optional: stored from when wager was placed
}

export function useClaimReward() {
    const { signAndSendTransaction } = useMobileWallet()
    const { selectedAccount } = useAuthorization()
    const { selectedCluster } = useCluster()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const claimReward = useCallback(
        async (params: ClaimRewardParams) => {
            if (!selectedAccount) {
                throw new Error('Wallet not connected')
            }

            setIsLoading(true)
            setError(null)

            try {
                const connection = new Connection(selectedCluster.endpoint)
                const user = selectedAccount.publicKey
                const betPda = new PublicKey(params.betPda)

                // 1. Setup Anchor Provider
                const dummyWallet = {
                    publicKey: user,
                    signTransaction: async () => { throw new Error('Not implemented') },
                    signAllTransactions: async () => { throw new Error('Not implemented') }
                }
                const provider = new AnchorProvider(connection, dummyWallet, {})
                const program = new Program<SekadotfunEscrow>(IDL as any, provider);

                // 2. Fetch Bet & Vote info
                const betAccount = await program.account.bet.fetch(betPda)
                const betIdOnChain = betAccount.betId as BN

                // 3. Derive PDAs & Fetch Config
                const [configPda] = getConfigPDA()

                // Fetch config to get the actual SKR mint
                const configAccount = await program.account.config.fetch(configPda);
                const skrMint = configAccount.skrMint as PublicKey;
                console.log("SKR Mint from config:", skrMint.toBase58());

                // Validate Mint
                const mintInfo = await connection.getAccountInfo(skrMint);
                if (!mintInfo) {
                    throw new Error(`SKR Mint account not found at ${skrMint.toBase58()}`);
                }
                const tokenProgramId = mintInfo.owner;
                console.log("SKR Mint program ID:", tokenProgramId.toBase58());

                if (tokenProgramId.toBase58() !== TOKEN_PROGRAM_ID.toBase58() &&
                    tokenProgramId.toBase58() !== 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') { // Token-2022
                    if (tokenProgramId.toBase58() === '11111111111111111111111111111111') {
                        throw new Error(`Configured SKR Mint (${skrMint.toBase58()}) is a System Account (Wallet?). It must be a SPL Token Mint.`);
                    }
                    throw new Error(`Configured SKR Mint owner is ${tokenProgramId.toBase58()}, expected Token Program.`);
                }

                // 3. Determine Vote PDA
                const [derivedVotePda] = getVotePDA(BigInt(betIdOnChain.toString()), user);
                let votePda: PublicKey = derivedVotePda;

                // If stored PDA is provided, try that first
                if (params.votePda) {
                    try {
                        votePda = new PublicKey(params.votePda);
                    } catch (e) {
                        console.warn("Invalid stored Vote PDA, using derived:", e);
                        votePda = derivedVotePda;
                    }
                }

                // 4. Verify Vote Account Existence & Fallback
                console.log("Checking Vote PDA:", votePda.toBase58());
                let voteInfo = await connection.getAccountInfo(votePda);

                // If stored PDA was used but not found, fallback to derived
                if (!voteInfo && votePda.toBase58() !== derivedVotePda.toBase58()) {
                    console.warn("Stored Vote PDA not found on-chain. Falling back to derived PDA.");
                    votePda = derivedVotePda;
                    console.log("Checking Derived Vote PDA:", votePda.toBase58());
                    voteInfo = await connection.getAccountInfo(votePda);
                }

                if (!voteInfo) {
                    throw new Error(`Vote account not found on chain. \nDerived: ${derivedVotePda.toBase58()}\nStored Input: ${params.votePda || 'None'}`);
                }

                const escrow = await getAssociatedTokenAddress(skrMint, betPda, true)
                const userToken = await getAssociatedTokenAddress(skrMint, user)

                // Debug / Pre-flight Checks
                console.log("User Token Address:", userToken.toBase58());
                const userTokenInfo = await connection.getAccountInfo(userToken);

                // 4. Build Transaction
                const transaction = new Transaction()

                // If user token account doesn't exist, add instruction to create it first
                if (!userTokenInfo) {
                    console.log("User token account doesn't exist, creating it...");
                    const createAtaIx = createAssociatedTokenAccountInstruction(
                        user,           // payer
                        userToken,      // ata address
                        user,           // owner
                        skrMint,        // mint
                        tokenProgramId,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    );
                    transaction.add(createAtaIx);
                }

                // Build Claim Instruction
                const claimIx = await program.methods
                    .claimReward(betIdOnChain)
                    .accounts({
                        bet: betPda,
                        vote: votePda,
                        escrow: escrow,
                        userToken: userToken,
                        user: user,
                        config: configPda,
                        tokenProgram: tokenProgramId,
                    })
                    .instruction()

                transaction.add(claimIx)

                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
                transaction.recentBlockhash = blockhash
                transaction.feePayer = user
                transaction.lastValidBlockHeight = lastValidBlockHeight

                // 5. Simulate Transaction
                console.log('Simulating transaction...')
                try {
                    const simulation = await connection.simulateTransaction(transaction);
                    console.log('Simulation logs:', simulation.value.logs);
                    if (simulation.value.err) {
                        console.error('Simulation Error:', simulation.value.err);
                        throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}\nLogs: ${simulation.value.logs?.join('\n')}`);
                    }
                } catch (simErr) {
                    console.error('Simulation check failed:', simErr);
                    // If simulation throws explicitly, rethrow
                    if (String(simErr).includes('Simulation failed')) throw simErr;
                }

                // 6. Sign and Send
                const { context } = await connection.getLatestBlockhashAndContext()
                console.log('Sending transaction...')
                let signature: string | undefined;

                try {
                    signature = await signAndSendTransaction(transaction, context.slot)
                    console.log('Claim transaction sent:', signature)

                    // Wait for confirmation
                    const confirmation = await connection.confirmTransaction({
                        signature,
                        blockhash,
                        lastValidBlockHeight,
                    }, 'confirmed');

                    if (confirmation.value.err) {
                        console.error('Confirmation Error:', confirmation.value.err);
                        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
                    }

                    // Fetch logs specifically
                    try {
                        const tx = await connection.getTransaction(signature, {
                            commitment: 'confirmed',
                            maxSupportedTransactionVersion: 0
                        });
                        console.log("Tx Logs:", tx?.meta?.logMessages);

                        if (tx?.meta?.err) {
                            console.log('=== PROGRAM LOGS (FAILURE) ===');
                            tx.meta.logMessages?.forEach(log => console.log(log));
                            console.log('==============================');
                        }
                    } catch (logErr) {
                        console.log("Could not fetch detailed logs:", logErr);
                    }

                    console.log('Reward Claimed!')
                    return signature

                } catch (txErr) {
                    console.error('Transaction flow error:', txErr);
                    // attempt to get logs if we have a signature
                    if (signature) {
                        try {
                            // wait a brief moment for propagation
                            await new Promise(r => setTimeout(r, 2000));
                            const tx = await connection.getTransaction(signature, {
                                commitment: 'confirmed',
                                maxSupportedTransactionVersion: 0
                            });
                            if (tx?.meta?.logMessages) {
                                console.log('=== FAILURE LOGS ===');
                                tx.meta.logMessages.forEach(log => console.log(log));
                                console.log('====================');
                            }
                        } catch (e) {
                            console.log("Failed to fetch failure logs:", e);
                        }
                    }
                    throw txErr;
                }

            } catch (err) {
                console.error('Claim reward error:', err)
                const message = err instanceof Error ? err.message : 'Failed to claim reward'
                setError(message)
                throw err
            } finally {
                setIsLoading(false)
            }
        },
        [selectedAccount, selectedCluster.endpoint, signAndSendTransaction]
    )

    return {
        claimReward,
        isLoading,
        error
    }
}
