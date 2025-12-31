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
import Constants from 'expo-constants';
import { COLORS, SHADOWS } from '@/constants/colors';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: [string, string];
  action: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface QuickLink {
  id: string;
  title: string;
  icon: string;
  url: string;
}

const CONTACT_OPTIONS: ContactOption[] = [
  {
    id: 'email',
    title: 'Email Support',
    description: 'support@buzzee.app',
    icon: 'mail',
    gradient: ['#3B82F6', '#60A5FA'],
    action: () => Linking.openURL('mailto:support@buzzee.app'),
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: '+1 (555) 123-4567',
    icon: 'call',
    gradient: ['#10B981', '#34D399'],
    action: () => Linking.openURL('tel:+15551234567'),
  },
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Available 9am - 5pm EST',
    icon: 'chatbubbles',
    gradient: [COLORS.primary, '#D81B60'],
    action: () => {
      // Placeholder for live chat integration
    },
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create a new deal?',
    answer: 'Navigate to the Deals tab, tap the "+" button, and follow the guided process to set up your discount type, terms, and duration.',
  },
  {
    id: '2',
    question: 'How do I scan customer QR codes?',
    answer: "Go to the Scan tab and point your camera at the customer's QR code. The app will automatically verify and process the redemption.",
  },
  {
    id: '3',
    question: 'How can I view my analytics?',
    answer: 'Go to the Deals tab and switch to the Insights view to see detailed analytics about your deal performance, customer traffic, and redemption rates.',
  },
  {
    id: '4',
    question: 'How do I update my venue information?',
    answer: 'Go to Settings > Edit Profile to update your venue name, address, contact details, and business hours.',
  },
  {
    id: '5',
    question: 'How do I upgrade my subscription?',
    answer: 'Visit Settings > Billing to view available plans and upgrade your subscription for more features.',
  },
];

const QUICK_LINKS: QuickLink[] = [
  {
    id: 'docs',
    title: 'Documentation',
    icon: 'book',
    url: 'https://docs.buzzee.app',
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    icon: 'document-text',
    url: 'https://buzzee.app/terms',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: 'shield-checkmark',
    url: 'https://buzzee.app/privacy',
  },
];

export default function SupportScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appName = Constants.expoConfig?.name || 'Buzzee for Business';

  const toggleFAQ = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

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
            colors={['#EDE9FE', '#DDD6FE']}
            style={styles.infoIconBg}
          >
            <Ionicons name="help-buoy" size={20} color="#6366F1" />
          </LinearGradient>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>We're Here to Help</Text>
            <Text style={styles.infoText}>
              Get in touch with our support team or find answers in our FAQ
            </Text>
          </View>
        </View>

        {/* Contact Options Section */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.card}>
          {CONTACT_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.contactRow,
                index === CONTACT_OPTIONS.length - 1 && styles.lastRow,
              ]}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <LinearGradient colors={option.gradient} style={styles.contactIcon}>
                <Ionicons name={option.icon as any} size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.card}>
          {FAQ_ITEMS.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.faqItem,
                index === FAQ_ITEMS.length - 1 && styles.lastRow,
              ]}
            >
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFAQ(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqQuestionContainer}>
                  <View style={styles.faqIconBg}>
                    <Ionicons name="help-circle" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                </View>
                <Ionicons
                  name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
              {expandedFAQ === item.id && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Quick Links Section */}
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <View style={styles.card}>
          {QUICK_LINKS.map((link, index) => (
            <TouchableOpacity
              key={link.id}
              style={[
                styles.linkRow,
                index === QUICK_LINKS.length - 1 && styles.lastRow,
              ]}
              onPress={() => openLink(link.url)}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconBg}>
                <Ionicons name={link.icon as any} size={18} color="#6366F1" />
              </View>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Ionicons name="open-outline" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version Section */}
        <View style={styles.versionContainer}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e']}
            style={styles.versionCard}
          >
            <View style={styles.versionIconBg}>
              <Ionicons name="information-circle" size={20} color="#FFF" />
            </View>
            <View style={styles.versionContent}>
              <Text style={styles.versionAppName}>{appName}</Text>
              <Text style={styles.versionText}>Version {appVersion}</Text>
            </View>
          </LinearGradient>
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
    marginBottom: 24,
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
    marginBottom: 24,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastRow: {
    borderBottomWidth: 0,
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
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  faqIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 60,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  linkIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  versionContainer: {
    marginTop: 8,
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
  },
  versionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionContent: {
    marginLeft: 14,
  },
  versionAppName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  versionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  bottomPadding: {
    height: 40,
  },
});
