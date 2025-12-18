import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
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
  TextInput,
  ActivityIndicator,
} from "react-native";

import { SuccessModal } from "@/components/success-modal";
import { formatSol } from "@/utils/format";
import { useAccountBalance } from "@/hooks/use-account-balance";
import { apiService } from "@/services/api";
import { useAuthorization } from "@/components/solana/use-authorization";
import { useCluster } from "@/components/cluster/cluster-provider";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ProfilePage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Background animation values
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current;

  // Data state
  const { formattedBalance } = useAccountBalance();
  const { selectedAccount } = useAuthorization();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'wagers' | 'created'>('wagers');
  const [userWagers, setUserWagers] = useState<any[]>([]);
  const [createdBets, setCreatedBets] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSeekerId, setEditSeekerId] = useState("");
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    fetchUserData();
  }, [selectedAccount]);

  const fetchUserData = async () => {
    if (!selectedAccount) return;

    try {
      // 1. Get User ID from Wallet Address
      const walletAddress = selectedAccount.publicKey.toBase58();
      const user = await apiService.getUserByWallet(walletAddress);

      if (!user) {
        console.error("User not found for wallet:", walletAddress);
        return;
      }

      // 2. Fetch Stats & Wagers with real ID
      const [statsData, wagersData, createdData] = await Promise.all([
        apiService.getUserStats(user.id),
        apiService.getUserWagers(),
        apiService.getCreatedBets()
      ]);

      setUserProfile({
        username: user.seekerId || `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}.skr`,
        displayName: user.name || "Anon Seeker",
        balance: formattedBalance,
        totalWagered: statsData.totalWageredAmount,
        totalBets: statsData.totalBetsCreated,
        wins: 0, // Not yet tracked
        losses: 0, // Not yet tracked
        level: "Seeker", // Placeholder
        joinedDate: new Date(statsData.memberSince).toLocaleDateString(),
        isGenesis: false, // Placeholder
      });

      setUserWagers(wagersData);
      setCreatedBets(createdData);

      setStats([
        { label: "Win Rate", value: "N/A", color: "#22C55E" },
        { label: "Total Bets", value: statsData.totalBetsCreated, color: "#4ECDC4" },
        { label: "Wagered", value: `${formatSol(statsData.totalWageredAmount)} SKR`, color: "#8B5CF6" },
        { label: "Level", value: "Seeker", color: "#F59E0B" },
      ]);

    } catch (e) {
      console.error("Failed to fetch user profile", e);
    }
  };



  const menuItems = [
    {
      title: "Your Wagers",
      subtitle: "View all your active and past bets",
      icon: "🎯",
      badge: userWagers.filter(w => w.bet?.status === 'active').length > 0 ? `${userWagers.filter(w => w.bet?.status === 'active').length} Active` : undefined,
      badgeColor: "#22C55E",
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
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditName(userProfile?.displayName || "");
              setEditSeekerId(userProfile?.username || "");
              setIsEditing(true);
            }}
          >
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
                    <Text style={styles.avatarText}>👤</Text>
                  </LinearGradient>
                  {userProfile?.isGenesis && (
                    <View style={styles.genesisIndicator}>
                      <Text style={styles.genesisText}>⭐</Text>
                    </View>
                  )}
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.displayName}>{userProfile?.displayName || "Loading..."}</Text>
                  <Text style={styles.username}>{userProfile?.username || "..."}</Text>
                  <Text style={styles.joinedDate}>
                    Member since {userProfile?.joinedDate || '...'}
                  </Text>
                </View>
              </View>

              {/* Edit Form */}
              {isEditing && (
                <View style={styles.editForm}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <Text style={[styles.sectionTitle, { fontSize: 18, marginBottom: 0 }]}>Edit Profile</Text>
                    <TouchableOpacity onPress={() => setIsEditing(false)} style={{ padding: 5 }}>
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.editLabel}>Display Name</Text>
                  <TextInput
                    style={styles.editInput}
                    placeholder={userProfile?.displayName}
                    placeholderTextColor="#666"
                    value={editName}
                    onChangeText={setEditName}
                  />
                  <Text style={styles.editLabel}>Seeker ID</Text>
                  <TextInput
                    style={styles.editInput}
                    placeholder={userProfile?.username}
                    placeholderTextColor="#666"
                    value={editSeekerId}
                    onChangeText={setEditSeekerId}
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={async () => {
                      if (isSaving) return;
                      setIsSaving(true);
                      try {
                        if (!selectedAccount) return;
                        // Resolve user ID again (or we could store it in state)
                        const user = await apiService.getUserByWallet(selectedAccount.publicKey.toBase58());
                        if (!user) return;

                        await apiService.updateProfile(user.id, {
                          name: editName,
                          seekerId: editSeekerId
                        });
                        fetchUserData();
                        setIsEditing(false);
                      } catch (e) {
                        // @ts-ignore
                        console.log("Full Error", e.response?.data?.message)
                        console.error("Failed to update profile", e);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Balance */}
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceAmount}>{formattedBalance} SKR</Text>
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
              {stats && stats.map((stat, index) => (
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



          {/* Menu Section */}
          <Animated.View
            style={[
              styles.menuSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {menuItems.map((item, index) => (
              <View key={index} style={styles.menuItemContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    if (item.title === "Your Wagers") {
                      router.push("/wagers");
                    } else if (item.title === "Create Bets") {
                      router.push("/create");
                    } else {
                      // Navigate to other pages as implemented
                      console.log(`Navigating to ${item.title}`);
                    }
                  }}
                >
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
                            <View style={[styles.badge, item.badgeColor ? { backgroundColor: item.badgeColor } : {}]}>
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
              </View>
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
    </LinearGradient >
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
  listContainer: {
    marginBottom: 20
  },
  listItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8
  },
  listItemTitle: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  listItemSubtitle: {
    color: '#CCC',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 20
  },
  createBetButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  createBetButtonText: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  editForm: {
    marginVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: 10
  },
  editLabel: {
    color: '#CCC',
    marginBottom: 5
  },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  saveButton: {
    backgroundColor: '#22C55E',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});
