import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useCluster } from '@/components/cluster/cluster-provider'
import { Connection } from '@solana/web3.js'
import { useState, useEffect, useCallback } from 'react'
import { formatSol } from '@/utils/format'

export function useAccountBalance() {
    const { selectedAccount } = useAuthorization()
    const { selectedCluster } = useCluster()
    const [balance, setBalance] = useState<number>(0)
    const [formattedBalance, setFormattedBalance] = useState<string>('0.00')

    const fetchBalance = useCallback(async () => {
        if (!selectedAccount) return

        try {
            const connection = new Connection(selectedCluster.endpoint)
            const lamports = await connection.getBalance(selectedAccount.publicKey)
            setBalance(lamports)
            setFormattedBalance(formatSol(lamports))
        } catch (e) {
            console.error('Failed to fetch balance:', e)
        }
    }, [selectedAccount, selectedCluster.endpoint])

    useEffect(() => {
        fetchBalance()
        // Poll every 10 seconds
        const interval = setInterval(fetchBalance, 10000)
        return () => clearInterval(interval)
    }, [fetchBalance])

    return { balance, formattedBalance, fetchBalance }
}
