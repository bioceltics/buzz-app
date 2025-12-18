import { useCallback, useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, Animated, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION, GRADIENTS } from '@/constants/colors';

// Custom animated tab bar button
function AnimatedTabBarButton({
  children,
  onPress,
  accessibilityState,
  ...props
}: any) {
  const focused = accessibilityState?.selected;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      ...ANIMATION.spring.bouncy,
    }).start();
  }, [focused]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
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

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  return (
    <Pressable
      {...props}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabButtonInner,
          {
            transform: [{ scale: scaleAnim }, { translateY }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Premium animated tab icon
function AnimatedTabIcon({
  name,
  label,
  color,
  focused,
}: {
  name: string;
  label: string;
  color: string;
  focused: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const badgePulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      // Scale up animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          ...ANIMATION.spring.snappy,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          ...ANIMATION.spring.bouncy,
        }),
      ]).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.smooth,
      }).start();
    }
  }, [focused]);

  // Special pulse for inbox badge
  useEffect(() => {
    if (name === 'chatbubbles') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(badgePulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [name]);

  return (
    <View style={styles.tabIconWrapper}>
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {focused ? (
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainerActive}
          >
            <Ionicons
              name={name as any}
              size={22}
              color={COLORS.white}
            />
          </LinearGradient>
        ) : (
          <View style={styles.iconContainerInactive}>
            <Ionicons
              name={`${name}-outline` as any}
              size={22}
              color={color}
            />
          </View>
        )}
      </Animated.View>

      {/* Label */}
      <Text
        style={[
          styles.tabLabel,
          focused && styles.tabLabelActive,
          { color: focused ? COLORS.primary : COLORS.textTertiary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Badge for inbox */}
      {name === 'chatbubbles' && (
        <Animated.View
          style={[
            styles.badge,
            { transform: [{ scale: badgePulseAnim }] },
          ]}
        >
          <Text style={styles.badgeText}>2</Text>
        </Animated.View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="compass" label="Discover" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="map" label="Map" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="heart" label="Favorites" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="chatbubbles" label="Inbox" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="person" label="Profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    height: 72,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS['2xl'],
    borderTopWidth: 0,
    paddingHorizontal: 8,
    ...SHADOWS.xl,
    elevation: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 36,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconContainerActive: {
    width: 48,
    height: 36,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.primary,
  },
  iconContainerInactive: {
    width: 48,
    height: 36,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes['2xs'],
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOWS.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
});
