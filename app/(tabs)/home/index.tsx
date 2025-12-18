import { LinearGradient } from 'expo-linear-gradient'
import { Link, useRouter, useFocusEffect } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Animated, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native'
import { apiService } from '@/services/api'
import { ellipsify } from '@/utils/ellipsify'
import { formatSol } from '@/utils/format'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

import { useAccountBalance } from '@/hooks/use-account-balance'

export default function HomePage() {
  const router = useRouter()
  const { formattedBalance } = useAccountBalance()
  const [currentTime, setCurrentTime] = useState(Date.now())
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  // Background animation values
  const circle1 = useRef(new Animated.Value(0)).current
  const circle2 = useRef(new Animated.Value(0)).current
  const circle3 = useRef(new Animated.Value(0)).current

  // State for bets
  const [bets, setBets] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchBets = async () => {
    try {
      const data = await apiService.getBets()
      // Transform backend data to UI format
      const transformed = data.map((bet: any) => {
        const totalVotes = (bet.yesCount || 0) + (bet.noCount || 0)
        const yesPct = totalVotes > 0 ? Math.round(((bet.yesCount || 0) / totalVotes) * 100) : 50
        const noPct = totalVotes > 0 ? Math.round(((bet.noCount || 0) / totalVotes) * 100) : 50
        const now = Date.now()
        const endTime = new Date(bet.endsAt).getTime()

        return {
          ...bet, // Keep original data first
          id: bet.id,
          description: bet.description,
          yesStake: 0, // volume breakdown not yet available
          noStake: 0,
          totalStake: bet.volume || 0,
          yesPercentage: yesPct,
          noPercentage: noPct,
          endTime: endTime,
          creator: bet.creator?.walletAddress ? ellipsify(bet.creator.walletAddress) : 'Unknown',
          status: endTime < now ? 'closed' : 'active',
        }
      })

      const sorted = transformed.sort((a: any, b: any) => {
        if (a.status === 'active' && b.status !== 'active') return -1
        if (a.status !== 'active' && b.status === 'active') return 1
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      })

      setBets(sorted)
    } catch (error) {
      console.error('Failed to fetch bets:', error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchBets()
    }, [])
  )

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await fetchBets()
    setRefreshing(false)
  }, [])

  // Mock bet data (Legacy)
  /*
  const [bets] = useState([
    {
      id: 1,
      description: 'Will BTC hit $100k by end of December 2025?',
      yesStake: 2450,
      noStake: 1850,
      totalStake: 4300,
      yesPercentage: 57,
      noPercentage: 43,
      endTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
      creator: 'alice.skr',
      status: 'active',
    },
    ...
  ])
  */

  useEffect(() => {
    // Main content animation
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
    ]).start()

    // Background circles animation
    const animateCircle = (circle, delay = 0, duration = 8000) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(circle, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(circle, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }

    animateCircle(circle1, 0, 10000)
    animateCircle(circle2, 2000, 12000)
    animateCircle(circle3, 4000, 8000)

    // Timer update - uncomment if you need live countdown
    // const timer = setInterval(() => {
    //   setCurrentTime(Date.now());
    // }, 1000);
    // return () => clearInterval(timer)
  }, [])

  const formatTimeLeft = (endTime) => {
    const now = currentTime
    const diff = endTime - now

    if (diff <= 0) return 'CLOSED'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const AnimatedCircle = ({ animValue, style }) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [screenHeight + 100, -200],
    })

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 0.8, 0.8, 0],
    })

    return (
      <Animated.View
        style={[
          styles.floatingCircle,
          style,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      />
    )
  }

  const BetCard = ({ bet, index }) => {
    const cardAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 200,
        useNativeDriver: true,
      }).start()
    }, [])

    const translateY = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    })

    const timeLeft = formatTimeLeft(bet.endTime)
    const isClosed = bet.status === 'closed' || timeLeft === 'CLOSED'

    return (
      <Animated.View
        style={[
          styles.betCard,
          {
            opacity: cardAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => router.push({ pathname: '/(tabs)/details', params: { bet: JSON.stringify(bet) } })}
        >
          <LinearGradient
            colors={isClosed ? ['#374151', '#1F2937'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.betCardGradient}
          >
            {/* Header */}
            <View style={styles.betHeader}>
              <Text style={[styles.betDescription, isClosed && styles.closedText]}>{bet.description}</Text>
              <View style={[styles.timerContainer, isClosed && styles.closedTimer]}>
                <Text style={[styles.timerText, isClosed && styles.closedTimerText]}>
                  {isClosed ? 'CLOSED' : timeLeft}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>YES {bet.yesPercentage}%</Text>
                <Text style={styles.totalStakeText}>{formatSol(bet.totalStake)} SKR</Text>
                <Text style={styles.progressLabel}>NO {bet.noPercentage}%</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${bet.yesPercentage}%` }]} />
              </View>

              <View style={styles.stakeLabels}>
                <Text style={styles.stakeAmount}>{formatSol(bet.yesStake)} SKR</Text>
                <Text style={styles.stakeAmount}>{formatSol(bet.noStake)} SKR</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[styles.actionButton, styles.yesButton, isClosed && styles.disabledButton]}
                disabled={isClosed}
                onPress={() => router.push({ pathname: '/(tabs)/details', params: { bet: JSON.stringify(bet) } })}
              >
                <LinearGradient
                  colors={isClosed ? ['#6B7280', '#4B5563'] : ['#22C55E', '#16A34A']}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonText}>YES</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.noButton, isClosed && styles.disabledButton]}
                disabled={isClosed}
                onPress={() => router.push({ pathname: '/(tabs)/details', params: { bet: JSON.stringify(bet) } })}
              >
                <LinearGradient
                  colors={isClosed ? ['#6B7280', '#4B5563'] : ['#EF4444', '#DC2626']}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonText}>NO</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Creator */}
            <View style={styles.creatorSection}>
              <Text style={styles.creatorText}>Created by {bet.creator}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <LinearGradient colors={['#0F0C29', '#24243e', '#302B63']} style={styles.container}>
      {/* Animated Background Circles */}
      <AnimatedCircle animValue={circle1} style={[styles.circle1, { backgroundColor: 'rgba(147, 51, 234, 0.08)' }]} />
      <AnimatedCircle animValue={circle2} style={[styles.circle2, { backgroundColor: 'rgba(59, 130, 246, 0.06)' }]} />
      <AnimatedCircle animValue={circle3} style={[styles.circle3, { backgroundColor: 'rgba(16, 185, 129, 0.09)' }]} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo and App Name */}
          <View style={styles.logoSection}>
            <View style={styles.miniLogo}>
              <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.miniLogoGradient}>
                <Text style={styles.miniLogoEmoji}>🎯</Text>
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>
              <Text style={styles.headerTitleBold}>seka</Text>
              <Text style={styles.headerTitleDot}>.fun</Text>
            </Text>
          </View>

          {/* Balance and Actions */}
          <View style={styles.headerActions}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceAmount}>{formattedBalance} SKR</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Create Bet Button */}
        <Animated.View
          style={[
            styles.createBetContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Link href="/create" asChild>
            <TouchableOpacity style={styles.createBetButton}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.createBetGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.createBetText}>+ Create New Bet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>
        </Animated.View>

        {/* Bets Feed */}
        <Animated.View
          style={[
            styles.feedContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.feedHeader}>
            <View style={styles.feedTitleRow}>
              <Text style={styles.feedTitle}>Active Predictions</Text>
              <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
                <MaterialIcons
                  name="refresh"
                  size={24}
                  color={refreshing ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.8)"}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.feedSubtitle}>Tap YES or NO to place your bet</Text>
          </View>

          <ScrollView
            style={styles.betsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.betsListContent}
          >
            {bets.map((bet, index) => (
              <BetCard key={bet.id} bet={bet} index={index} />
            ))}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Background Circles
  floatingCircle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: 100,
    height: 100,
    left: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    right: -75,
  },
  circle3: {
    width: 80,
    height: 80,
    left: screenWidth * 0.6,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLogo: {
    marginRight: 8,
  },
  miniLogoGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniLogoEmoji: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
  },
  headerTitleBold: {
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerTitleDot: {
    fontWeight: '300',
    color: '#4ECDC4',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceContainer: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 18,
  },

  // Create Bet Button
  createBetContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  createBetButton: {
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createBetGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBetText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Feed
  feedContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  feedHeader: {
    marginBottom: 16,
  },
  feedTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  feedSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  betsList: {
    flex: 1,
  },
  betsListContent: {
    paddingBottom: 20,
  },

  // Bet Cards
  betCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  betCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  betDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  closedText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  timerContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  closedTimer: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  timerText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '700',
  },
  closedTimerText: {
    color: '#EF4444',
  },

  // Progress Section
  progressSection: {
    marginBottom: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  totalStakeText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  stakeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stakeAmount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },

  // Action Buttons
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Creator
  creatorSection: {
    alignItems: 'center',
  },
  creatorText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  yesButton: {},
  noButton: {},
})
