import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

export default function SignUpScreen() {
  const { signUp, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      await signUp(email, password, fullName);
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: COLORS.border };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const config = [
      { label: 'Weak', color: COLORS.error },
      { label: 'Fair', color: COLORS.warning },
      { label: 'Good', color: COLORS.info },
      { label: 'Strong', color: COLORS.success },
    ];

    return {
      strength,
      label: config[strength - 1]?.label || '',
      color: config[strength - 1]?.color || COLORS.border,
    };
  };

  const passwordStrength = getPasswordStrength();

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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            </View>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="person-add" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Buzzer to discover amazing deals near you
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              leftIcon="person-outline"
              error={errors.fullName}
            />

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

            <View>
              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
                error={errors.password}
              />
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              level <= passwordStrength.strength
                                ? passwordStrength.color
                                : COLORS.borderLight,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: passwordStrength.color },
                    ]}
                  >
                    {passwordStrength.label}
                  </Text>
                </View>
              )}
            </View>

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.confirmPassword}
              rightIcon={
                confirmPassword.length > 0 && password === confirmPassword
                  ? 'checkmark-circle'
                  : undefined
              }
            />

            {/* Sign Up Button */}
            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              size="lg"
              style={styles.signUpButton}
            />
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInLink}>Sign In</Text>
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
  backButton: {
    marginBottom: SPACING.md,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING['2xl'],
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.relaxed,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  strengthBar: {
    width: 48,
    height: 4,
    borderRadius: RADIUS.xs,
  },
  strengthLabel: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  signUpButton: {
    marginTop: SPACING.sm,
  },
  terms: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.relaxed,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  signInText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  signInLink: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
