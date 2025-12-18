import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, Idl } from '@coral-xyz/anchor';
import type { SekadotfunEscrow } from '../idl/sekadotfun-escrow';
import IDL from '../idl/sekadotfun_escrow.json';
import { PROGRAM_ID } from '../constants/program-config';
import fs from 'fs';
import os from 'os';

const CLUSTER = process.env.CLUSTER || 'devnet';

function getUrl(cluster: string) {
    switch (cluster) {
        case 'localnet': return 'http://127.0.0.1:8899';
        case 'devnet': return 'https://api.devnet.solana.com';
        case 'mainnet-beta':
        case 'mainnet': return 'https://api.mainnet-beta.solana.com';
        default: return cluster; // Allow custom URL
    }
}

async function main() {
    console.log(`Starting initialization for cluster: ${CLUSTER}`);
    const url = getUrl(CLUSTER);
    console.log(`Connecting to ${url}...`);

    // 1. Setup Connection and Wallet
    const connection = new Connection(url, 'confirmed');

    // Load local wallet (default solana config path)
    const homeDir = os.homedir();
    const keypairPath = `${homeDir}/.config/solana/id.json`;

    console.log(`Loading wallet from ${keypairPath}...`);

    if (!fs.existsSync(keypairPath)) {
        console.error('Wallet not found! Please create a Solana wallet using "solana-keygen new" or adjust the path.');
        process.exit(1);
    }

    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, 'utf-8')));
    const wallet = new Wallet(Keypair.fromSecretKey(secretKey));

    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    const program = new Program<SekadotfunEscrow>(IDL as any, provider);

    console.log('Initializing config with Admin:', wallet.publicKey.toBase58());

    // 2. Derive Config PDA
    const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('config')],
        PROGRAM_ID
    );

    console.log('Config PDA:', configPda.toBase58());

    // 3. Call initializeConfig
    try {
        const tx = await program.methods
            .initializeConfig()
            .accounts({
                // config: configPda, // Auto-resolved by Anchor due to static seeds
                admin: wallet.publicKey,
                // systemProgram: SystemProgram.programId, // Auto-resolved
            })
            .rpc();

        console.log('Success! Transaction Signature:', tx);
        console.log(`Explorer Link: https://explorer.solana.com/tx/${tx}?cluster=${CLUSTER}`);
    } catch (e: any) {
        console.error('Error initializing config:', e);
        if (JSON.stringify(e).includes('already in use')) {
            console.log('Config account already exists. Initialization skipped.');
        } else if (e.message && e.message.includes('0x0')) {
            // Hex code logs?
            console.log('Raw Error Message:', e.message);
        }
    }
}

main();
