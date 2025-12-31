import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '@/constants/colors';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconGradient?: readonly [string, string];
  title: string;
  subtitle: string;
  ctaButton?: {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    gradient?: readonly [string, string];
  };
}

export function EmptyState({
  icon,
  iconGradient = [COLORS.primaryLighter, '#FDF2F8'],
  title,
  subtitle,
  ctaButton,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={iconGradient} style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={COLORS.primary} />
      </LinearGradient>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {ctaButton && (
        <TouchableOpacity
          style={styles.button}
          onPress={ctaButton.onPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={ctaButton.gradient || [COLORS.primary, '#D81B60']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {ctaButton.icon && (
              <Ionicons name={ctaButton.icon} size={22} color={COLORS.white} />
            )}
            <Text style={styles.buttonText}>{ctaButton.label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    borderRadius: 16,
    ...SHADOWS.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default EmptyState;
