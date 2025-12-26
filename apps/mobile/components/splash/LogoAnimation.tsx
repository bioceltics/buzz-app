import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '@/constants/colors';

interface LogoAnimationProps {
  onEntranceComplete?: () => void;
}

export default function LogoAnimation({ onEntranceComplete }: LogoAnimationProps) {
  const logoScale = useSharedValue(0.3);
  const logoRotation = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);

  useEffect(() => {
    // Logo entrance - fade in
    logoOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 300 })
    );

    // Logo scale - bouncy entrance with overshoot
    logoScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.15, {
          damping: 8,
          stiffness: 180,
          mass: 0.8,
        }),
        withSpring(1, {
          damping: 15,
          stiffness: 250,
        })
      )
    );

    // Logo rotation - 360 degrees
    logoRotation.value = withDelay(
      200,
      withTiming(360, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Glow pulse - repeating
    glowIntensity.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        true // Reverse
      )
    );

    // Text reveal
    textOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    textTranslateY.value = withDelay(
      1000,
      withSpring(0, {
        damping: 20,
        stiffness: 150,
        mass: 1,
      })
    );

    // Call onEntranceComplete after main animations
    if (onEntranceComplete) {
      setTimeout(onEntranceComplete, 1200);
    }
  }, []);

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glowIntensity.value, [0, 1], [0.3, 0.8]),
    shadowRadius: interpolate(glowIntensity.value, [0, 1], [15, 35]),
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowIntensity.value, [0, 1], [0.3, 0.6]),
    transform: [
      { scale: interpolate(glowIntensity.value, [0, 1], [1, 1.15]) },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Outer glow layer */}
      <Animated.View style={[styles.glowOuter, innerGlowStyle]} />

      {/* Logo container with glow */}
      <Animated.View style={[styles.logoWrapper, glowStyle]}>
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>B</Text>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Brand name text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.brandName}>Buzzee</Text>
        <Text style={styles.tagline}>Discover. Connect. Experience.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  logoWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    overflow: 'hidden',
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 4,
  },
  textContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  brandName: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    letterSpacing: 1,
  },
});
