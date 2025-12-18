import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
}: CardProps) {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`padding_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },

  // Variants
  elevated: {
    backgroundColor: COLORS.white,
    ...SHADOWS.card,
  },
  outlined: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filled: {
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Padding
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: SPACING.md,
  },
  padding_md: {
    padding: SPACING.base,
  },
  padding_lg: {
    padding: SPACING.xl,
  },
});
