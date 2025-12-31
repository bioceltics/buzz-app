import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  startX: number;
  startY: number;
  color: string;
  size: number;
  delay: number;
  driftX: number;
  floatDistance: number;
}

const PARTICLE_COLORS = [
  COLORS.primary,
  COLORS.primaryLight,
  COLORS.secondary,
  COLORS.accent,
  '#F06292',
  '#A78BFA',
];

function generateParticles(count: number): Particle[] {
  const centerX = width / 2;
  const centerY = height / 2 - 40;
  const radius = 80;

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.3;
    const radiusVariation = radius + Math.random() * 30 - 15;

    return {
      id: i,
      startX: centerX + Math.cos(angle) * radiusVariation - width / 2,
      startY: centerY + Math.sin(angle) * radiusVariation - height / 2,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 6 + Math.random() * 8,
      delay: 600 + i * 100 + Math.random() * 100,
      driftX: (Math.random() - 0.5) * 60,
      floatDistance: 80 + Math.random() * 60,
    };
  });
}

interface ParticleComponentProps {
  particle: Particle;
}

function ParticleComponent({ particle }: ParticleComponentProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    // Float up
    translateY.value = withDelay(
      particle.delay,
      withTiming(-particle.floatDistance, {
        duration: 1800,
        easing: Easing.out(Easing.ease),
      })
    );

    // Drift horizontally
    translateX.value = withDelay(
      particle.delay,
      withTiming(particle.driftX, {
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
      })
    );

    // Fade in then out
    opacity.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(0.9, { duration: 400, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.in(Easing.ease) })
      )
    );

    // Scale up then down
    scale.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
        withTiming(0.5, { duration: 1400, easing: Easing.in(Easing.ease) })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: particle.startX + translateX.value },
      { translateY: particle.startY + translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          shadowColor: particle.color,
        },
      ]}
    />
  );
}

interface ParticleSystemProps {
  count?: number;
}

export default function ParticleSystem({ count = 10 }: ParticleSystemProps) {
  const particles = useMemo(() => generateParticles(count), [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleComponent key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
});
