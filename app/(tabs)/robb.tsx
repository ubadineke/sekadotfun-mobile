// import { LinearGradient } from "expo-linear-gradient";
// import React, { useState } from "react";
// import {
//   Animated,
//   Dimensions,
//   PanResponder,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// // import Animated from "react-native-reanimated";
// import { mockBets, sickStyles as styles } from "./home";

// const { width: screenWidth } = Dimensions.get("window");

// export default function HomeScreen() {
//   return (
//     <ScrollView style={styles.container}>
//       <ConnectWalletButton />

//       {/* {walletConnected && (
//       <View style={styles.statusContainer}>
//         <Text style={styles.statusText}>🔮 Seeker Verified</Text>
//       </View>
//     )} */}

//       <TouchableOpacity
//         style={styles.newBetButton}
//         // onPress={() => setShowCreateBet(true)}
//       >
//         <Text style={styles.newBetText}>+ New Bet</Text>
//       </TouchableOpacity>

//       <View style={styles.feedHeader}>
//         <Text style={styles.feedTitle}>Live Predictions</Text>
//         <Text style={styles.feedSubtitle}>Swipe left for NO, right for YES</Text>
//       </View>

//       {mockBets.map((bet) => (
//         <BetCard key={bet.id} bet={bet} />
//       ))}
//     </ScrollView>
//   );
// }

// const ConnectWalletButton = () => (
//   <TouchableOpacity
//     style={styles.connectButton}
//     // onPress={() => setWalletConnected(!walletConnected)}
//   >
//     <LinearGradient
//       colors={["#00D4AA", "#4D7C0F"]}
//       style={styles.connectGradient}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 0 }}
//     >
//       <Text style={styles.connectButtonText}>
//         {/* {walletConnected ? "🟢 Connected: 7x9d...k2m1" : "Connect Wallet"} */}
//       </Text>
//     </LinearGradient>
//   </TouchableOpacity>
// );

// const BetCard = ({ bet }) => {
//   const [swipeDirection, setSwipeDirection] = useState(null);
//   const pan = new Animated.Value(0);

//   const panResponder = PanResponder.create({
//     onMoveShouldSetPanResponder: (evt, gestureState) => {
//       return Math.abs(gestureState.dx) > 20;
//     },
//     onPanResponderMove: (evt, gestureState) => {
//       pan.setValue(gestureState.dx);
//     },
//     onPanResponderRelease: (evt, gestureState) => {
//       if (gestureState.dx > 80) {
//         setSwipeDirection("yes");
//         Animated.timing(pan, {
//           toValue: screenWidth,
//           duration: 300,
//           useNativeDriver: false,
//         }).start();
//       } else if (gestureState.dx < -80) {
//         setSwipeDirection("no");
//         Animated.timing(pan, {
//           toValue: -screenWidth,
//           duration: 300,
//           useNativeDriver: false,
//         }).start();
//       } else {
//         Animated.spring(pan, {
//           toValue: 0,
//           useNativeDriver: false,
//         }).start();
//       }
//     },
//   });

//   const backgroundColor = pan.interpolate({
//     inputRange: [-screenWidth, -50, 0, 50, screenWidth],
//     outputRange: ["#EF4444", "#FEE2E2", "#FFFFFF", "#DCFCE7", "#22C55E"],
//     extrapolate: "clamp",
//   });

//   return (
//     <Animated.View
//       style={[styles.betCard, { backgroundColor, transform: [{ translateX: pan }] }]}
//       {...panResponder.panHandlers}
//     >
//       <View style={styles.betHeader}>
//         <Text style={styles.betTitle}>{bet.title}</Text>
//         {bet.isExclusive && (
//           <View style={styles.exclusiveBadge}>
//             <Text style={styles.exclusiveText}>⭐ Exclusive</Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.betInfo}>
//         <Text style={styles.betStake}>Stake: {bet.stake}</Text>
//         <Text style={styles.betOdds}>Odds: {bet.odds}</Text>
//       </View>

//       <View style={styles.betStats}>
//         <Text style={styles.betCreator}>by {bet.creator}</Text>
//         <Text style={styles.betVotes}>
//           👍 {bet.yesVotes} | 👎 {bet.noVotes}
//         </Text>
//       </View>

//       <View style={styles.swipeHints}>
//         <Text style={styles.swipeHintLeft}>👈 NO</Text>
//         <Text style={styles.swipeHintRight}>YES 👉</Text>
//       </View>
//     </Animated.View>
//   );
// };
