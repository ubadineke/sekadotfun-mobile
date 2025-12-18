import { PublicKey } from '@solana/web3.js'

/**
 * Sekadotfun Escrow Program Configuration
 */
export const PROGRAM_ID = new PublicKey('4YmcnLt2J7ziAXpMF7AyNKNkuuiMoQ8bshyhkn6TrNvP')

/**
 * $SKR Token Mint Address
 * TODO: Replace with actual SKR mint address for your environment
 */
export const SKR_MINT = new PublicKey('So11111111111111111111111111111111111111112') // Placeholder - replace with actual SKR mint

/**
 * Backend API Configuration
 */
export const API_BASE_URL = 'https://6fd584dbacb2.ngrok-free.app'

/**
 * Derive the bet PDA from a bet ID
 */
export function getBetPDA(betId: bigint): [PublicKey, number] {
    const buffer = Buffer.alloc(8)
    buffer.writeBigUInt64LE(betId)
    return PublicKey.findProgramAddressSync([Buffer.from('bet'), buffer], PROGRAM_ID)
}

/**
 * Derive the config PDA
 */
export function getConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([Buffer.from('config')], PROGRAM_ID)
}

/**
 * Derive the vote PDA
 */
export function getVotePDA(betId: bigint, user: PublicKey): [PublicKey, number] {
    const buffer = Buffer.alloc(8)
    buffer.writeBigUInt64LE(betId)
    return PublicKey.findProgramAddressSync(
        [Buffer.from('vote'), buffer, user.toBuffer()],
        PROGRAM_ID
    )
}


