import React, { useCallback, useRef, ReactNode } from 'react';
import {
  Animated,
  StyleSheet,
  ViewStyle,
  Pressable,
  View,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS, SHADOWS, ANIMATION, GRADIENTS } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient' | 'dark';

interface AnimatedCardProps {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  padding?: keyof typeof SPACING;
  borderRadius?: keyof typeof RADIUS;
  gradientColors?: readonly string[];
  animateOnMount?: boolean;
  index?: number; // For staggered animations
}

export function AnimatedCard({
  children,
  variant = 'default',
  onPress,
  disabled = false,
  style,
  padding = 'base',
  borderRadius = 'xl',
  gradientColors = GRADIENTS.primary,
  animateOnMount = true,
  index = 0,
}: AnimatedCardProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(animateOnMount ? 30 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const rotateXAnim = useRef(new Animated.Value(0)).current;

  // Mount animation
  React.useEffect(() => {
    if (animateOnMount) {
      Animated.parallel([
        Animated.spring(translateYAnim, {
          toValue: 0,
          delay: index * 80,
          useNativeDriver: true,
          ...ANIMATION.spring.smooth,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION.duration.normal,
          delay: index * 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateOnMount, index]);

  const handlePressIn = useCallback(() => {
    if (!onPress || disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ANIMATION.scale.pressedSm,
        useNativeDriver: true,
        ...ANIMATION.spring.snappy,
      }),
      Animated.spring(rotateXAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.snappy,
      }),
    ]).start();
  }, [onPress, disabled]);

  const handlePressOut = useCallback(() => {
    if (!onPress || disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.bouncy,
      }),
      Animated.spring(rotateXAnim, {
        toValue: 0,
        useNativeDriver: true,
        ...ANIMATION.spring.bouncy,
      }),
    ]).start();
  }, [onPress, disabled]);

  const rotateX = rotateXAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  });

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { translateY: translateYAnim },
      { perspective: 1000 },
      { rotateX },
    ],
    opacity: opacityAnim,
  };

  const cardPadding = SPACING[padding];
  const cardBorderRadius = RADIUS[borderRadius];

  // Glass variant
  if (variant === 'glass') {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={disabled || !onPress}
        >
          <View style={[styles.glassContainer, { borderRadius: cardBorderRadius }]}>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={60}
                tint="light"
                style={[styles.blurContent, { padding: cardPadding, borderRadius: cardBorderRadius }]}
              >
                {children}
              </BlurView>
            ) : (
              <View style={[styles.glassFallback, { padding: cardPadding, borderRadius: cardBorderRadius }]}>
                {children}
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Gradient variant
  if (variant === 'gradient') {
    return (
      <Animated.View style={[animatedStyle, SHADOWS.lg, style]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={disabled || !onPress}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientCard, { padding: cardPadding, borderRadius: cardBorderRadius }]}
          >
            {children}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Dark variant
  if (variant === 'dark') {
    return (
      <Animated.View style={[animatedStyle, SHADOWS.xl, style]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={disabled || !onPress}
        >
          <LinearGradient
            colors={GRADIENTS.dark}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.darkCard, { padding: cardPadding, borderRadius: cardBorderRadius }]}
          >
            {children}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Default, elevated, and outlined variants
  const variantStyles = {
    default: [styles.default, SHADOWS.card],
    elevated: [styles.elevated, SHADOWS.lg],
    outlined: [styles.outlined],
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        variantStyles[variant] || variantStyles.default,
        style,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || !onPress}
        style={[
          styles.card,
          { padding: cardPadding, borderRadius: cardBorderRadius },
          variant === 'outlined' && styles.outlinedInner,
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// Shimmer Loading Card
export function ShimmerCard({
  style,
  height = 200,
  borderRadius = 'xl',
}: {
  style?: ViewStyle;
  height?: number;
  borderRadius?: keyof typeof RADIUS;
}) {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.shimmerContainer,
        { height, borderRadius: RADIUS[borderRadius] },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerGradient,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={GRADIENTS.shimmer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
  },
  elevated: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderRadius: RADIUS.xl,
  },
  outlinedInner: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  glassContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  blurContent: {
    overflow: 'hidden',
  },
  glassFallback: {
    backgroundColor: COLORS.glass,
  },
  gradientCard: {
    overflow: 'hidden',
  },
  darkCard: {
    overflow: 'hidden',
  },
  shimmerContainer: {
    backgroundColor: COLORS.shimmerBase,
    overflow: 'hidden',
  },
  shimmerGradient: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
  },
});

export default AnimatedCard;
