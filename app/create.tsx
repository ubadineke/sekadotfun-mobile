import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useCreateBet } from '@/hooks/use-create-bet'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function CreateBetPage() {
  const router = useRouter()
  const [betName, setBetName] = useState('')
  const [selectedPrediction, setSelectedPrediction] = useState('')
  const [winnerMethod, setWinnerMethod] = useState('voting') // 'voting' or 'creator'
  const [isPublic, setIsPublic] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  // Date/Time picker modal state
  const [showDateModal, setShowDateModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [tempDate, setTempDate] = useState({ year: '', month: '', day: '' })
  const [tempTime, setTempTime] = useState({ hour: '', minute: '' })

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successSignature, setSuccessSignature] = useState('')

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

  // Date/Time picker handlers
  const showDatePicker = () => {
    const now = new Date()
    setTempDate({
      year: now.getFullYear().toString(),
      month: (now.getMonth() + 1).toString().padStart(2, '0'),
      day: now.getDate().toString().padStart(2, '0'),
    })
    setShowDateModal(true)
  }

  const showTimePicker = () => {
    const now = new Date()
    setTempTime({
      hour: now.getHours().toString().padStart(2, '0'),
      minute: now.getMinutes().toString().padStart(2, '0'),
    })
    setShowTimeModal(true)
  }

  const confirmDate = () => {
    const { year, month, day } = tempDate
    if (year && month && day) {
      setSelectedDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    }
    setShowDateModal(false)
  }

  const confirmTime = () => {
    const { hour, minute } = tempTime
    if (hour && minute) {
      setSelectedTime(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`)
    }
    setShowTimeModal(false)
  }

  const { createBet, isLoading: isCreatingBet } = useCreateBet()

  const handleCreateBet = async () => {
    if (!betName.trim()) {
      Alert.alert('Missing Info', 'Please enter a bet name/description')
      return
    }
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Info', 'Please select a deadline date and time')
      return
    }

    try {
      // Parse the selected date and time into a Date object
      // Expected format: selectedDate = "2024-12-25", selectedTime = "14:30"
      const endsAt = new Date(`${selectedDate}T${selectedTime}:00`)

      if (isNaN(endsAt.getTime())) {
        Alert.alert('Invalid Date', 'Please select a valid date and time')
        return
      }

      if (endsAt <= new Date()) {
        Alert.alert('Invalid Date', 'End time must be in the future')
        return
      }

      const result = await createBet({
        description: betName,
        decisionMethod: winnerMethod === 'voting' ? 'voting' : 'creatorDecides',
        type: isPublic ? 'public' : 'private',
        endsAt,
      })

      setSuccessSignature(result.signature)
      setShowSuccessModal(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create bet'
      Alert.alert('Error', message)
    }
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
                <TouchableOpacity style={styles.dateTimeButton} onPress={showDatePicker}>
                  <LinearGradient
                    colors={selectedDate ? ['rgba(78,205,196,0.2)', 'rgba(78,205,196,0.3)'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']}
                    style={styles.dateTimeGradient}
                  >
                    <Text style={styles.dateTimeIcon}>📅</Text>
                    <View style={styles.dateTimeInfo}>
                      <Text style={styles.dateTimeLabel}>Date</Text>
                      <Text style={[styles.dateTimeValue, selectedDate && styles.dateTimeValueSelected]}>
                        {selectedDate || 'Select Date'}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dateTimeButton} onPress={showTimePicker}>
                  <LinearGradient
                    colors={selectedTime ? ['rgba(78,205,196,0.2)', 'rgba(78,205,196,0.3)'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']}
                    style={styles.dateTimeGradient}
                  >
                    <Text style={styles.dateTimeIcon}>🕐</Text>
                    <View style={styles.dateTimeInfo}>
                      <Text style={styles.dateTimeLabel}>Time</Text>
                      <Text style={[styles.dateTimeValue, selectedTime && styles.dateTimeValueSelected]}>
                        {selectedTime || 'Select Time'}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Date Picker Modal */}
              <Modal
                visible={showDateModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDateModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>📅 Select Date</Text>
                    <View style={styles.dateInputRow}>
                      <View style={styles.dateInputContainer}>
                        <Text style={styles.dateInputLabel}>Year</Text>
                        <TextInput
                          style={styles.dateInput}
                          placeholder="YYYY"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          keyboardType="number-pad"
                          maxLength={4}
                          value={tempDate.year}
                          onChangeText={(text) => setTempDate(prev => ({ ...prev, year: text }))}
                        />
                      </View>
                      <View style={styles.dateInputContainer}>
                        <Text style={styles.dateInputLabel}>Month</Text>
                        <TextInput
                          style={styles.dateInput}
                          placeholder="MM"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          keyboardType="number-pad"
                          maxLength={2}
                          value={tempDate.month}
                          onChangeText={(text) => setTempDate(prev => ({ ...prev, month: text }))}
                        />
                      </View>
                      <View style={styles.dateInputContainer}>
                        <Text style={styles.dateInputLabel}>Day</Text>
                        <TextInput
                          style={styles.dateInput}
                          placeholder="DD"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          keyboardType="number-pad"
                          maxLength={2}
                          value={tempDate.day}
                          onChangeText={(text) => setTempDate(prev => ({ ...prev, day: text }))}
                        />
                      </View>
                    </View>
                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDateModal(false)}>
                        <Text style={styles.modalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmDate}>
                        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modalConfirmGradient}>
                          <Text style={styles.modalConfirmText}>Confirm</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Time Picker Modal */}
              <Modal
                visible={showTimeModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowTimeModal(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>🕐 Select Time</Text>
                    <View style={styles.dateInputRow}>
                      <View style={styles.dateInputContainer}>
                        <Text style={styles.dateInputLabel}>Hour (0-23)</Text>
                        <TextInput
                          style={styles.dateInput}
                          placeholder="HH"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          keyboardType="number-pad"
                          maxLength={2}
                          value={tempTime.hour}
                          onChangeText={(text) => setTempTime(prev => ({ ...prev, hour: text }))}
                        />
                      </View>
                      <View style={styles.dateInputContainer}>
                        <Text style={styles.dateInputLabel}>Minute</Text>
                        <TextInput
                          style={styles.dateInput}
                          placeholder="MM"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          keyboardType="number-pad"
                          maxLength={2}
                          value={tempTime.minute}
                          onChangeText={(text) => setTempTime(prev => ({ ...prev, minute: text }))}
                        />
                      </View>
                    </View>
                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowTimeModal(false)}>
                        <Text style={styles.modalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmTime}>
                        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modalConfirmGradient}>
                          <Text style={styles.modalConfirmText}>Confirm</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>

            {/* Create Bet Button */}
            <View style={styles.createButtonContainer}>
              <TouchableOpacity
                style={[styles.createButton, isCreatingBet && styles.createButtonDisabled]}
                onPress={handleCreateBet}
                disabled={isCreatingBet}
              >
                <LinearGradient
                  colors={isCreatingBet ? ['#555', '#666'] : ['#667eea', '#764ba2']}
                  style={styles.createButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isCreatingBet ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.createButtonText}>Creating...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.createButtonText}>Create Bet</Text>
                      <Text style={styles.createButtonIcon}>🚀</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {/* Success Modal */}
            <Modal
              visible={showSuccessModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => router.back()}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.successEmoji}>🎉</Text>
                  <Text style={styles.modalTitle}>Bet Created!</Text>
                  <Text style={styles.successDescription}>"{betName}" is now live on the blockchain.</Text>

                  <View style={styles.txContainer}>
                    <Text style={styles.txLabel}>Transaction Hash</Text>
                    <Text style={styles.txHash} numberOfLines={1} ellipsizeMode="middle">
                      {successSignature}
                    </Text>
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => Alert.alert('Share', 'Sharing functionality coming soon!')}
                    >
                      <Text style={styles.modalCancelText}>🔗 Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => router.back()}>
                      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.modalConfirmGradient}>
                        <Text style={styles.modalConfirmText}>Done</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>


          </Animated.View>
        </ScrollView>
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
  dateTimeValueSelected: {
    color: '#4ECDC4',
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
  createButtonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1F1F3D',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInputLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    padding: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Success Modal Specifics
  successEmoji: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 16,
  },
  successDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  txContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  txLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  txHash: {
    color: '#4ECDC4',
    fontSize: 14,
    fontFamily: 'monospace',
  },
})
