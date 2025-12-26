import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SHADOWS } from '@/constants/colors';

interface PolicySection {
  title: string;
  content: string;
}

const POLICY_SECTIONS: PolicySection[] = [
  {
    title: '1. Information We Collect',
    content: 'We collect information you provide directly, including: account information (name, email, phone number), profile information (photo, preferences), user content (reviews, ratings, photos), transaction data (deal redemptions, purchases), and communications with venues or support.\n\nWe also automatically collect: device information (model, operating system, unique identifiers), usage data (features used, interactions, timestamps), location data (with your permission), and log data (IP address, browser type, referring pages).',
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use your information to: provide and improve our services, personalize your experience and show relevant deals, process transactions and send related information, send promotional communications (with your consent), respond to your comments and questions, monitor and analyze usage trends, detect and prevent fraud or abuse, and comply with legal obligations.',
  },
  {
    title: '3. Information Sharing',
    content: 'We may share your information with: venues (when you redeem deals or send messages), service providers (payment processors, analytics, cloud hosting), business partners (for joint promotions, with your consent), and legal authorities (when required by law or to protect rights).\n\nWe do not sell your personal information to third parties for their marketing purposes.',
  },
  {
    title: '4. Location Data',
    content: 'With your permission, we collect and use your location to: show nearby venues and deals, provide distance information, enable location-based notifications, and improve our services.\n\nYou can control location permissions through your device settings or within the app under Profile > Location Settings. We only access your location when the app is in use, unless you enable background location for nearby deal alerts.',
  },
  {
    title: '5. Data Security',
    content: 'We implement appropriate technical and organizational measures to protect your personal information, including: encryption of data in transit and at rest, secure authentication mechanisms, regular security assessments, access controls and employee training, and incident response procedures.\n\nHowever, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your data.',
  },
  {
    title: '6. Data Retention',
    content: 'We retain your personal information for as long as your account is active or as needed to provide services. We may retain certain information for longer periods for: legal compliance, dispute resolution, fraud prevention, and analytics (in aggregated, anonymized form).\n\nYou can request deletion of your account and associated data through Profile > Privacy > Delete Account.',
  },
  {
    title: '7. Your Rights',
    content: 'Depending on your location, you may have rights to: access your personal information, correct inaccurate data, delete your data, port your data to another service, opt out of marketing communications, restrict or object to processing, and withdraw consent.\n\nTo exercise these rights, contact us at privacy@buzzee.ca or use the settings in the app. We will respond to requests within 30 days.',
  },
  {
    title: '8. Children\'s Privacy',
    content: 'Buzzee is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected information from a child under 13, we will delete that information promptly. If you believe we have collected information from a child under 13, please contact us.',
  },
  {
    title: '9. Third-Party Services',
    content: 'Our app may contain links to third-party websites and services, including venue websites, payment processors, and social media platforms. This Privacy Policy does not apply to those third-party services. We encourage you to review the privacy policies of any third-party services you access through our app.',
  },
  {
    title: '10. Cookies and Tracking',
    content: 'We use cookies and similar technologies to: remember your preferences, understand how you use our services, personalize content and ads, and analyze traffic and trends.\n\nYou can control cookies through your browser settings. Note that disabling cookies may affect the functionality of certain features.',
  },
  {
    title: '11. International Data Transfers',
    content: 'Your information may be transferred to and processed in countries other than your country of residence, including Canada and the United States. These countries may have different data protection laws. We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses.',
  },
  {
    title: '12. Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. We will notify you of material changes by: posting the new policy in the app, updating the "Last Updated" date, and sending you a notification (for significant changes).\n\nYour continued use of the app after changes constitutes acceptance of the updated policy.',
  },
  {
    title: '13. Contact Us',
    content: 'If you have questions or concerns about this Privacy Policy or our data practices, please contact us:\n\nBuzzee Inc.\nPrivacy Team\nEmail: privacy@buzzee.ca\nAddress: Toronto, Ontario, Canada\n\nFor data protection inquiries in the EU, you may also contact our Data Protection Officer at dpo@buzzee.ca.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Last Updated */}
        <View style={styles.lastUpdatedContainer}>
          <Ionicons name="time-outline" size={16} color={COLORS.textTertiary} />
          <Text style={styles.lastUpdatedText}>Last updated: December 26, 2025</Text>
        </View>

        {/* Introduction */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            At Buzzee, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. Please read this policy carefully to understand our practices regarding your personal data.
          </Text>
        </View>

        {/* Policy Sections */}
        {POLICY_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Privacy Policy Version 1.0</Text>
          <Text style={styles.versionSubtext}>Effective Date: December 26, 2025</Text>
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
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...SHADOWS.sm,
  },
  introText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 16,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  versionSubtext: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
