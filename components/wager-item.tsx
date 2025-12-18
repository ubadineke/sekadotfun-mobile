import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

interface WagerItemProps {
    wager: any;
    styles: any;
    onClaim: (betPda: string, betId: number, votePda?: string, voteId?: number) => Promise<void>;
    isClaiming: boolean;
}

export function WagerItem({ wager, styles, onClaim, isClaiming }: WagerItemProps) {
    const router = useRouter();
    const [claimed, setClaimed] = useState(wager.claimed || false);

    // Use backend data only - no chain fetching in list view
    const isResolved = wager.bet?.resolved || false;
    const outcome = wager.bet?.outcome;
    const isExpired = !isResolved && new Date(wager.bet?.endsAt).getTime() < Date.now();

    const won = isResolved && Boolean(outcome) === Boolean(wager.choice);
    const canClaim = won && !claimed;

    const handleClaim = async () => {
        // Pass the stored vote PDA if available
        await onClaim(wager.bet.pda, wager.bet.id, wager.pda, wager.id);
        setClaimed(true);
    };

    return (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push({
                pathname: "/stats/[id]",
                params: { id: wager.bet.id, bet: JSON.stringify(wager.bet) }
            })}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.listItemTitle}>{wager.bet?.description || `Bet #${wager.bet?.id}`}</Text>
                    <Text style={styles.listItemSubtitle}>
                        Wagered: {wager.amount / 1_000_000_000} SKR on <Text style={{ fontWeight: 'bold', color: wager.choice ? '#22C55E' : '#EF4444' }}>{wager.choice ? 'YES' : 'NO'}</Text>
                    </Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>›</Text>
            </View>

            <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                {isResolved ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold', marginRight: 10 }}>
                            Outcome: <Text style={{ color: outcome ? '#22C55E' : '#EF4444' }}>{outcome ? 'YES' : 'NO'}</Text>
                        </Text>
                        {won ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                <Text style={{ color: '#22C55E', fontWeight: 'bold', marginRight: 10 }}>YOU WON!</Text>
                                {canClaim && (
                                    <TouchableOpacity
                                        style={{ backgroundColor: '#22C55E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleClaim();
                                        }}
                                        disabled={isClaiming}
                                    >
                                        {isClaiming ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Claim</Text>}
                                    </TouchableOpacity>
                                )}
                                {claimed && (
                                    <Text style={{ color: '#22C55E', fontStyle: 'italic' }}>Claimed ✅</Text>
                                )}
                            </View>
                        ) : (
                            <Text style={{ color: '#EF4444', fontWeight: 'bold', marginLeft: 10 }}>YOU LOST!</Text>
                        )}
                    </View>
                ) : isExpired ? (
                    <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>Finalizing...</Text>
                ) : (
                    <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>Active</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}
