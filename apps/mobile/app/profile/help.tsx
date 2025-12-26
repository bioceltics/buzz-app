import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '@/constants/colors';
import Constants from 'expo-constants';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: '1',
    question: 'How do I redeem a deal?',
    answer: 'To redeem a deal, tap on any deal card to view details, then tap "Redeem Deal". Show the QR code to the venue staff when making your purchase. The deal will be applied to your order.',
  },
  {
    id: '2',
    question: 'How do I follow a venue?',
    answer: 'Visit any venue page and tap the heart icon to add it to your favorites. You\'ll receive notifications about new deals from venues you follow.',
  },
  {
    id: '3',
    question: 'How do I leave a review?',
    answer: 'After visiting a venue, go to their page and tap "Write a Review". Rate your experience with 1-5 stars and optionally add a comment and photos.',
  },
  {
    id: '4',
    question: 'How do I update my profile?',
    answer: 'Go to Profile > Edit Profile. You can update your name, profile photo, and other details. Tap "Save Changes" when done.',
  },
  {
    id: '5',
    question: 'How do I change my password?',
    answer: 'Go to Profile > Edit Profile and scroll down to find the password section. Enter your current password and your new password, then save.',
  },
  {
    id: '6',
    question: 'What is Buzzee Premium?',
    answer: 'Buzzee Premium gives you access to exclusive deals, early access to new offers, no ads, and priority customer support. Go to Profile > Buzzee Premium to learn more.',
  },
  {
    id: '7',
    question: 'Why am I not seeing deals near me?',
    answer: 'Make sure location services are enabled for Buzzee. Go to Profile > Location Settings to check your permissions. Also ensure you\'re in an area with participating venues.',
  },
  {
    id: '8',
    question: 'How do I contact a venue?',
    answer: 'Visit the venue\'s page and tap the "Message" button to start a conversation. You can also find their phone number and address on their profile.',
  },
];

interface ContactOption {
  icon: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  action: () => void;
}

export default function HelpScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const toggleFAQ = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const contactOptions: ContactOption[] = [
    {
      icon: 'mail',
      title: 'Email Support',
      subtitle: 'support@buzzee.ca',
      gradient: ['#3B82F6', '#60A5FA'],
      action: () => Linking.openURL('mailto:support@buzzee.ca?subject=Buzzee App Support'),
    },
    {
      icon: 'chatbubbles',
      title: 'Live Chat',
      subtitle: 'Available 9am - 6pm EST',
      gradient: ['#10B981', '#34D399'],
      action: () => {
        // In a real app, this would open a chat widget
        Linking.openURL('mailto:support@buzzee.ca?subject=Live Chat Request');
      },
    },
    {
      icon: 'call',
      title: 'Phone Support',
      subtitle: '+1 (888) 555-BUZZ',
      gradient: ['#8B5CF6', '#A78BFA'],
      action: () => Linking.openURL('tel:+18885552899'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#DBEAFE', '#BFDBFE']}
            style={styles.infoIconBg}
          >
            <Ionicons name="help-circle" size={20} color="#3B82F6" />
          </LinearGradient>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Need Help?</Text>
            <Text style={styles.infoText}>
              Browse FAQs or contact our support team
            </Text>
          </View>
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.card}>
          {FAQS.map((faq, index) => (
            <View key={faq.id}>
              <TouchableOpacity
                style={styles.faqRow}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
              {expandedFAQ === faq.id && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
              {index < FAQS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Contact Support Section */}
        <Text style={styles.sectionTitle}>CONTACT SUPPORT</Text>
        <View style={styles.card}>
          {contactOptions.map((option, index) => (
            <View key={option.title}>
              <TouchableOpacity
                style={styles.contactRow}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={option.gradient}
                  style={styles.contactIcon}
                >
                  <Ionicons name={option.icon as any} size={20} color="#FFF" />
                </LinearGradient>
                <View style={styles.contactContent}>
                  <Text style={styles.contactTitle}>{option.title}</Text>
                  <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
              </TouchableOpacity>
              {index < contactOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Resources Section */}
        <Text style={styles.sectionTitle}>RESOURCES</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/profile/terms' as any)}
          >
            <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push('/profile/privacy-policy' as any)}
          >
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.versionRow}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.linkText}>App Version</Text>
            <Text style={styles.versionText}>{appVersion}</Text>
          </View>
        </View>

        {/* Helper Text */}
        <View style={styles.helperCard}>
          <Ionicons name="time-outline" size={18} color={COLORS.textTertiary} />
          <Text style={styles.helperText}>
            Our support team typically responds within 24 hours. For urgent issues, please use phone support.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  infoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 14,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 20,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  versionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    flex: 1,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
