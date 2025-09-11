import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// Mock data
export const mockBets = [
  {
    id: 1,
    title: "Will BTC hit $100k by Friday?",
    stake: "5 SKR",
    odds: "2.1x",
    creator: "alice.skr",
    isExclusive: true,
    yesVotes: 12,
    noVotes: 8,
  },
  {
    id: 2,
    title: "SOL to reach $200 this month?",
    stake: "2 SKR",
    odds: "1.8x",
    creator: "bob.skr",
    isExclusive: false,
    yesVotes: 25,
    noVotes: 15,
  },
  {
    id: 3,
    title: "Lakers win tonight's game?",
    stake: "10 SKR",
    odds: "1.5x",
    creator: "charlie.skr",
    isExclusive: false,
    yesVotes: 45,
    noVotes: 32,
  },
];

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [walletConnected, setWalletConnected] = useState(false);
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [username, setUsername] = useState("user.skr");
  const [betTitle, setBetTitle] = useState("");
  const [betStake, setBetStake] = useState("1");
  const [isExclusive, setIsExclusive] = useState(false);

  const ConnectWalletButton = () => (
    <TouchableOpacity
      style={styles.connectButton}
      onPress={() => setWalletConnected(!walletConnected)}
    >
      <LinearGradient
        colors={["#00D4AA", "#4D7C0F"]}
        style={styles.connectGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.connectButtonText}>
          {walletConnected ? "🟢 Connected: 7x9d...k2m1" : "Connect Wallet"}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const BetCard = ({ bet }) => {
    const [swipeDirection, setSwipeDirection] = useState(null);
    const pan = new Animated.Value(0);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 80) {
          setSwipeDirection("yes");
          Animated.timing(pan, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dx < -80) {
          setSwipeDirection("no");
          Animated.timing(pan, {
            toValue: -screenWidth,
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    });

    const backgroundColor = pan.interpolate({
      inputRange: [-screenWidth, -50, 0, 50, screenWidth],
      outputRange: ["#EF4444", "#FEE2E2", "#FFFFFF", "#DCFCE7", "#22C55E"],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[styles.betCard, { backgroundColor, transform: [{ translateX: pan }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.betHeader}>
          <Text style={styles.betTitle}>{bet.title}</Text>
          {bet.isExclusive && (
            <View style={styles.exclusiveBadge}>
              <Text style={styles.exclusiveText}>⭐ Exclusive</Text>
            </View>
          )}
        </View>

        <View style={styles.betInfo}>
          <Text style={styles.betStake}>Stake: {bet.stake}</Text>
          <Text style={styles.betOdds}>Odds: {bet.odds}</Text>
        </View>

        <View style={styles.betStats}>
          <Text style={styles.betCreator}>by {bet.creator}</Text>
          <Text style={styles.betVotes}>
            👍 {bet.yesVotes} | 👎 {bet.noVotes}
          </Text>
        </View>

        <View style={styles.swipeHints}>
          <Text style={styles.swipeHintLeft}>👈 NO</Text>
          <Text style={styles.swipeHintRight}>YES 👉</Text>
        </View>
      </Animated.View>
    );
  };

  const CreateBetModal = () => (
    <Modal visible={showCreateBet} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateBet(false)}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create New Bet</Text>
          <TouchableOpacity onPress={() => setShowCreateBet(false)}>
            <Text style={styles.createButton}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Question</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Will BTC hit $100k by Friday?"
              value={betTitle}
              onChangeText={setBetTitle}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Stake Amount</Text>
            <View style={styles.stakeInputContainer}>
              <TextInput
                style={styles.stakeInput}
                placeholder="1"
                value={betStake}
                onChangeText={setBetStake}
                keyboardType="numeric"
              />
              <Text style={styles.stakeUnit}>SKR</Text>
            </View>
          </View>

          {walletConnected && (
            <View style={styles.inputGroup}>
              <View style={styles.exclusiveToggle}>
                <Text style={styles.inputLabel}>Genesis Token Exclusive</Text>
                <TouchableOpacity
                  style={[styles.toggle, isExclusive && styles.toggleActive]}
                  onPress={() => setIsExclusive(!isExclusive)}
                >
                  <View
                    style={[styles.toggleThumb, isExclusive && styles.toggleThumbActive]}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.exclusiveNote}>
                Only visible to Genesis Token holders
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const HomeScreen = () => (
    <ScrollView style={styles.container}>
      <ConnectWalletButton />

      {walletConnected && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>🔮 Seeker Verified</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.newBetButton}
        onPress={() => setShowCreateBet(true)}
      >
        <Text style={styles.newBetText}>+ New Bet</Text>
      </TouchableOpacity>

      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>Live Predictions</Text>
        <Text style={styles.feedSubtitle}>Swipe left for NO, right for YES</Text>
      </View>

      {mockBets.map((bet) => (
        <BetCard key={bet.id} bet={bet} />
      ))}
    </ScrollView>
  );

  const FriendsScreen = () => (
    <View style={styles.container}>
      <View style={styles.friendsHeader}>
        <Text style={styles.screenTitle}>Friends</Text>
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteText}>+ Invite Friends</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>👥</Text>
        <Text style={styles.emptyStateTitle}>No friends yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Invite friends to start wagering together!
        </Text>
      </View>
    </View>
  );

  const ProfileScreen = () => (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitial}>U</Text>
        </View>
        <View style={styles.profileInfo}>
          <TextInput
            style={styles.usernameInput}
            value={username}
            onChangeText={setUsername}
          />
          {walletConnected && (
            <Text style={styles.verifiedBadge}>⭐ Genesis Token Holder</Text>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Losses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>47</Text>
          <Text style={styles.statLabel}>SKR Wagered</Text>
        </View>
      </View>

      <View style={styles.profileOptions}>
        <TouchableOpacity style={styles.profileOption}>
          <Text style={styles.profileOptionText}>🏆 Achievements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileOption}>
          <Text style={styles.profileOptionText}>📊 Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileOption}>
          <Text style={styles.profileOptionText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "friends":
        return <FriendsScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.app}>
      {renderScreen()}
      <CreateBetModal />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === "home" && styles.navItemActive]}
          onPress={() => setActiveTab("home")}
        >
          <Text style={[styles.navText, activeTab === "home" && styles.navTextActive]}>
            🏠
          </Text>
          <Text style={[styles.navLabel, activeTab === "home" && styles.navTextActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === "friends" && styles.navItemActive]}
          onPress={() => setActiveTab("friends")}
        >
          <Text style={[styles.navText, activeTab === "friends" && styles.navTextActive]}>
            👥
          </Text>
          <Text
            style={[styles.navLabel, activeTab === "friends" && styles.navTextActive]}
          >
            Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === "profile" && styles.navItemActive]}
          onPress={() => setActiveTab("profile")}
        >
          <Text style={[styles.navText, activeTab === "profile" && styles.navTextActive]}>
            👤
          </Text>
          <Text
            style={[styles.navLabel, activeTab === "profile" && styles.navTextActive]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export const sickStyles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    padding: 16,
  },

  // Connect Wallet Button
  connectButton: {
    marginBottom: 16,
  },
  connectGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  connectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "System",
  },

  // Status
  statusContainer: {
    backgroundColor: "#E0E7FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    color: "#4338CA",
    textAlign: "center",
    fontWeight: "500",
  },

  // New Bet Button
  newBetButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  newBetText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Feed Header
  feedHeader: {
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  feedSubtitle: {
    color: "#6B7280",
    fontSize: 14,
  },

  // Bet Cards
  betCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  betHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  exclusiveBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exclusiveText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "500",
  },
  betInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  betStake: {
    color: "#059669",
    fontWeight: "600",
  },
  betOdds: {
    color: "#DC2626",
    fontWeight: "600",
  },
  betStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  betCreator: {
    color: "#6B7280",
    fontSize: 14,
  },
  betVotes: {
    color: "#6B7280",
    fontSize: 14,
  },
  swipeHints: {
    flexDirection: "row",
    justifyContent: "space-between",
    opacity: 0.5,
  },
  swipeHintLeft: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  swipeHintRight: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "500",
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cancelButton: {
    color: "#6B7280",
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  createButton: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 50,
  },
  stakeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  stakeInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  stakeUnit: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  exclusiveToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    width: 50,
    height: 28,
    backgroundColor: "#D1D5DB",
    borderRadius: 14,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#8B5CF6",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    backgroundColor: "white",
    borderRadius: 12,
  },
  toggleThumbActive: {
    marginLeft: 22,
  },
  exclusiveNote: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 4,
  },

  // Friends Screen
  friendsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  inviteButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteText: {
    color: "white",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: "#6B7280",
    textAlign: "center",
  },

  // Profile Screen
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInitial: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  profileInfo: {
    flex: 1,
  },
  usernameInput: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    backgroundColor: "transparent",
    paddingVertical: 4,
  },
  verifiedBadge: {
    color: "#D97706",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 14,
  },
  profileOptions: {
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  profileOptionText: {
    fontSize: 16,
    color: "#1F2937",
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingTop: 8,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navItemActive: {
    // Active state styling handled by text color
  },
  navText: {
    fontSize: 20,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  navTextActive: {
    color: "#8B5CF6",
  },
});
