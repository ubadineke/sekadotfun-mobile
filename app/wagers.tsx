import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert
} from "react-native";
import { WagerItem } from "@/components/wager-item";
import { useClaimReward } from "@/hooks/use-claim-reward";

import { useAuthorization } from "@/components/solana/use-authorization";
import { apiService } from "@/services/api";

const { width: screenWidth } = Dimensions.get("window");

export default function WagersPage() {
    const router = useRouter();
    const { selectedAccount } = useAuthorization();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { claimReward, isLoading: isClaiming } = useClaimReward();

    // State
    const [activeTab, setActiveTab] = useState<'wagers' | 'created'>('wagers');
    const [userWagers, setUserWagers] = useState<any[]>([]);
    const [createdBets, setCreatedBets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingBetId, setClaimingBetId] = useState<number | null>(null);



    useEffect(() => {
        fetchData();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [selectedAccount]);

    const fetchData = async () => {
        if (!selectedAccount) return;
        try {
            setLoading(true);
            const user = await apiService.getUserByWallet(selectedAccount.publicKey.toBase58());

            const [wagersData, createdData] = await Promise.all([
                apiService.getUserWagers(),
                apiService.getCreatedBets()
            ]);

            const sortedCreatedBets = createdData.sort((a: any, b: any) => {
                const isActiveA = !a.resolved && new Date(a.endsAt).getTime() > Date.now();
                const isActiveB = !b.resolved && new Date(b.endsAt).getTime() > Date.now();

                if (isActiveA && !isActiveB) return -1;
                if (!isActiveA && isActiveB) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setUserWagers(wagersData);
            setCreatedBets(sortedCreatedBets);
        } catch (e) {
            console.error("Failed to fetch wagers data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = useCallback(async (betPda: string, betId: number, votePda?: string, voteId?: number) => {
        setClaimingBetId(betId);
        try {
            await claimReward({ betPda, votePda });

            // Sync with backend
            if (voteId) {
                await apiService.claimVote(voteId);
            }

            Alert.alert("Success", "Reward Claimed!");
            await fetchData(); // Refresh the list
        } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : String(e));
        } finally {
            setClaimingBetId(null);
        }
    }, [claimReward]);

    return (
        <LinearGradient colors={["#0F0C29", "#24243e", "#302B63"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your Activity</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* Tabs */}
                        <View style={styles.tabsContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === "wagers" && styles.tabActive]}
                                onPress={() => setActiveTab("wagers")}
                            >
                                <Text style={[styles.tabText, activeTab === "wagers" && styles.tabTextActive]}>
                                    Your Wagers
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tab, activeTab === "created" && styles.tabActive]}
                                onPress={() => setActiveTab("created")}
                            >
                                <Text style={[styles.tabText, activeTab === "created" && styles.tabTextActive]}>
                                    Bets Created
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* List */}
                        <View style={styles.listContainer}>
                            {loading ? (
                                <Text style={styles.emptyText}>Loading...</Text>
                            ) : activeTab === 'wagers' ? (
                                userWagers.length > 0 ? (
                                    userWagers.map((wager, i) => (
                                        <WagerItem
                                            key={i}
                                            wager={wager}
                                            styles={styles}
                                            onClaim={handleClaim}
                                            isClaiming={claimingBetId === wager.bet.id}
                                        />
                                    ))
                                ) : <Text style={styles.emptyText}>You have no wagers.</Text>
                            ) : (
                                createdBets.length > 0 ? (
                                    createdBets.map((bet, i) => {
                                        const isExpired = new Date(bet.endsAt).getTime() < Date.now();
                                        const isResolved = bet.resolved;
                                        const isUnresolved = !isResolved && isExpired;

                                        let statusText = '● Active';
                                        let statusColor = '#22C55E'; // Green

                                        if (isResolved) {
                                            statusText = `● Resolved: ${bet.outcome ? 'YES' : 'NO'}`;
                                            statusColor = '#3B82F6'; // Blue
                                        } else if (isUnresolved) {
                                            statusText = '● Unresolved';
                                            statusColor = '#F59E0B'; // Orange
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={i}
                                                style={styles.listItem}
                                                onPress={() => router.push({
                                                    pathname: "/stats/[id]",
                                                    params: { id: bet.id, bet: JSON.stringify(bet) }
                                                })}
                                            >
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.listItemTitle}>{bet.description}</Text>
                                                        <Text style={[styles.listItemSubtitle, { color: statusColor }]}>
                                                            {statusText}
                                                        </Text>
                                                    </View>
                                                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>›</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                                ) : <Text style={styles.emptyText}>You have no created bets.</Text>
                            )}
                        </View>
                    </Animated.View>
                </ScrollView>
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
        paddingBottom: 30,
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        marginBottom: 20,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    tabText: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 14,
        fontWeight: "600",
    },
    tabTextActive: {
        color: "#FFFFFF",
    },
    listContainer: {
        marginBottom: 20
    },
    listItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10
    },
    listItemTitle: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4
    },
    listItemSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    emptyText: {
        color: '#999',
        textAlign: 'center',
        marginVertical: 40,
        fontSize: 16
    },
});
