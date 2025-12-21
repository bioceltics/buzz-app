import React from 'react';
import Svg, { Text } from 'react-native-svg';

interface BuzzeeIconProps {
  size?: number;
  color?: string;
}

// Custom Buzzee Logo Icon - Simple B letter
export function BuzzeeIcon({ size = 24, color = '#FFFFFF' }: BuzzeeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Text
        x="12"
        y="17"
        fontSize="18"
        fontWeight="bold"
        fill={color}
        textAnchor="middle"
      >
        B
      </Text>
    </Svg>
  );
}

export default BuzzeeIcon;
