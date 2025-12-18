import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated,
    Modal,
    ActivityIndicator,
    Alert
} from "react-native";
import { useAuthorization } from "@/components/solana/use-authorization";
import { useResolveBet } from "@/hooks/use-resolve-bet";
import { useClaimReward } from "@/hooks/use-claim-reward";
import { useBetChainData } from "@/hooks/use-bet-chain-data";
import { apiService } from "@/services/api";
import { formatSol } from "@/utils/format";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function BetStatsPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const { selectedAccount } = useAuthorization();
    const { resolveBet, isLoading: isResolving } = useResolveBet();
    const { claimReward, isLoading: isClaiming } = useClaimReward();
    const [resolveModalVisible, setResolveModalVisible] = useState(false);

    const [betDetails, setBetDetails] = useState<any>(null);
    const [wagers, setWagers] = useState<any[]>([]);
    const [stats, setStats] = useState({
        yesCount: 0,
        noCount: 0,
        yesAmount: 0,
        noAmount: 0,
        totalAmount: 0,
        timeLeft: "",
    });

    const { betOnChain, voteOnChain, refresh: refreshChain } = useBetChainData(betDetails?.id, selectedAccount?.publicKey?.toBase58() || null, betDetails?.pda);

    useFocusEffect(
        useCallback(() => {
            if (betDetails?.id) {
                refreshChain();
            }
        }, [betDetails?.id, refreshChain])
    );

    const isResolved = betOnChain ? betOnChain.resolved : (betDetails?.resolved || false);
    const outcome = betOnChain ? betOnChain.outcome : betDetails?.outcome;
    const isWinner = isResolved && voteOnChain && Boolean(voteOnChain.side) === Boolean(outcome);
    const canClaim = isWinner && !voteOnChain.claimed;

    useEffect(() => {
        // Parse bet details from params
        if (params.bet) {
            try {
                const parsed = JSON.parse(params.bet as string);
                setBetDetails(parsed);
            } catch (e) {
                console.error("Failed to parse bet param", e);
            }
        }
    }, [params.bet]);

    useEffect(() => {
        if (betDetails?.id) {
            loadStats();
        }
    }, [betDetails?.id]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const loadStats = async () => {
        try {
            const votes = await apiService.getBetVotes(betDetails.id);

            let yesC = 0, noC = 0, yesA = 0, noA = 0;

            const formattedWagers = votes.map((vote: any) => {
                if (vote.choice) {
                    yesC++;
                    yesA += Number(vote.amount);
                } else {
                    noC++;
                    noA += Number(vote.amount);
                }
                return {
                    id: vote.id,
                    user: vote.user.name || "Anon",
                    side: vote.choice ? "yes" : "no",
                    amount: vote.amount,
                    timestamp: new Date(vote.votedAt).getTime(),
                };
            });

            setWagers(formattedWagers);

            // Time left
            const now = Date.now();
            const endTime = new Date(betDetails.endsAt).getTime();
            const diff = endTime - now;
            let timeLeft = "Closed";

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                if (days > 0) timeLeft = `${days}d ${hours}h`;
                else timeLeft = `${hours}h left`;
            } else {
                const since = Math.abs(diff);
                const days = Math.floor(since / (1000 * 60 * 60 * 24));
                if (days > 0) timeLeft = `Ended ${days}d ago`;
                else timeLeft = "Ended recently";
            }

            setStats({
                yesCount: yesC,
                noCount: noC,
                yesAmount: yesA,
                noAmount: noA,
                totalAmount: yesA + noA,
                timeLeft
            });

        } catch (e) {
            console.error("Failed to load stats", e);
        }
    };

    if (!betDetails) return <View style={styles.container} />;

    return (
        <LinearGradient colors={["#0F0C29", "#24243e", "#302B63"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <Animated.View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bet Stats</Text>
                    <View style={{ width: 40 }} />
                </Animated.View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.contentContainer}
                >
                    <Animated.View
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    >
                        {/* General Info */}
                        <View style={styles.card}>
                            <Text style={styles.description}>{betDetails.description}</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Created:</Text>
                                <Text style={styles.value}>{new Date(betDetails.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Status:</Text>
                                <Text style={[styles.value, { color: stats.timeLeft.includes('Ended') || stats.timeLeft === 'Closed' ? '#EF4444' : '#22C55E' }]}>
                                    {stats.timeLeft}
                                </Text>
                            </View>
                        </View>

                        {/* Pool Stats */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Pool Stats</Text>
                            <View style={styles.statsRow}>
                                <View style={[
                                    styles.statBox,
                                    isResolved && outcome === true && styles.winnerBox,
                                    isResolved && outcome === false && styles.loserBox
                                ]}>
                                    <Text style={[styles.statTitle, { color: '#22C55E' }]}>
                                        YES {isResolved && outcome === true && '👑'}
                                    </Text>
                                    <Text style={styles.statValue}>{formatSol(stats.yesAmount)} SKR</Text>
                                    <Text style={styles.statSub}>{stats.yesCount} Bets</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={[
                                    styles.statBox,
                                    isResolved && outcome === false && styles.winnerBox,
                                    isResolved && outcome === true && styles.loserBox
                                ]}>
                                    <Text style={[styles.statTitle, { color: '#EF4444' }]}>
                                        NO {isResolved && outcome === false && '👑'}
                                    </Text>
                                    <Text style={styles.statValue}>{formatSol(stats.noAmount)} SKR</Text>
                                    <Text style={styles.statSub}>{stats.noCount} Bets</Text>
                                </View>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.label}>Total Wagered:</Text>
                                <Text style={styles.totalValue}>{formatSol(stats.totalAmount)} SKR</Text>
                            </View>
                        </View>

                        {/* Claim Button */}
                        {canClaim && (
                            <TouchableOpacity
                                style={[styles.resolveButton, { backgroundColor: '#22C55E' }]}
                                onPress={async () => {
                                    try {
                                        await claimReward({ betPda: betDetails.pda });
                                        Alert.alert("Success", "Reward Claimed!");
                                        refreshChain();
                                    } catch (e) {
                                        Alert.alert("Error", String(e));
                                    }
                                }}
                                disabled={isClaiming}
                            >
                                {isClaiming ? <ActivityIndicator color="#FFF" /> : <Text style={styles.resolveButtonText}>Claim Reward</Text>}
                            </TouchableOpacity>
                        )}

                        {/* Claimed Status */}
                        {isResolved && voteOnChain && voteOnChain.claimed && (
                            <View style={[styles.resolveButton, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                                <Text style={[styles.resolveButtonText, { color: '#22C55E' }]}>Reward Claimed ✅</Text>
                            </View>
                        )}

                        {/* Status Message for Unresolved Expired Bets */}
                        {!isResolved && (new Date(betDetails.endsAt).getTime() < Date.now()) && (
                            <View style={{ marginTop: 20, marginBottom: 40, alignItems: 'center' }}>
                                {selectedAccount && betDetails?.creator?.walletAddress === selectedAccount.publicKey.toBase58() ? (
                                    <>
                                        <Text style={{ color: '#F59E0B', textAlign: 'center', marginBottom: 10 }}>
                                            As the creator, you must determine the winning outcome.
                                        </Text>
                                        <TouchableOpacity
                                            style={[styles.resolveButton, { marginTop: 10, width: '100%' }]}
                                            onPress={() => setResolveModalVisible(true)}
                                        >
                                            <Text style={styles.resolveButtonText}>Resolve Bet</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Text style={{ color: '#F59E0B', textAlign: 'center', fontStyle: 'italic' }}>
                                        This bet has ended. Waiting for the creator to resolve the outcome.
                                    </Text>
                                )}
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>

                <Modal visible={resolveModalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Resolve Bet Outcome</Text>
                            <Text style={styles.modalSubtitle}>Which side won?</Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: '#22C55E' }]}
                                    onPress={async () => {
                                        try {
                                            await resolveBet({ betPda: betDetails.pda, betId: betDetails.id, outcome: 'yes' });
                                            setResolveModalVisible(false);
                                            Alert.alert("Success", "Bet resolved as YES");
                                            refreshChain();
                                        } catch (e) {
                                            Alert.alert("Error", e instanceof Error ? e.message : String(e));
                                        }
                                    }}
                                    disabled={isResolving}
                                >
                                    {isResolving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalBtnText}>YES</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: '#EF4444' }]}
                                    onPress={async () => {
                                        try {
                                            await resolveBet({ betPda: betDetails.pda, betId: betDetails.id, outcome: 'no' });
                                            setResolveModalVisible(false);
                                            Alert.alert("Success", "Bet resolved as NO");
                                            refreshChain();
                                        } catch (e) {
                                            Alert.alert("Error", e instanceof Error ? e.message : String(e));
                                        }
                                    }}
                                    disabled={isResolving}
                                >
                                    {isResolving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalBtnText}>NO</Text>}
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.closeModal}
                                onPress={() => setResolveModalVisible(false)}
                            >
                                <Text style={styles.closeModalText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    backButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    description: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    label: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14
    },
    value: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    statBox: {
        flex: 1,
        alignItems: 'center'
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 10
    },
    statTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4
    },
    statValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4
    },
    statSub: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 16
    },
    totalValue: {
        color: '#4ECDC4',
        fontSize: 18,
        fontWeight: 'bold'
    },
    resolveButton: {
        backgroundColor: '#4ECDC4',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40
    },
    resolveButtonText: {
        color: '#0F0C29',
        fontSize: 18,
        fontWeight: 'bold'
    },
    winnerBox: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: '#22C55E',
        borderRadius: 8,
        padding: 4
    },
    loserBox: {
        opacity: 0.3
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#24243e',
        width: '100%',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8
    },
    modalSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        marginBottom: 24
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    modalButton: {
        flex: 0.48,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18
    },
    closeModal: {
        padding: 12
    },
    closeModalText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 16
    }
});
