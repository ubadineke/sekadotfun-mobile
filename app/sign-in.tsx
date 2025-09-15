import { AppView } from '@/components/app-view'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@react-navigation/elements'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, Dimensions, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Buffer } from 'buffer'
import 'react-native-get-random-values'
import 'text-encoding-polyfill'
global.Buffer = Buffer

import { Link } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function SignIn() {
  const { signIn, isLoading } = useAuth()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  // Background animation values
  const circle1 = useRef(new Animated.Value(0)).current
  const circle2 = useRef(new Animated.Value(0)).current
  const circle3 = useRef(new Animated.Value(0)).current
  const circle4 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Main content animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
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

    animateCircle(circle1, 0, 6000)
    animateCircle(circle2, 1000, 8000)
    animateCircle(circle3, 2000, 5000)
    animateCircle(circle4, 3000, 7000)
  }, [])

  const AnimatedCircle = ({ animValue, style }) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [screenHeight + 100, -200],
    })

    const opacity = animValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    })

    const scale = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1, 0.8],
    })

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
    )
  }
  return (
    <AppView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      <LinearGradient colors={['#0F0C29', '#24243e', '#302B63']} style={styles.container}>
        <AnimatedCircle animValue={circle1} style={[styles.circle1, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]} />
        <AnimatedCircle animValue={circle2} style={[styles.circle2, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]} />
        <AnimatedCircle animValue={circle3} style={[styles.circle3, { backgroundColor: 'rgba(16, 185, 129, 0.18)' }]} />
        <AnimatedCircle
          animValue={circle4}
          style={[styles.circle4, { backgroundColor: 'rgba(245, 101, 101, 0.10)' }]}
        />
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <SafeAreaView
            style={{
              flex: 1,
              justifyContent: 'space-between',
            }}
          >
            {/* Dummy view to push the next view to the center. */}
            <View style={styles.content}>
              {/* Main Logo and Title */}
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                  },
                ]}
              >
                {/* Logo Icon */}
                <View style={styles.logoIcon}>
                  <LinearGradient
                    colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                    style={styles.logoGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.logoEmoji}>🎯</Text>
                  </LinearGradient>
                </View>

                {/* App Name */}
                <View style={styles.titleContainer}>
                  <Text style={styles.appName}>
                    <Text style={styles.appNameBold}>seka</Text>
                    <Text style={styles.appNameDot}>.fun</Text>
                  </Text>
                </View>

                {/* Subtitle */}
                <Animated.Text
                  style={[
                    styles.subtitle,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  Bet on your friends, predictions & events.{'\n'}
                  Make the most of your $SKR tokens ⚡
                </Animated.Text>
              </Animated.View>

              {/* Feature Highlights */}
              <Animated.View
                style={[
                  styles.featuresContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.featureRow}>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>🎲</Text>
                    <Text style={styles.featureText}>Quick Bets</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>👥</Text>
                    <Text style={styles.featureText}>Social Fun</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>💎</Text>
                    <Text style={styles.featureText}>SKR Rewards</Text>
                  </View>
                </View>
              </Animated.View>

              {/* Get Started Button */}
              <Animated.View
                style={[
                  styles.buttonContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Link href="/(tabs)" asChild>
                  <TouchableOpacity style={styles.getStartedButton}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.buttonText}>Get Started</Text>

                      <Text style={styles.buttonArrow}>→</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>

                <TouchableOpacity style={styles.learnMoreButton}>
                  <Text style={styles.learnMoreText}>Learn More</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
            <View />
            {/* <View style={{ alignItems: 'center', gap: 16 }}>
              <AppText type="title">{AppConfig.name}</AppText>
              <Image source={require('../assets/images/icon.png')} style={{ width: 128, height: 128 }} />
            </View> */}
            <View style={{ marginBottom: 16 }}>
              <Button
                variant="filled"
                style={{ marginHorizontal: 16 }}
                onPress={async () => {
                  await signIn()
                  // Navigate after signing in. You may want to tweak this to ensure sign-in is
                  // successful before navigating.
                  router.replace('/')
                }}
              >
                Connect
              </Button>
            </View>
          </SafeAreaView>
        )}
      </LinearGradient>
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // Background Circles
  floatingCircle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: 120,
    height: 120,
    left: -60,
  },
  circle2: {
    width: 200,
    height: 200,
    right: -100,
  },
  circle3: {
    width: 80,
    height: 80,
    left: screenWidth * 0.7,
  },
  circle4: {
    width: 150,
    height: 150,
    left: screenWidth * 0.1,
  },

  // Logo and Title
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 32,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 48,
    textAlign: 'center',
  },
  appNameBold: {
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appNameDot: {
    fontWeight: '300',
    color: '#4ECDC4',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },

  // Features
  featuresContainer: {
    marginBottom: 50,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: screenWidth * 0.8,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Buttons
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '300',
  },
  learnMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  learnMoreText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // Footer
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    textAlign: 'center',
  },
})
