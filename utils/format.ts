import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function formatSol(lamports: number): string {
    if (!lamports) return '0.00';
    return (lamports / LAMPORTS_PER_SOL).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    });
}
