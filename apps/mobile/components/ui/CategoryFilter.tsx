import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ViewStyle,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION, GRADIENTS } from '../../constants/colors';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  style?: ViewStyle;
  variant?: 'default' | 'pill' | 'minimal';
  animated?: boolean;
}

interface AnimatedCategoryButtonProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
  index: number;
  variant: 'default' | 'pill' | 'minimal';
  animated: boolean;
}

function AnimatedCategoryButton({
  category,
  isSelected,
  onPress,
  index,
  variant,
  animated,
}: AnimatedCategoryButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Mount animation with stagger
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(translateYAnim, {
          toValue: 0,
          delay: index * 50,
          useNativeDriver: true,
          ...ANIMATION.spring.smooth,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION.duration.normal,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, index]);

  // Selection bounce animation
  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.spring(bounceAnim, {
          toValue: -4,
          useNativeDriver: true,
          ...ANIMATION.spring.snappy,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          useNativeDriver: true,
          ...ANIMATION.spring.bouncy,
        }),
      ]).start();
    }
  }, [isSelected]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
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

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { translateY: Animated.add(translateYAnim, bounceAnim) },
    ],
    opacity: opacityAnim,
  };

  // Pill variant - compact with gradient
  if (variant === 'pill') {
    return (
      <Animated.View style={[styles.pillWrapper, animatedStyle]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
        >
          {isSelected ? (
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pillButtonSelected}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={COLORS.white}
              />
              <Text style={styles.pillLabelSelected}>{category.label}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.pillButton}>
              <Ionicons
                name={category.icon as any}
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.pillLabel}>{category.label}</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // Minimal variant - text only with underline indicator
  if (variant === 'minimal') {
    return (
      <Animated.View style={[styles.minimalWrapper, animatedStyle]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          style={styles.minimalButton}
        >
          <Text
            style={[
              styles.minimalLabel,
              isSelected && styles.minimalLabelSelected,
            ]}
          >
            {category.label}
          </Text>
          {isSelected && (
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.minimalIndicator}
            />
          )}
        </Pressable>
      </Animated.View>
    );
  }

  // Default variant - premium card style
  return (
    <Animated.View style={[styles.categoryWrapper, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {isSelected ? (
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.categoryButton, styles.categoryButtonSelected]}
          >
            <View style={styles.iconContainerSelected}>
              <Ionicons
                name={category.icon as any}
                size={18}
                color={COLORS.white}
              />
            </View>
            <Text style={styles.categoryLabelSelected}>{category.label}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.categoryButton}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={category.icon as any}
                size={18}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.categoryLabel}>{category.label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  style,
  variant = 'default',
  animated = true,
}: CategoryFilterProps) {
  const handleSelect = useCallback(
    (categoryId: string) => {
      LayoutAnimation.configureNext({
        duration: ANIMATION.duration.fast,
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.7,
        },
      });
      onSelectCategory(categoryId);
    },
    [onSelectCategory]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
      decelerationRate="fast"
    >
      {categories.map((category, index) => {
        const isSelected = selectedCategory === category.id;
        return (
          <AnimatedCategoryButton
            key={category.id}
            category={category}
            isSelected={isSelected}
            onPress={() => handleSelect(category.id)}
            index={index}
            variant={variant}
            animated={animated}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },

  // Default variant styles
  categoryWrapper: {
    marginRight: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  categoryButtonSelected: {
    borderWidth: 0,
    ...SHADOWS.button,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  iconContainerSelected: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  categoryLabelSelected: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Pill variant styles
  pillWrapper: {
    marginRight: SPACING.sm,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundTertiary,
    gap: SPACING.xs,
  },
  pillButtonSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
    ...SHADOWS.primary,
  },
  pillLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  pillLabelSelected: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },

  // Minimal variant styles
  minimalWrapper: {
    marginRight: SPACING.lg,
  },
  minimalButton: {
    paddingVertical: SPACING.sm,
    position: 'relative',
  },
  minimalLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textTertiary,
  },
  minimalLabelSelected: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  minimalIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: RADIUS.full,
  },
});
