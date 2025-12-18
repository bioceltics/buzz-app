import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/colors';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  style,
}: BadgeProps) {
  const badgeStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
  ];

  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;
  const iconColor = getIconColor(variant);

  return (
    <View style={badgeStyles}>
      {icon && (
        <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.icon} />
      )}
      <Text style={textStyles}>{label}</Text>
    </View>
  );
}

function getIconColor(variant: BadgeVariant): string {
  switch (variant) {
    case 'primary':
      return COLORS.white;
    case 'secondary':
      return COLORS.text;
    case 'success':
      return COLORS.successDark;
    case 'warning':
      return COLORS.warningDark;
    case 'error':
      return COLORS.errorDark;
    case 'info':
      return COLORS.infoDark;
    case 'outline':
      return COLORS.primary;
    default:
      return COLORS.text;
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.backgroundTertiary,
  },
  success: {
    backgroundColor: COLORS.successLight,
  },
  warning: {
    backgroundColor: COLORS.warningLight,
  },
  error: {
    backgroundColor: COLORS.errorLight,
  },
  info: {
    backgroundColor: COLORS.infoLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  size_lg: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },

  // Text
  text: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  text_primary: {
    color: COLORS.white,
  },
  text_secondary: {
    color: COLORS.text,
  },
  text_success: {
    color: COLORS.successDark,
  },
  text_warning: {
    color: COLORS.warningDark,
  },
  text_error: {
    color: COLORS.errorDark,
  },
  text_info: {
    color: COLORS.infoDark,
  },
  text_outline: {
    color: COLORS.primary,
  },

  // Text Sizes
  textSize_sm: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  textSize_md: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  textSize_lg: {
    fontSize: TYPOGRAPHY.sizes.base,
  },

  // Icon
  icon: {
    marginRight: SPACING.xs,
  },
});
