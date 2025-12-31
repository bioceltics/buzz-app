import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import GradientBackground from './GradientBackground';
import LogoAnimation from './LogoAnimation';
import ParticleSystem from './ParticleSystem';
import LoadingIndicator from './LoadingIndicator';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
  isReady?: boolean;
}

export default function AnimatedSplashScreen({
  onAnimationComplete,
  isReady = true,
}: AnimatedSplashScreenProps) {
  const exitScale = useSharedValue(1);
  const exitOpacity = useSharedValue(1);

  const triggerExit = useCallback(() => {
    'worklet';
    exitScale.value = withTiming(1.15, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    exitOpacity.value = withTiming(
      0,
      {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      }
    );
  }, [onAnimationComplete]);

  useEffect(() => {
    // Total animation duration before exit: ~2500ms
    // Exit starts after loading completes
    if (!isReady) return;

    const exitTimer = setTimeout(() => {
      triggerExit();
    }, 2500);

    return () => clearTimeout(exitTimer);
  }, [isReady, triggerExit]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exitScale.value }],
    opacity: exitOpacity.value,
  }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View style={[styles.container, containerStyle]}>
        {/* Animated gradient background */}
        <GradientBackground />

        {/* Floating particles */}
        <ParticleSystem count={10} />

        {/* Center content */}
        <View style={styles.content}>
          {/* Animated logo with glow */}
          <LogoAnimation />

          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            <LoadingIndicator delay={1200} duration={1000} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E91E63', // Fallback color
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
  },
});
