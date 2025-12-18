import { useCallback, useEffect, useState, useRef } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor'
import { useCluster } from '@/components/cluster/cluster-provider'
import { PROGRAM_ID, getBetPDA, getVotePDA } from '@/constants/program-config'
import IDL from "@/idl/sekadotfun_escrow.json"
import { SekadotfunEscrow } from '@/idl/sekadotfun-escrow'

export interface BetAccount {
    betId: BN
    creator: PublicKey
    description: string
    createdAt: BN
    endsAt: BN
    totalYes: BN
    totalNo: BN
    outcome: boolean | null
    resolved: boolean
}

export interface VoteAccount {
    user: PublicKey
    betId: BN
    side: boolean
    amount: BN
    claimed: boolean
    bump: number
}

export function useBetChainData(betId: number | string | null, userPublicKeyString: string | null, betPdaString?: string) {
    const { selectedCluster } = useCluster()
    const [betOnChain, setBetOnChain] = useState<BetAccount | null>(null)
    const [voteOnChain, setVoteOnChain] = useState<VoteAccount | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const hasFetched = useRef(false)
    const lastBetId = useRef<string | number | null>(null)

    const fetchChainData = useCallback(async (force = false) => {
        if (!betId) return;

        // Prevent duplicate fetches for same bet unless forced
        if (!force && hasFetched.current && lastBetId.current === betId) {
            return;
        }

        hasFetched.current = true;
        lastBetId.current = betId;

        setLoading(true)
        setError(null)
        try {
            const connection = new Connection(selectedCluster.endpoint)
            const provider = new AnchorProvider(connection, {} as any, {})
            const program = new Program<SekadotfunEscrow>(IDL as any, provider)

            const betIdBN = BigInt(betId)
            const [derivedBetPda] = getBetPDA(betIdBN)

            let betPda = derivedBetPda;
            if (betPdaString) {
                try {
                    const providedPda = new PublicKey(betPdaString);
                    if (derivedBetPda.toBase58() !== providedPda.toBase58()) {
                        betPda = providedPda;
                    }
                } catch (e) {
                    console.error("Invalid provided pda", e);
                }
            }

            // Fetch Bet Account
            try {
                const betAcct: any = await program.account.bet.fetch(betPda)
                setBetOnChain({
                    ...betAcct,
                    resolved: betAcct.outcome !== null
                } as BetAccount)
            } catch (e) {
                setBetOnChain(null)
            }

            // Fetch Vote Account if user connected
            if (userPublicKeyString) {
                const userPublicKey = new PublicKey(userPublicKeyString);
                const [votePda] = getVotePDA(betIdBN, userPublicKey)
                try {
                    const voteAcct = await program.account.vote.fetch(votePda)
                    setVoteOnChain(voteAcct as unknown as VoteAccount)
                } catch (e) {
                    setVoteOnChain(null)
                }
            }

        } catch (err) {
            console.error("Error fetching chain data", err)
            setError(String(err))
        } finally {
            setLoading(false)
        }
    }, [betId, userPublicKeyString, selectedCluster.endpoint, betPdaString])

    useEffect(() => {
        // Reset fetch flag when betId changes
        if (lastBetId.current !== betId) {
            hasFetched.current = false;
        }
        fetchChainData()
    }, [fetchChainData, betId])

    // Manual refresh function that bypasses the guard
    const refresh = useCallback(() => {
        fetchChainData(true);
    }, [fetchChainData]);

    return {
        betOnChain,
        voteOnChain,
        loading,
        error,
        refresh
    }
}
