import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Text, Rect } from 'react-native-svg';

interface BuzzeeIconProps {
  size?: number;
  color?: string;
  showBackground?: boolean;
}

// Custom Buzzee Logo Icon - 3D Metallic B with bulge effect
export function BuzzeeIcon({ size = 24, color, showBackground = false }: BuzzeeIconProps) {
  // Scale factor for the "B" to be ~3x bigger relative to the box
  const fontSize = Math.round(size * 0.85);
  const yPosition = Math.round(size * 0.78);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <Defs>
        {/* Metallic gradient - 3D bulge effect with highlights */}
        <LinearGradient id={`metallicGradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FAFAFA" />
          <Stop offset="15%" stopColor="#F0F0F0" />
          <Stop offset="35%" stopColor="#E8E8E8" />
          <Stop offset="50%" stopColor="#D8D8D8" />
          <Stop offset="65%" stopColor="#E0E0E0" />
          <Stop offset="85%" stopColor="#D0D0D0" />
          <Stop offset="100%" stopColor="#B8B8B8" />
        </LinearGradient>
        {/* Highlight gradient for 3D bulge top */}
        <LinearGradient id={`highlightGradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        {/* Background gradient */}
        <LinearGradient id={`bgGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E91E63" />
          <Stop offset="100%" stopColor="#F06292" />
        </LinearGradient>
      </Defs>

      {/* Optional background */}
      {showBackground && (
        <Rect
          x="0"
          y="0"
          width={size}
          height={size}
          rx={size * 0.2}
          fill={`url(#bgGradient-${size})`}
        />
      )}

      {/* Main metallic B */}
      <Text
        x={size / 2}
        y={yPosition}
        fontSize={fontSize}
        fontWeight="900"
        fill={color || `url(#metallicGradient-${size})`}
        textAnchor="middle"
      >
        B
      </Text>

      {/* Highlight overlay for 3D bulge effect */}
      {!color && (
        <Text
          x={size / 2}
          y={yPosition}
          fontSize={fontSize}
          fontWeight="900"
          fill={`url(#highlightGradient-${size})`}
          textAnchor="middle"
          opacity="0.4"
        >
          B
        </Text>
      )}
    </Svg>
  );
}

export default BuzzeeIcon;
