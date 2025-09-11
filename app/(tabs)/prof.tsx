// import { useEffect, useRef } from 'react';
// import {
//   Animated,
//   Dimensions
// } from 'react-native';

// const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// const ProfilePage = () => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(30)).current;

//   // Background animation values
//   const circle1 = useRef(new Animated.Value(0)).current;
//   const circle2 = useRef(new Animated.Value(0)).current;
//   const circle3 = useRef(new Animated.Value(0)).current;

//   // Mock user data
//   const userProfile = {
//     username: "crypto_prophet.skr",
//     displayName: "Crypto Prophet",
//     balance: 1247,
//     totalWagered: 15420,
//     winRate: 68.5,
//     totalBets: 47,
//     wins: 32,
//     losses: 15,
//     level: "Sage",
//     joinedDate: "March 2025",
//     isGenesis: true
//   };

//   const stats = [
//     { label: "Win Rate", value: `${userProfile.winRate}%`, color: "#22C55E" },
//     { label: "Total Bets", value: userProfile.totalBets, color: "#4ECDC4" },
//     { label: "Wagered", value: `${userProfile.totalWagered} SKR`, color: "#8B5CF6" },
//     { label: "Level", value: userProfile.level, color: "#F59E0B" }
//   ];

//   const menuItems = [
//     {
//       title: "Your Wagers",
//       subtitle: "View all your active and past bets",
//       icon: "🎯",
//       badge: "12 Active"
//     },
//     {
//       title: "Create Bets",
//       subtitle: "Start a new prediction market",
//       icon: "➕",
//       color: "#667eea"
//     },
//     {
//       title: "What's New",
//       subtitle: "Updates, features & announcements",
//       icon: "🆕",
//       badge: "3"
//     },
//     {
//       title: "Settings",
//       subtitle: "Preferences, notifications & privacy",
//       icon: "⚙️"
//     },
//     {
//       title: "Help & Support",
//       subtitle: "FAQs, tutorials & contact support",
//       icon: "❓"
//     },
//     {
//       title: "Leaderboard",
//       subtitle: "See how you rank among predictors",
//       icon: "🏆"
//     }
//   ];

//   useEffect(() => {
//     // Main content animation
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Background circles animation
//     const animateCircle = (circle, delay = 0, duration = 14000) => {
//       Animated.loop(
//         Animated.sequence([
//           Animated.delay(delay),
//           Animated.timing(circle, {
//             toValue: 1,
//             duration: duration,
//             useNativeDriver: true,
//           }),
//           Animated.timing(circle, {
//             toValue: 0,
//             duration: duration,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//     };

//     animateCircle(circle1, 0, 16000);
//     animateCircle(circle2, 3000, 12000);
//     animateCircle(circle3, 6000, 18000);
//   }, []);

//   const AnimatedCircle = ({ animValue, style }) => {
//     const translateY = animValue.interpolate({
//       inputRange: [0,
