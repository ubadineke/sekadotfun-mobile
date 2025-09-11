import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ProfilePage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Background animation values
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current;

  // Mock user data
  const userProfile = {
    username: "crypto_prophet.skr",
    displayName: "Crypto Prophet",
    balance: 1247,
    totalWagered: 15420,
    winRate: 68.5,
    totalBets: 47,
    wins: 32,
    losses: 15,
    level: "Sage",
    joinedDate: "March 2025",
    isGenesis: true,
  };

  const stats = [
    { label: "Win Rate", value: `${userProfile.winRate}%`, color: "#22C55E" },
    { label: "Total Bets", value: userProfile.totalBets, color: "#4ECDC4" },
    { label: "Wagered", value: `${userProfile.totalWagered} SKR`, color: "#8B5CF6" },
    { label: "Level", value: userProfile.level, color: "#F59E0B" },
  ];

  const menuItems = [
    {
      title: "Your Wagers",
      subtitle: "View all your active and past bets",
      icon: "🎯",
      badge: "12 Active",
    },
    {
      title: "Create Bets",
      subtitle: "Start a new prediction market",
      icon: "➕",
      color: "#667eea",
    },
    {
      title: "What's New",
      subtitle: "Updates, features & announcements",
      icon: "🆕",
      badge: "3",
    },
    {
      title: "Settings",
      subtitle: "Preferences, notifications & privacy",
      icon: "⚙️",
    },
    {
      title: "Help & Support",
      subtitle: "FAQs, tutorials & contact support",
      icon: "❓",
    },
    {
      title: "Leaderboard",
      subtitle: "See how you rank among predictors",
      icon: "🏆",
    },
  ];

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

    // Background circles animation
    const animateCircle = (circle, delay = 0, duration = 14000) => {
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
        ])
      ).start();
    };

    animateCircle(circle1, 0, 16000);
    animateCircle(circle2, 3000, 12000);
    animateCircle(circle3, 6000, 18000);
  }, []);

  const AnimatedCircle = ({ animValue, style }) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [screenHeight + 100, -200],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 0.5, 0.5, 0],
    });

    const scale = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1, 0.7],
    });

    return (
      <Animated.View
        style={[
          styles.floatingCircle,
          style,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      />
    );
  };

  const MenuItem = ({ item, index }) => {
    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    const translateY = itemAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [30, 0],
    });

    return (
      <Animated.View
        style={[
          styles.menuItemContainer,
          {
            opacity: itemAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity style={styles.menuItem}>
          <LinearGradient
            colors={
              item.color
                ? [item.color, `${item.color}80`]
                : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"]
            }
            style={styles.menuItemGradient}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <View style={styles.menuTitleRow}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={["#0F0C29", "#24243e", "#302B63"]} style={styles.container}>
      {/* Animated Background Circles */}
      <AnimatedCircle
        animValue={circle1}
        style={[styles.circle1, { backgroundColor: "rgba(147, 51, 234, 0.06)" }]}
      />
      <AnimatedCircle
        animValue={circle2}
        style={[styles.circle2, { backgroundColor: "rgba(59, 130, 246, 0.04)" }]}
      />
      <AnimatedCircle
        animValue={circle3}
        style={[styles.circle3, { backgroundColor: "rgba(16, 185, 129, 0.07)" }]}
      />

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
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Profile Header */}
          <Animated.View
            style={[
              styles.profileSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"]}
              style={styles.profileCard}
            >
              {/* Avatar and Basic Info */}
              <View style={styles.profileHeader}>
                <View style={styles.avatarSection}>
                  <LinearGradient
                    colors={["#FF6B6B", "#4ECDC4", "#45B7D1"]}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>CP</Text>
                  </LinearGradient>
                  {userProfile.isGenesis && (
                    <View style={styles.genesisIndicator}>
                      <Text style={styles.genesisText}>⭐</Text>
                    </View>
                  )}
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.displayName}>{userProfile.displayName}</Text>
                  <Text style={styles.username}>{userProfile.username}</Text>
                  <Text style={styles.joinedDate}>
                    Member since {userProfile.joinedDate}
                  </Text>
                </View>
              </View>

              {/* Balance */}
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceAmount}>{userProfile.balance} SKR</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View
            style={[
              styles.statsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Your Performance</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                    style={styles.statCardGradient}
                  >
                    <Text style={[styles.statValue, { color: stat.color }]}>
                      {stat.value}
                    </Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Menu Items */}
          <Animated.View
            style={[
              styles.menuSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            {menuItems.map((item, index) => (
              <MenuItem key={index} item={item} index={index} />
            ))}
          </Animated.View>

          {/* Disconnect Wallet */}
          <Animated.View
            style={[
              styles.disconnectSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.disconnectButton}>
              <LinearGradient
                colors={["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.1)"]}
                style={styles.disconnectGradient}
              >
                <Text style={styles.disconnectIcon}>🔌</Text>
                <Text style={styles.disconnectText}>Disconnect Wallet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* App Info */}
          <Animated.View
            style={[
              styles.appInfoSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.appInfoText}>seka.fun v1.0.0 • Powered by Solana</Text>
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

  // Background Circles
  floatingCircle: {
    position: "absolute",
    borderRadius: 1000,
  },
  circle1: {
    width: 140,
    height: 140,
    left: -70,
  },
  circle2: {
    width: 100,
    height: 100,
    right: -50,
  },
  circle3: {
    width: 160,
    height: 160,
    left: screenWidth * 0.5,
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 16,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Profile Section
  profileSection: {
    marginBottom: 24,
  },
  profileCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarSection: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  genesisIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
  },
  genesisText: {
    fontSize: 12,
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  username: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  joinedDate: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  balanceSection: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  balanceAmount: {
    color: "#4ECDC4",
    fontSize: 28,
    fontWeight: "700",
  },

  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 64) / 2,
  },
  statCardGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
  },

  // Menu Section
  menuSection: {
    marginBottom: 24,
  },
  menuItemContainer: {
    marginBottom: 12,
  },
  menuItem: {
    borderRadius: 12,
  },
  menuItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  menuTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  menuSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  menuArrow: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 20,
    fontWeight: "300",
  },

  // Disconnect Section
  disconnectSection: {
    marginBottom: 24,
  },
  disconnectButton: {
    borderRadius: 12,
  },
  disconnectGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  disconnectIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  disconnectText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },

  // App Info
  appInfoSection: {
    alignItems: "center",
  },
  appInfoText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    textAlign: "center",
  },
});
