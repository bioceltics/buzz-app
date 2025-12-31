import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

interface LoadingIndicatorProps {
  delay?: number;
  duration?: number;
}

export default function LoadingIndicator({
  delay = 1200,
  duration = 1000,
}: LoadingIndicatorProps) {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 200 })
    );

    // Progress bar fill
    progress.value = withDelay(
      delay + 100,
      withTiming(1, {
        duration: duration,
        easing: Easing.inOut(Easing.ease),
      })
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]}>
          {/* Shimmer effect */}
          <View style={styles.shimmer} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    alignItems: 'center',
  },
  track: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
