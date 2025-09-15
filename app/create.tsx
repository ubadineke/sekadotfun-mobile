import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function CreateBetPage() {
  const router = useRouter()
  const [betName, setBetName] = useState('')
  const [selectedPrediction, setSelectedPrediction] = useState('')
  const [winnerMethod, setWinnerMethod] = useState('voting') // 'voting' or 'creator'
  const [isPublic, setIsPublic] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  // Background animation values
  const circle1 = useRef(new Animated.Value(0)).current
  const circle2 = useRef(new Animated.Value(0)).current
  const circle3 = useRef(new Animated.Value(0)).current

  // Prediction suggestions
  const predictionSuggestions = [
    '🏈 Who will win the next NFL game?',
    '🎮 Which game will dominate this weekend?',
    '📈 Will Bitcoin hit $100k this month?',
    '🎬 What movie will be #1 at box office?',
    '⚽ Premier League match outcome',
    '🌦️ Will it rain tomorrow?',
    '🎵 Next #1 song on Billboard',
    "📱 Apple's next product announcement",
    '🏀 NBA playoff predictions',
    '💰 Crypto market movements',
  ]

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
    const animateCircle = (circle: any, delay = 0, duration = 4000) => {
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

    animateCircle(circle1, 0, 7000)
    animateCircle(circle2, 2000, 9000)
    animateCircle(circle3, 4000, 6000)
  }, [])

  const AnimatedCircle = ({ animValue, style }) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [screenHeight + 100, -200],
    })

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 0.6, 0.6, 0],
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

  const handleCreateBet = () => {
    if (!betName.trim()) {
      Alert.alert('Missing Info', 'Please enter a bet name/description')
      return
    }
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Info', 'Please select a deadline date and time')
      return
    }

    // Here you would normally submit the bet data
    Alert.alert('Bet Created! 🎉', `"${betName}" has been created successfully!`, [
      { text: 'OK', onPress: () => router.back() },
    ])
  }

  return (
    <LinearGradient colors={['#0F0C29', '#24243e', '#302B63']} style={styles.container}>
      {/* Animated Background Circles */}
      <AnimatedCircle animValue={circle1} style={[styles.circle1, { backgroundColor: 'rgba(147, 51, 234, 0.1)' }]} />
      <AnimatedCircle animValue={circle2} style={[styles.circle2, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]} />
      <AnimatedCircle animValue={circle3} style={[styles.circle3, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]} />

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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Bet</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Bet Name Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.emoji}>🎯</Text> Bet Name/Description
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="What's your prediction about?"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={betName}
                  onChangeText={setBetName}
                  multiline
                />
              </View>
            </View>

            {/* Prediction Suggestions Slider */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.emoji}>💡</Text> Quick Suggestions
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
                {predictionSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionCard, selectedPrediction === suggestion && styles.selectedSuggestion]}
                    onPress={() => {
                      setSelectedPrediction(suggestion)
                      setBetName(suggestion)
                    }}
                  >
                    <Text
                      style={[
                        styles.suggestionText,
                        selectedPrediction === suggestion && styles.selectedSuggestionText,
                      ]}
                    >
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Winner Selection Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.emoji}>👑</Text> How to Pick Winner?
              </Text>
              <View style={styles.methodButtons}>
                <TouchableOpacity
                  style={[styles.methodButton, winnerMethod === 'voting' && styles.selectedMethod]}
                  onPress={() => setWinnerMethod('voting')}
                >
                  <LinearGradient
                    colors={
                      winnerMethod === 'voting'
                        ? ['#667eea', '#764ba2']
                        : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']
                    }
                    style={styles.methodGradient}
                  >
                    <Text style={styles.methodIcon}>🗳️</Text>
                    <Text style={[styles.methodText, winnerMethod === 'voting' && styles.selectedMethodText]}>
                      Community Voting
                    </Text>
                    <Text style={[styles.methodSubtext, winnerMethod === 'voting' && styles.selectedMethodSubtext]}>
                      Let everyone decide
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.methodButton, winnerMethod === 'creator' && styles.selectedMethod]}
                  onPress={() => setWinnerMethod('creator')}
                >
                  <LinearGradient
                    colors={
                      winnerMethod === 'creator'
                        ? ['#667eea', '#764ba2']
                        : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']
                    }
                    style={styles.methodGradient}
                  >
                    <Text style={styles.methodIcon}>👤</Text>
                    <Text style={[styles.methodText, winnerMethod === 'creator' && styles.selectedMethodText]}>
                      Creator Decides
                    </Text>
                    <Text style={[styles.methodSubtext, winnerMethod === 'creator' && styles.selectedMethodSubtext]}>
                      You pick the winner
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Public/Private Toggle */}
            <View style={styles.section}>
              <View style={styles.toggleSection}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.sectionTitle}>
                    <Text style={styles.emoji}>{isPublic ? '🌍' : '🔒'}</Text>
                    {isPublic ? ' Public Bet' : ' Private Bet'}
                  </Text>
                  <Text style={styles.toggleSubtext}>
                    {isPublic ? 'Anyone can join and see this bet' : 'Only invited friends can participate'}
                  </Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#4ECDC4' }}
                  thumbColor={isPublic ? '#FFFFFF' : '#FFFFFF'}
                  style={styles.switch}
                />
              </View>
            </View>

            {/* Deadline Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.emoji}>⏰</Text> Deadline
              </Text>
              <View style={styles.deadlineContainer}>
                <TouchableOpacity style={styles.dateTimeButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']}
                    style={styles.dateTimeGradient}
                  >
                    <Text style={styles.dateTimeIcon}>📅</Text>
                    <View style={styles.dateTimeInfo}>
                      <Text style={styles.dateTimeLabel}>Date</Text>
                      <Text style={styles.dateTimeValue}>{selectedDate || 'Select Date'}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dateTimeButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']}
                    style={styles.dateTimeGradient}
                  >
                    <Text style={styles.dateTimeIcon}>🕐</Text>
                    <View style={styles.dateTimeInfo}>
                      <Text style={styles.dateTimeLabel}>Time</Text>
                      <Text style={styles.dateTimeValue}>{selectedTime || 'Select Time'}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Create Bet Button */}
            <View style={styles.createButtonContainer}>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateBet}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.createButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.createButtonText}>Create Bet</Text>
                  <Text style={styles.createButtonIcon}>🚀</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
    left: screenWidth * 0.8,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 20,
  },

  // Input
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 16,
    padding: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 200,
  },
  selectedSuggestion: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderColor: '#4ECDC4',
  },
  suggestionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedSuggestionText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },

  // Method Selection
  methodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedMethod: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  methodGradient: {
    padding: 20,
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  methodText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedMethodText: {
    color: '#FFFFFF',
  },
  methodSubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedMethodSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Toggle
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },

  // Deadline
  deadlineContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dateTimeGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTimeInfo: {
    flex: 1,
  },
  dateTimeLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  dateTimeValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },

  // Create Button
  createButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  createButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  createButtonIcon: {
    fontSize: 18,
  },
})
