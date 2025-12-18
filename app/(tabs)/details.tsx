import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { usePlaceWager } from "@/hooks/use-place-wager";
import { apiService } from "@/services/api";
import { SuccessModal } from "@/components/success-modal";
import { formatSol } from "@/utils/format";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function tapIn() {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [activeTab, setActiveTab] = useState("wagers");
  const [selectedSide, setSelectedSide] = useState("yes");
  const [wagerAmount, setWagerAmount] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Background animation
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;

  // Mock bet data
  const router = useRouter();
  const params = useLocalSearchParams();
  const { placeWager, isLoading } = usePlaceWager();

  // Parse bet data from params, fallback to mock if missing
  const [betDetails, setBetDetails] = useState<any>(() => {
    if (params.bet) {
      try {
        return JSON.parse(params.bet as string);
      } catch (e) {
        console.error("Failed to parse bet param", e);
      }
    }
    return {
      id: 1,
      description: "Will BTC hit $100k by end of December 2025?",
      yesStake: 2450,
      noStake: 1850,
      totalStake: 4300,
      yesPercentage: 57,
      noPercentage: 43,
      endTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
      createdDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
      creator: "alice.skr",
      status: "active",
      decisionType: "voting",
    };
  });

  // Update state if params change (e.g. deep link)
  useEffect(() => {
    if (params.bet) {
      try {
        setBetDetails(JSON.parse(params.bet as string));
      } catch (e) { }
    }
  }, [params.bet]);



  // Real activity data
  const [wagers, setWagers] = useState<any[]>([]);

  const [isFetchingWagers, setIsFetchingWagers] = useState(false);

  useEffect(() => {
    if (betDetails?.id) {
      loadWagers();
    }
  }, [betDetails?.id]);

  const loadWagers = async () => {
    if (isFetchingWagers) return;
    try {
      setIsFetchingWagers(true);
      const votes = await apiService.getBetVotes(betDetails.id);
      const formattedWagers = votes.map((vote: any) => ({
        id: vote.id,
        user: vote.user.name || "no-name.skr",
        side: vote.choice ? "yes" : "no",
        amount: vote.amount,
        timestamp: new Date(vote.votedAt).getTime(),
      }));
      setWagers(formattedWagers);
    } catch (e) {
      console.error("Failed to load wagers", e);
    } finally {
      setIsFetchingWagers(false);
    }
  };

  const [votes] = useState([
    {
      id: 1,
      user: "validator1.skr",
      vote: "yes",
      timestamp: Date.now() - 1 * 60 * 60 * 1000,
    },
    {
      id: 2,
      user: "validator2.skr",
      vote: "no",
      timestamp: Date.now() - 3 * 60 * 60 * 1000,
    },
    {
      id: 3,
      user: "validator3.skr",
      vote: "yes",
      timestamp: Date.now() - 5 * 60 * 60 * 1000,
    },
  ]);

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
    ]).start();

    //   // Background circles animation
    //   const animateCircle = (circle, delay = 0, duration = 12000) => {
    //     Animated.loop(
    //       Animated.sequence([
    //         Animated.delay(delay),
    //         Animated.timing(circle, {
    //           toValue: 1,
    //           duration: duration,
    //           useNativeDriver: true,
    //         }),
    //         Animated.timing(circle, {
    //           toValue: 0,
    //           duration: duration,
    //           useNativeDriver: true,
    //         }),
    //       ])
    //     ).start();
    //   };

    //   animateCircle(circle1, 0, 15000);
    //   animateCircle(circle2, 3000, 18000);

    //   // Timer update
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (endTime) => {
    const now = currentTime;
    const diff = endTime - now;

    if (diff <= 0) return "CLOSED";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} days, ${hours} hours left`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes left`;
    return `${minutes} minutes left`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const AnimatedCircle = ({ animValue, style }) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [screenHeight + 100, -200],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 0.6, 0.6, 0],
    });

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
    );
  };

  const handlePlaceWager = async () => {
    if (!wagerAmount || isNaN(Number(wagerAmount))) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    // Check if wallet is connected? Hook handles it but good to check UI state if needed.

    try {
      const lamports = Math.floor(parseFloat(wagerAmount) * 1_000_000_000); // 1 SOL = 1e9 lamports
      console.log('Placing wager:', {
        pda: betDetails.pda,
        id: betDetails.id,
        side: selectedSide,
        amount: lamports
      });

      await placeWager({
        betPda: betDetails.pda,
        betIdBackend: betDetails.id,
        side: selectedSide as 'yes' | 'no',
        amount: lamports
      });

      setShowSuccessModal(true);
      setWagerAmount("");
      loadWagers();
    } catch (e) {
      // Error is handled in hook (logged/set state), but we catch here for UI Alert if hook throws.
      // Hook throws error, so we catch it.
      // Alert is already shown? No, hook sets error state. But we can Alert here too.
      // Actually hook throws 'err', so we Alert here.
      // But hook uses error state? 
      // Let's use Alert.
    }
  };

  const ActivityItem = ({ item, type }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityUser}>{item.user}</Text>
        <Text style={styles.activityTime}>{formatTime(item.timestamp)}</Text>
      </View>
      <View style={styles.activityDetails}>
        {type === "wagers" ? (
          <>
            <View
              style={[
                styles.sideIndicator,
                item.side === "yes" ? styles.yesSide : styles.noSide,
              ]}
            >
              <Text style={styles.sideText}>{item.side.toUpperCase()}</Text>
            </View>
            <Text style={styles.activityAmount}>{formatSol(item.amount)} SKR</Text>
          </>
        ) : (
          <>
            <View
              style={[
                styles.sideIndicator,
                item.vote === "yes" ? styles.yesSide : styles.noSide,
              ]}
            >
              <Text style={styles.sideText}>{item.vote.toUpperCase()}</Text>
            </View>
            <Text style={styles.voteText}>Vote cast</Text>
          </>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#0F0C29", "#24243e", "#302B63"]} style={styles.container}>
      {/* Animated Background Circles */}
      {/* <AnimatedCircle
        animValue={circle1}
        style={[styles.circle1, { backgroundColor: "rgba(147, 51, 234, 0.06)" }]}
      />
      <AnimatedCircle
        animValue={circle2}
        style={[styles.circle2, { backgroundColor: "rgba(59, 130, 246, 0.08)" }]}
      /> */}

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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bet Details</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>↗</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Bet Details Section */}
          <Animated.View
            style={[
              styles.betDetailsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"]}
              style={styles.betDetailsCard}
            >
              <Text style={styles.betDescription}>{betDetails.description}</Text>

              {/* Large Progress Bar */}
              <View style={styles.largeProgressSection}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabelLarge}>
                    YES {betDetails.yesPercentage}%
                  </Text>
                  <Text style={styles.progressLabelLarge}>
                    NO {betDetails.noPercentage}%
                  </Text>
                </View>

                <View style={styles.largeProgressBarContainer}>
                  <View
                    style={[
                      styles.largeProgressBar,
                      { width: `${betDetails.yesPercentage}%` },
                    ]}
                  />
                </View>

                <View style={styles.stakeInfo}>
                  <View style={styles.stakeDetail}>
                    <Text style={styles.stakeLabel}>Total Stake</Text>
                    <Text style={styles.totalStakeAmount}>
                      {formatSol(betDetails.totalStake)} SKR
                    </Text>
                  </View>
                </View>
              </View>

              {/* Meta Information */}
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Created</Text>
                  <Text style={styles.metaValue}>
                    {formatDate(betDetails.createdAt || Date.now())}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Time Left</Text>
                  <Text style={[styles.metaValue, styles.timeLeftValue]}>
                    {formatTimeLeft(betDetails.endTime)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Wager Section */}
          <Animated.View
            style={[
              styles.wagerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
              style={styles.wagerCard}
            >
              <Text style={styles.wagerTitle}>Place Your Wager</Text>

              {/* Side Selection */}
              <View style={styles.sideSelection}>
                <TouchableOpacity
                  style={[
                    styles.sideButton,
                    selectedSide === "yes" && styles.sideButtonActive,
                  ]}
                  onPress={() => setSelectedSide("yes")}
                >
                  <LinearGradient
                    colors={
                      selectedSide === "yes"
                        ? ["#22C55E", "#16A34A"]
                        : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
                    }
                    style={styles.sideButtonGradient}
                  >
                    <Text
                      style={[
                        styles.sideButtonText,
                        selectedSide === "yes" && styles.sideButtonTextActive,
                      ]}
                    >
                      YES
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sideButton,
                    selectedSide === "no" && styles.sideButtonActive,
                  ]}
                  onPress={() => setSelectedSide("no")}
                >
                  <LinearGradient
                    colors={
                      selectedSide === "no"
                        ? ["#EF4444", "#DC2626"]
                        : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
                    }
                    style={styles.sideButtonGradient}
                  >
                    <Text
                      style={[
                        styles.sideButtonText,
                        selectedSide === "no" && styles.sideButtonTextActive,
                      ]}
                    >
                      NO
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Amount Input */}
              <View style={styles.amountInput}>
                <Text style={styles.inputLabel}>Wager Amount</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter amount"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={wagerAmount}
                    onChangeText={setWagerAmount}
                    keyboardType="numeric"
                  />
                  <Text style={styles.currencyLabel}>SOL</Text>
                </View>
              </View>

              {/* Place Wager Button */}
              <TouchableOpacity
                style={styles.placeWagerButton}
                onPress={handlePlaceWager}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ["#4B5563", "#374151"] : ["#667eea", "#764ba2"]}
                  style={styles.placeWagerGradient}
                >
                  <Text style={styles.placeWagerText}>
                    {isLoading ? "Processing..." : "Place Wager"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Live Activity Section */}
          <Animated.View
            style={[
              styles.activitySection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.activityTitle}>Live Activity</Text>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "wagers" && styles.tabActive]}
                onPress={() => {
                  setActiveTab("wagers");
                  loadWagers();
                }}
                disabled={isFetchingWagers}
              >
                <Text
                  style={[styles.tabText, activeTab === "wagers" && styles.tabTextActive]}
                >
                  {isFetchingWagers ? "Refreshing..." : "Wagers"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === "votes" && styles.tabActive]}
                onPress={() => setActiveTab("votes")}
              >
                <Text
                  style={[styles.tabText, activeTab === "votes" && styles.tabTextActive]}
                >
                  Votes
                </Text>
              </TouchableOpacity>
            </View>

            {/* Activity List */}
            <View style={styles.activityList}>
              {activeTab === "wagers"
                ? wagers.map((item) => (
                  <ActivityItem key={item.id} item={item} type="wagers" />
                ))
                : votes.map((item) => (
                  <ActivityItem key={item.id} item={item} type="votes" />
                ))}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Wager Placed!"
        message={`You successfully placed a wager on ${selectedSide.toUpperCase()}.`}
      />
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

  // Background Circles
  floatingCircle: {
    position: "absolute",
    borderRadius: 1000,
  },
  circle1: {
    width: 120,
    height: 120,
    left: -60,
  },
  circle2: {
    width: 180,
    height: 180,
    right: -90,
  },

  // Header
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Bet Details Section
  betDetailsSection: {
    marginBottom: 20,
  },
  betDetailsCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  betDescription: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
    lineHeight: 28,
  },

  // Large Progress Section
  largeProgressSection: {
    marginBottom: 20,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressLabelLarge: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  largeProgressBarContainer: {
    height: 16,
    backgroundColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 8,
    marginBottom: 16,
  },
  largeProgressBar: {
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 8,
  },
  stakeInfo: {
    alignItems: "center",
  },
  stakeDetail: {
    alignItems: "center",
  },
  stakeLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  totalStakeAmount: {
    color: "#4ECDC4",
    fontSize: 24,
    fontWeight: "700",
  },

  // Meta Info
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    alignItems: "center",
  },
  metaLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  metaValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  timeLeftValue: {
    color: "#4ECDC4",
  },

  // Wager Section
  wagerSection: {
    marginBottom: 20,
  },
  wagerCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  wagerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },

  // Side Selection
  sideSelection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  sideButton: {
    flex: 1,
  },
  sideButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sideButtonText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    fontWeight: "700",
  },
  sideButtonTextActive: {
    color: "#FFFFFF",
  },
  sideButtonActive: {
    borderColor: "#4ECDC4",
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },

  // Amount Input
  amountInput: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 16,
  },
  currencyLabel: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Place Wager Button
  placeWagerButton: {
    borderRadius: 12,
  },
  placeWagerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  placeWagerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Activity Section
  activitySection: {
    marginBottom: 20,
  },
  activityTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    marginBottom: 16,
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

  // Activity List
  activityList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activityUser: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  activityTime: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
  },
  activityDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sideIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  yesSide: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  noSide: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  sideText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  activityAmount: {
    color: "#4ECDC4",
    fontSize: 14,
    fontWeight: "600",
  },
  voteText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontStyle: "italic",
  },
});
