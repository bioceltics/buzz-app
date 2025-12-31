import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

type StatusType = 'active' | 'paused' | 'expired' | 'pending' | 'upcoming' | 'past';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  label?: string;
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  active: {
    bg: '#D1FAE5',
    text: '#059669',
    label: 'Active',
  },
  paused: {
    bg: '#FEF3C7',
    text: '#D97706',
    label: 'Paused',
  },
  expired: {
    bg: '#FEE2E2',
    text: '#DC2626',
    label: 'Expired',
  },
  pending: {
    bg: '#E0E7FF',
    text: '#4F46E5',
    label: 'Pending',
  },
  upcoming: {
    bg: '#DBEAFE',
    text: '#2563EB',
    label: 'Upcoming',
  },
  past: {
    bg: '#F3F4F6',
    text: '#6B7280',
    label: 'Past',
  },
};

export function StatusBadge({ status, size = 'md', label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = {
    sm: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 10 },
    md: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 },
  };

  const s = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          paddingHorizontal: s.paddingHorizontal,
          paddingVertical: s.paddingVertical,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.text, { color: config.text, fontSize: s.fontSize }]}>
        {label || config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '600',
  },
});

export default StatusBadge;
