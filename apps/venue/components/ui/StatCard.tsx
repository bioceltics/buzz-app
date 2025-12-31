import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '@/constants/colors';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  iconGradient?: readonly [string, string];
  iconColor?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'glass';
}

export function StatCard({
  icon,
  value,
  label,
  iconGradient = ['rgba(233, 30, 99, 0.15)', 'rgba(233, 30, 99, 0.05)'],
  iconColor = COLORS.primary,
  size = 'md',
  variant = 'solid',
}: StatCardProps) {
  const sizeStyles = {
    sm: { iconSize: 20, valueSize: 20, labelSize: 11, iconBox: 36, padding: 12 },
    md: { iconSize: 24, valueSize: 28, labelSize: 12, iconBox: 44, padding: 16 },
    lg: { iconSize: 28, valueSize: 36, labelSize: 14, iconBox: 52, padding: 20 },
  };

  const s = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        { padding: s.padding },
        variant === 'glass' && styles.glassContainer,
      ]}
    >
      <LinearGradient
        colors={iconGradient}
        style={[styles.iconContainer, { width: s.iconBox, height: s.iconBox }]}
      >
        <Ionicons name={icon} size={s.iconSize} color={iconColor} />
      </LinearGradient>

      <Text style={[styles.value, { fontSize: s.valueSize }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={[styles.label, { fontSize: s.labelSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  label: {
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default StatCard;
