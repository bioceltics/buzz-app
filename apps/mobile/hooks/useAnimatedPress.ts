import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { ANIMATION } from '@/constants/colors';

interface UseAnimatedPressOptions {
  scale?: number;
  duration?: number;
  useNativeDriver?: boolean;
}

export function useAnimatedPress(options: UseAnimatedPressOptions = {}) {
  const {
    scale = ANIMATION.scale.pressed,
    duration = ANIMATION.duration.fast,
    useNativeDriver = true,
  } = options;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: scale,
        useNativeDriver,
        ...ANIMATION.spring.snappy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: duration / 2,
        useNativeDriver,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [scale, duration, useNativeDriver]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver,
        ...ANIMATION.spring.bouncy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [duration, useNativeDriver]);

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return {
    scaleAnim,
    opacityAnim,
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
}

// Hook for staggered list animations
export function useStaggeredAnimation(itemCount: number, delay: number = 50) {
  const animations = useRef(
    Array.from({ length: itemCount }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;

  const animate = useCallback(() => {
    const animationSequence = animations.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: ANIMATION.duration.normal,
          delay: index * delay,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.spring(anim.translateY, {
          toValue: 0,
          delay: index * delay,
          useNativeDriver: true,
          ...ANIMATION.spring.smooth,
        }),
      ])
    );

    Animated.stagger(delay, animationSequence).start();
  }, [animations, delay]);

  const reset = useCallback(() => {
    animations.forEach((anim) => {
      anim.opacity.setValue(0);
      anim.translateY.setValue(20);
    });
  }, [animations]);

  const getAnimatedStyle = useCallback(
    (index: number) => ({
      opacity: animations[index]?.opacity || new Animated.Value(1),
      transform: [
        { translateY: animations[index]?.translateY || new Animated.Value(0) },
      ],
    }),
    [animations]
  );

  return { animate, reset, getAnimatedStyle };
}

// Hook for fade animations
export function useFadeAnimation(initialValue: number = 0) {
  const opacity = useRef(new Animated.Value(initialValue)).current;

  const fadeIn = useCallback(
    (duration: number = ANIMATION.duration.normal) => {
      return Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      });
    },
    [opacity]
  );

  const fadeOut = useCallback(
    (duration: number = ANIMATION.duration.normal) => {
      return Animated.timing(opacity, {
        toValue: 0,
        duration,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      });
    },
    [opacity]
  );

  return { opacity, fadeIn, fadeOut };
}

// Hook for slide animations
export function useSlideAnimation(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 50
) {
  const isVertical = direction === 'up' || direction === 'down';
  const initialValue = direction === 'up' || direction === 'left' ? distance : -distance;

  const translate = useRef(new Animated.Value(initialValue)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const slideIn = useCallback(
    (duration: number = ANIMATION.duration.normal) => {
      return Animated.parallel([
        Animated.spring(translate, {
          toValue: 0,
          useNativeDriver: true,
          ...ANIMATION.spring.smooth,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]);
    },
    [translate, opacity]
  );

  const slideOut = useCallback(
    (duration: number = ANIMATION.duration.normal) => {
      return Animated.parallel([
        Animated.spring(translate, {
          toValue: initialValue,
          useNativeDriver: true,
          ...ANIMATION.spring.smooth,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]);
    },
    [translate, opacity, initialValue]
  );

  const animatedStyle = {
    opacity,
    transform: [isVertical ? { translateY: translate } : { translateX: translate }],
  };

  return { translate, opacity, slideIn, slideOut, animatedStyle };
}

// Hook for pulse animation
export function usePulseAnimation() {
  const scale = useRef(new Animated.Value(1)).current;

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.1,
        useNativeDriver: true,
        ...ANIMATION.spring.bouncy,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.bouncy,
      }),
    ]).start();
  }, [scale]);

  const animatedStyle = {
    transform: [{ scale }],
  };

  return { scale, pulse, animatedStyle };
}

// Hook for shake animation (for errors)
export function useShakeAnimation() {
  const translateX = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(translateX, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX]);

  const animatedStyle = {
    transform: [{ translateX }],
  };

  return { translateX, shake, animatedStyle };
}

export default {
  useAnimatedPress,
  useStaggeredAnimation,
  useFadeAnimation,
  useSlideAnimation,
  usePulseAnimation,
  useShakeAnimation,
};
