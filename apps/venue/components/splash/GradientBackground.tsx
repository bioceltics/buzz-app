import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function GradientBackground() {
  const backgroundOpacity = useSharedValue(0);
  const auroraOpacity = useSharedValue(0);
  const auroraTranslateX = useSharedValue(-width * 0.3);

  useEffect(() => {
    // Fade in main gradient
    backgroundOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });

    // Aurora overlay animation
    auroraOpacity.value = withDelay(
      300,
      withSequence(
        withTiming(0.4, { duration: 600 }),
        withTiming(0.2, { duration: 800 })
      )
    );

    // Subtle aurora shift
    auroraTranslateX.value = withDelay(
      300,
      withTiming(width * 0.3, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      })
    );
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const auroraStyle = useAnimatedStyle(() => ({
    opacity: auroraOpacity.value,
    transform: [{ translateX: auroraTranslateX.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Main gradient background */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight, '#FCE4EC']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Aurora overlay - subtle shifting gradient */}
      <Animated.View style={[styles.auroraContainer, auroraStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            COLORS.secondary + '30',
            COLORS.accent + '20',
            'transparent',
          ]}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aurora}
        />
      </Animated.View>

      {/* Top highlight */}
      <View style={styles.topHighlight}>
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  auroraContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  aurora: {
    width: width * 1.6,
    height: height * 1.2,
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.3,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
  },
});
