import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BuzzeeIconProps {
  size?: number;
  color?: string;
}

// Custom Buzzee Logo Icon - Simple B letter (matches dashboard styling)
export function BuzzeeIcon({ size = 24, color = '#FFFFFF' }: BuzzeeIconProps) {
  // Scale font size proportionally (dashboard uses 20px in 40px container = 50%)
  const fontSize = size * 0.5;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.letter, { fontSize, color }]}>B</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default BuzzeeIcon;
