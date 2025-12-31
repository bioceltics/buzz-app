import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '@/constants/colors';

interface HeaderWithActionProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    gradient?: readonly [string, string];
  };
  leftAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  badge?: number;
}

export function HeaderWithAction({
  title,
  subtitle,
  rightAction,
  leftAction,
  badge,
}: HeaderWithActionProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {leftAction && (
          <TouchableOpacity
            style={styles.leftButton}
            onPress={leftAction.onPress}
            activeOpacity={0.7}
          >
            <Ionicons name={leftAction.icon} size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      {rightAction && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={rightAction.onPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={rightAction.gradient || [COLORS.primary, '#D81B60']}
            style={styles.addButtonGradient}
          >
            <Ionicons
              name={rightAction.icon || 'add'}
              size={26}
              color={COLORS.white}
            />
            {badge !== undefined && badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leftButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 16,
    ...SHADOWS.sm,
  },
  addButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default HeaderWithAction;
