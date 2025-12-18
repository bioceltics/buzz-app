import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATION } from '@/constants/colors';

export default function LoginScreen() {
  const { signIn, signInWithGoogle, signInWithApple, signInWithFacebook, isLoading } =
    useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Animations
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const formTranslateYAnim = useRef(new Animated.Value(50)).current;
  const formOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATION.spring.bouncy,
      }),
      Animated.timing(logoOpacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Form animation with delay
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(formTranslateYAnim, {
          toValue: 0,
          useNativeDriver: true,
          ...ANIMATION.spring.smooth,
        }),
        Animated.timing(formOpacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'apple':
          await signInWithApple();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo */}
          <Animated.View
            style={[
              styles.header,
              {
                transform: [{ scale: logoScaleAnim }],
                opacity: logoOpacityAnim,
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logo}>Buzzer</Text>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>
              Sign in to discover exclusive deals near you
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.form,
              {
                transform: [{ translateY: formTranslateYAnim }],
                opacity: formOpacityAnim,
              },
            ]}
          >
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
              style={styles.loginButton}
            />

            {/* Phone Login */}
            <Button
              title="Sign in with Phone"
              variant="outline"
              onPress={() => router.push('/(auth)/verify-phone')}
              leftIcon="phone-portrait-outline"
              size="lg"
            />
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('google')}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('apple')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-apple" size={24} color={COLORS.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('facebook')}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
    marginTop: SPACING.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.primary,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logo: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  form: {
    marginBottom: SPACING.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    marginTop: -SPACING.sm,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  loginButton: {
    marginBottom: SPACING.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  dividerText: {
    marginHorizontal: SPACING.base,
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.base,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
  },
  signUpText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  signUpLink: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
