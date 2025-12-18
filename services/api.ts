import axios, { AxiosInstance } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '@/constants/program-config'

const AUTH_TOKEN_KEY = 'auth-token'

/**
 * API client for backend communication
 */
class ApiService {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Add auth token to requests
        this.client.interceptors.request.use(async (config) => {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY)
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        })
    }

    /**
     * Set the auth token (call after wallet sign-in)
     */
    async setAuthToken(token: string): Promise<void> {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)
    }

    /**
     * Clear the auth token (call on sign-out)
     */
    async clearAuthToken(): Promise<void> {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
    }

    /**
     * Request auth challenge
     */
    async requestChallenge(walletAddress: string): Promise<string> {
        // The backend returns the challenge string directly
        const response = await this.client.post('/auth/challenge', { walletAddress })
        return response.data
    }

    /**
     * Verify signed auth challenge
     */
    async verifyChallenge(data: { walletAddress: string, challenge: string, signature: string }) {
        const response = await this.client.post('/auth/verify', data)
        return response.data
    }

    /**
     * Create a bet record in the backend
     */
    async createBet(data: {
        description: string
        pda: string
        decisionMethod: 'voting' | 'creatorDecides'
        type: 'private' | 'public'
        endsAt: Date
        createdAt: Date
    }) {
        const response = await this.client.post('/bet', data)
        return response.data
    }

    /**
     * Get all bets
     */
    async getBets() {
        const response = await this.client.get('/bet')
        return response.data
    }

    /**
     * Get bets created by current user
     */
    async getCreatedBets() {
        const response = await this.client.get('/bet/created')
        return response.data
    }

    /**
     * Get bets voted on by current user
     */
    async getVotedBets() {
        const response = await this.client.get('/bet/voted')
        return response.data
    }

    /**
     * Cast a vote/wager on a bet
     */
    async vote(data: {
        betId: number
        choice: boolean
        amount: number
        pda?: string
    }) {
        const response = await this.client.post('/bet/vote', data)
        return response.data
    }

    /**
     * Get votes/wagers for a specific bet
     */
    async getBetVotes(betId: number) {
        const response = await this.client.get(`/bet/${betId}/votes`)
        return response.data
    }

    /**
     * Get detailed wagers for the current user
     */
    async getUserWagers() {
        const response = await this.client.get('/bet/wagers')
        return response.data
    }

    /**
     * Get user stats
     */
    async getUserStats(userId: number) {
        const response = await this.client.get(`/user/${userId}/stats`)
        return response.data
    }

    /**
     * Get user details
     */
    async getUserDetails(userId: number) {
        const response = await this.client.get(`/user/${userId}`)
        return response.data
    }

    /**
     * Get user by wallet address
     */
    async getUserByWallet(walletAddress: string) {
        const response = await this.client.get(`/user/wallet/${walletAddress}`)
        return response.data
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: number, data: { name?: string, seekerId?: string }) {
        const response = await this.client.patch(`/user/${userId}`, data)
        return response.data
    }

    /**
     * Resolve a bet (sync backend after on-chain resolution)
     */
    async resolveBet(betId: number, outcome: boolean) {
        const response = await this.client.patch(`/bet/${betId}/resolve`, { outcome })
        return response.data
    }

    /**
     * Mark a vote as claimed
     */
    async claimVote(voteId: number) {
        const response = await this.client.patch(`/bet/vote/${voteId}/claim`)
        return response.data
    }
}

export const apiService = new ApiService()
