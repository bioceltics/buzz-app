import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION, GRADIENTS } from '../../constants/colors';

type InputVariant = 'default' | 'outlined' | 'filled';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  variant?: InputVariant;
  animated?: boolean;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  icon,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  disabled = false,
  variant = 'default',
  animated = true,
  required = false,
  secureTextEntry,
  value,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  // Support both icon and leftIcon props
  const inputIcon = leftIcon || icon;
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  // Animation values
  const focusAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const labelPositionAnim = useRef(new Animated.Value(hasValue || !!value ? 1 : 0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const isPassword = secureTextEntry !== undefined;
  const showPassword = isPassword && isPasswordVisible;

  // Update hasValue when value changes
  useEffect(() => {
    setHasValue(!!value);
    if (value) {
      Animated.timing(labelPositionAnim, {
        toValue: 1,
        duration: ANIMATION.duration.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [value]);

  // Focus animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: isFocused ? 1 : 0,
        duration: ANIMATION.duration.normal,
        useNativeDriver: false,
      }),
      Animated.spring(glowAnim, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: false,
        ...ANIMATION.spring.snappy,
      }),
      Animated.spring(iconScaleAnim, {
        toValue: isFocused ? 1.15 : 1,
        useNativeDriver: true,
        ...ANIMATION.spring.bouncy,
      }),
    ]).start();
  }, [isFocused]);

  // Error shake animation
  useEffect(() => {
    if (error && animated) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error, animated]);

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      if (animated) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.01,
            useNativeDriver: true,
            ...ANIMATION.spring.snappy,
          }),
          Animated.timing(labelPositionAnim, {
            toValue: 1,
            duration: ANIMATION.duration.fast,
            useNativeDriver: true,
          }),
        ]).start();
      }
      onFocus?.(e);
    },
    [onFocus, animated]
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      if (animated) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...ANIMATION.spring.smooth,
        }).start();
        if (!hasValue) {
          Animated.timing(labelPositionAnim, {
            toValue: 0,
            duration: ANIMATION.duration.fast,
            useNativeDriver: true,
          }).start();
        }
      }
      onBlur?.(e);
    },
    [onBlur, hasValue, animated]
  );

  // Interpolated values
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? COLORS.error : COLORS.borderLight, error ? COLORS.error : COLORS.primary],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      variant === 'filled' ? COLORS.backgroundTertiary : COLORS.white,
      variant === 'filled' ? COLORS.primaryLighter : COLORS.white,
    ],
  });

  const labelTranslateY = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -8],
  });

  const labelScale = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        animated && {
          transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      {/* Floating Label */}
      {label && (
        <Animated.View
          style={[
            styles.labelContainer,
            {
              transform: [{ translateY: labelTranslateY }, { scale: labelScale }],
              backgroundColor: hasValue || isFocused ? COLORS.white : 'transparent',
            },
          ]}
          pointerEvents="none"
        >
          <Animated.Text
            style={[
              styles.label,
              {
                color: focusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    error ? COLORS.error : COLORS.textSecondary,
                    error ? COLORS.error : COLORS.primary,
                  ],
                }),
              },
            ]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        </Animated.View>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          variant === 'filled' && styles.inputContainerFilled,
          {
            borderColor,
            backgroundColor,
          },
          isFocused && !error && {
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          },
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        {/* Glow effect */}
        {isFocused && !error && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: shadowOpacity,
              },
            ]}
          />
        )}

        {/* Left Icon */}
        {inputIcon && (
          <Animated.View
            style={[
              styles.leftIcon,
              {
                transform: [{ scale: iconScaleAnim }],
              },
            ]}
          >
            <Ionicons
              name={inputIcon}
              size={20}
              color={isFocused ? COLORS.primary : error ? COLORS.error : COLORS.textTertiary}
            />
          </Animated.View>
        )}

        {/* TextInput */}
        <TextInput
          style={[
            styles.input,
            inputIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            disabled && styles.inputDisabled,
          ]}
          placeholderTextColor={COLORS.textTertiary}
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          {...props}
          onChangeText={(text) => {
            setHasValue(!!text);
            props.onChangeText?.(text);
          }}
        />

        {/* Password Toggle */}
        {isPassword && (
          <Pressable
            style={styles.rightIconButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: focusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '10deg'],
                    }),
                  },
                ],
              }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={isFocused ? COLORS.primary : COLORS.textTertiary}
              />
            </Animated.View>
          </Pressable>
        )}

        {/* Right Icon */}
        {rightIcon && !isPassword && (
          <Pressable
            style={styles.rightIconButton}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View style={{ transform: [{ scale: iconScaleAnim }] }}>
              <Ionicons
                name={rightIcon}
                size={20}
                color={isFocused ? COLORS.primary : COLORS.textTertiary}
              />
            </Animated.View>
          </Pressable>
        )}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <Animated.View
          style={[
            styles.errorContainer,
            animated && {
              opacity: focusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.errorLight, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.errorGradient}
          />
          <Ionicons name="alert-circle" size={14} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      {/* Hint Text */}
      {hint && !error && (
        <Text style={styles.hintText}>{hint}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.base,
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: SPACING.base,
    top: 0,
    zIndex: 10,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    minHeight: 56,
    paddingHorizontal: SPACING.base,
    position: 'relative',
    overflow: 'hidden',
  },
  inputContainerFilled: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: 'transparent',
  },
  inputContainerError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  inputContainerDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.border,
  },
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  inputWithLeftIcon: {
    marginLeft: SPACING.sm,
  },
  inputWithRightIcon: {
    marginRight: SPACING.sm,
  },
  inputDisabled: {
    color: COLORS.disabledText,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIconButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  errorGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error,
    marginLeft: SPACING.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  hintText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
});

export default Input;
