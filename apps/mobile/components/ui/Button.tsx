import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, ANIMATION, GRADIENTS } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      ...ANIMATION.spring.snappy,
    }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...ANIMATION.spring.bouncy,
    }).start();
  }, []);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, minHeight: 40 };
      case 'lg':
        return { paddingHorizontal: SPACING['2xl'], paddingVertical: SPACING.base, minHeight: 56 };
      case 'xl':
        return { paddingHorizontal: SPACING['3xl'], paddingVertical: SPACING.lg, minHeight: 64 };
      default:
        return { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, minHeight: 48 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return TYPOGRAPHY.sizes.sm;
      case 'lg':
      case 'xl':
        return TYPOGRAPHY.sizes.md;
      default:
        return TYPOGRAPHY.sizes.base;
    }
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' || size === 'xl' ? 22 : 18;

  const getIconColor = () => {
    if (isDisabled) return COLORS.disabledText;
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'success':
        return COLORS.white;
      case 'outline':
      case 'ghost':
        return COLORS.primary;
      case 'secondary':
        return COLORS.text;
      default:
        return COLORS.white;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return COLORS.disabledText;
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'success':
        return COLORS.white;
      case 'outline':
      case 'ghost':
        return COLORS.primary;
      case 'secondary':
        return COLORS.text;
      default:
        return COLORS.white;
    }
  };

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={iconSize}
              color={getIconColor()}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              { fontSize: getTextSize(), color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={iconSize}
              color={getIconColor()}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </View>
  );

  const sizeStyles = getSizeStyles();

  // Primary button with gradient
  if (variant === 'primary') {
    return (
      <Animated.View
        style={[
          styles.wrapper,
          fullWidth && styles.fullWidth,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={isDisabled}
          style={styles.pressable}
        >
          <LinearGradient
            colors={isDisabled ? [COLORS.disabled, COLORS.disabled] : GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientButton, sizeStyles, isDisabled && styles.disabledOpacity]}
          >
            {renderContent()}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Success button with gradient
  if (variant === 'success') {
    return (
      <Animated.View
        style={[
          styles.wrapper,
          fullWidth && styles.fullWidth,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={isDisabled}
          style={styles.pressable}
        >
          <LinearGradient
            colors={isDisabled ? [COLORS.disabled, COLORS.disabled] : GRADIENTS.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientButton, sizeStyles, isDisabled && styles.disabledOpacity]}
          >
            {renderContent()}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Danger button
  if (variant === 'danger') {
    return (
      <Animated.View
        style={[
          styles.wrapper,
          fullWidth && styles.fullWidth,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={isDisabled}
          style={[
            styles.solidButton,
            sizeStyles,
            { backgroundColor: isDisabled ? COLORS.disabled : COLORS.error },
            isDisabled && styles.disabledOpacity,
          ]}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
    );
  }

  // Outline button
  if (variant === 'outline') {
    return (
      <Animated.View
        style={[
          styles.wrapper,
          fullWidth && styles.fullWidth,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={isDisabled}
          style={[
            styles.outlineButton,
            sizeStyles,
            isDisabled && styles.disabledOpacity,
          ]}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
    );
  }

  // Ghost button
  if (variant === 'ghost') {
    return (
      <Animated.View
        style={[
          styles.wrapper,
          fullWidth && styles.fullWidth,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={isDisabled}
          style={[
            styles.ghostButton,
            sizeStyles,
            isDisabled && styles.disabledOpacity,
          ]}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
    );
  }

  // Secondary button (default fallback)
  return (
    <Animated.View
      style={[
        styles.wrapper,
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.secondaryButton,
          sizeStyles,
          isDisabled && styles.disabledOpacity,
        ]}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  pressable: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
  },
  solidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    backgroundColor: 'transparent',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundTertiary,
  },
  disabledOpacity: {
    opacity: 0.6,
  },
  text: {
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default Button;
