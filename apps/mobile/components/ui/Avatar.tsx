import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, RADIUS } from '../../constants/colors';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  showBadge?: boolean;
  badgeColor?: string;
  style?: ViewStyle;
}

export function Avatar({
  source,
  name,
  size = 'md',
  showBadge = false,
  badgeColor = COLORS.success,
  style,
}: AvatarProps) {
  const sizeValue = getSizeValue(size);
  const fontSize = getFontSize(size);
  const initials = getInitials(name);

  const containerStyles = [
    styles.container,
    {
      width: sizeValue,
      height: sizeValue,
      borderRadius: sizeValue / 2,
    },
    style,
  ];

  const badgeSize = Math.max(sizeValue * 0.28, 10);

  return (
    <View style={containerStyles}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
            },
          ]}
        />
      ) : name ? (
        <View style={styles.initialsContainer}>
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons
            name="person"
            size={sizeValue * 0.5}
            color={COLORS.textTertiary}
          />
        </View>
      )}

      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

function getSizeValue(size: AvatarSize): number {
  switch (size) {
    case 'xs':
      return 24;
    case 'sm':
      return 32;
    case 'md':
      return 40;
    case 'lg':
      return 52;
    case 'xl':
      return 64;
    case '2xl':
      return 80;
    default:
      return 40;
  }
}

function getFontSize(size: AvatarSize): number {
  switch (size) {
    case 'xs':
      return 10;
    case 'sm':
      return 12;
    case 'md':
      return 14;
    case 'lg':
      return 18;
    case 'xl':
      return 22;
    case '2xl':
      return 28;
    default:
      return 14;
  }
}

function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: COLORS.backgroundTertiary,
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
