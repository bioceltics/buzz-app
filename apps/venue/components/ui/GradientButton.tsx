import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '@/constants/colors';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  gradient?: readonly [string, string];
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  shadow?: boolean;
  style?: ViewStyle;
}

export function GradientButton({
  label,
  onPress,
  icon,
  iconPosition = 'left',
  gradient = [COLORS.primary, '#D81B60'],
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  shadow = true,
  style,
}: GradientButtonProps) {
  const sizeStyles = {
    sm: { height: 40, paddingHorizontal: 16, fontSize: 14, iconSize: 18, gap: 6 },
    md: { height: 52, paddingHorizontal: 24, fontSize: 16, iconSize: 22, gap: 8 },
    lg: { height: 60, paddingHorizontal: 32, fontSize: 18, iconSize: 24, gap: 10 },
  };

  const s = sizeStyles[size];

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={COLORS.white} size="small" />;
    }

    const iconElement = icon && (
      <Ionicons name={icon} size={s.iconSize} color={COLORS.white} />
    );

    return (
      <>
        {iconPosition === 'left' && iconElement}
        <Text style={[styles.label, { fontSize: s.fontSize }]}>{label}</Text>
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        shadow && SHADOWS.md,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? [COLORS.disabled, COLORS.disabled] : gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            height: s.height,
            paddingHorizontal: s.paddingHorizontal,
            gap: s.gap,
          },
        ]}
      >
        {renderContent()}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  label: {
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default GradientButton;
