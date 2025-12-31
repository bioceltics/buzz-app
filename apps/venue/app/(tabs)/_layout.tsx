import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SHADOWS, RADIUS, SPACING, GRADIENTS, ANIMATION } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import React, { useRef, useEffect, useCallback } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

const isWeb = Platform.OS === 'web';

// Animated Tab Icon with gradient background when active
function AnimatedTabIcon({
  name,
  label,
  focused,
  color,
}: {
  name: string;
  label: string;
  focused: boolean;
  color: string;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      // Bounce animation sequence: 1.0 -> 1.2 -> 1.1
      scale.value = withSequence(
        withSpring(1.2, ANIMATION.spring.snappy),
        withSpring(1.1, ANIMATION.spring.bouncy)
      );
      translateY.value = withSpring(-4, ANIMATION.spring.bouncy);
    } else {
      scale.value = withSpring(1, ANIMATION.spring.smooth);
      translateY.value = withSpring(0, ANIMATION.spring.smooth);
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const outlineIconName = `${name}-outline` as keyof typeof Ionicons.glyphMap;
  const filledIconName = name as keyof typeof Ionicons.glyphMap;

  return (
    <View style={styles.tabIconWrapper}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        {focused ? (
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainerActive}
          >
            <Ionicons name={filledIconName} size={22} color={COLORS.white} />
          </LinearGradient>
        ) : (
          <View style={styles.iconContainerInactive}>
            <Ionicons name={outlineIconName} size={22} color={color} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// Animated Tab Bar Button with press feedback
function AnimatedTabBarButton({
  children,
  onPress,
  accessibilityState,
  ...props
}: any) {
  const focused = accessibilityState?.selected;
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.85, ANIMATION.spring.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIMATION.spring.bouncy);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      {...props}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabButtonInner, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarItemStyle: styles.tabBarItem,
        tabBarButton: AnimatedTabBarButton,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              name="home"
              label="Home"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: 'Deals',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              name="pricetag"
              label="Deals"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={styles.scannerButtonWrapper}>
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scannerButton}
              >
                <View style={styles.scannerInner}>
                  <Ionicons name="qr-code" size={26} color={COLORS.white} />
                </View>
              </LinearGradient>
              {/* Glow effect */}
              <View style={styles.scannerGlow} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              name="calendar"
              label="Events"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              name="settings"
              label="Settings"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      {/* Hidden tabs - accessible from navigation */}
      <Tabs.Screen
        name="insights"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
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
    backgroundColor: isWeb ? 'rgba(255, 255, 255, 0.98)' : COLORS.white,
    borderRadius: RADIUS['2xl'],
    borderTopWidth: 0,
    paddingBottom: 0,
    paddingHorizontal: 8,
    ...SHADOWS.xl,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
  },
  tabBarIcon: {
    marginTop: Platform.OS === 'ios' ? 4 : 0,
  },
  tabBarItem: {
    paddingTop: Platform.OS === 'ios' ? 6 : 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerButtonWrapper: {
    position: 'relative',
    marginBottom: Platform.OS === 'ios' ? 28 : 30,
  },
  scannerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  scannerInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scannerGlow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
    transform: [{ scale: 1.2 }],
    zIndex: -1,
  },
});
