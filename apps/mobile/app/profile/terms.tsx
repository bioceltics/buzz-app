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

interface TermsSection {
  title: string;
  content: string;
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing or using the Buzzee mobile application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App. We reserve the right to modify these Terms at any time, and your continued use of the App constitutes acceptance of any changes.',
  },
  {
    title: '2. Description of Service',
    content: 'Buzzee is a mobile platform that connects users with local venues offering deals, discounts, and promotions. The App allows users to discover nearby venues, browse available deals, redeem offers, leave reviews, and communicate with venue operators. Buzzee acts as an intermediary and is not responsible for the goods or services provided by venues.',
  },
  {
    title: '3. User Accounts',
    content: 'To access certain features of the App, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
  },
  {
    title: '4. User Conduct',
    content: 'You agree not to: (a) use the App for any unlawful purpose; (b) impersonate any person or entity; (c) submit false or misleading information; (d) interfere with or disrupt the App or servers; (e) attempt to gain unauthorized access to any portion of the App; (f) use automated means to access the App without permission; (g) harass, abuse, or harm other users or venue operators.',
  },
  {
    title: '5. User Content',
    content: 'You may submit reviews, ratings, photos, and other content ("User Content") through the App. You retain ownership of your User Content, but grant Buzzee a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content. You represent that your User Content does not violate any third-party rights and is not defamatory, obscene, or otherwise objectionable.',
  },
  {
    title: '6. Deal Redemption',
    content: 'Deals displayed on the App are subject to availability and may be modified or withdrawn at any time by the participating venues. Buzzee does not guarantee the accuracy of deal information or the availability of any offer. Redemption of deals is subject to the terms and conditions set by each venue. Some deals may have restrictions on usage, including expiration dates, minimum purchases, or exclusions.',
  },
  {
    title: '7. Payments and Subscriptions',
    content: 'Certain features of the App may require payment, including Buzzee Premium subscriptions. All payments are processed through third-party payment providers. Subscription fees are billed in advance on a recurring basis. You may cancel your subscription at any time, but refunds are not provided for partial billing periods. Prices are subject to change with reasonable notice.',
  },
  {
    title: '8. Intellectual Property',
    content: 'The App and its original content, features, and functionality are owned by Buzzee and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the App without our express written permission.',
  },
  {
    title: '9. Third-Party Links and Services',
    content: 'The App may contain links to third-party websites or services that are not owned or controlled by Buzzee. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services. You acknowledge and agree that Buzzee shall not be liable for any damage or loss caused by your use of such third-party services.',
  },
  {
    title: '10. Disclaimer of Warranties',
    content: 'THE APP IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. BUZZEE DOES NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE DO NOT GUARANTEE THE ACCURACY OR COMPLETENESS OF ANY INFORMATION PROVIDED THROUGH THE APP.',
  },
  {
    title: '11. Limitation of Liability',
    content: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUZZEE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE APP. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO BUZZEE IN THE TWELVE MONTHS PRECEDING THE CLAIM.',
  },
  {
    title: '12. Indemnification',
    content: 'You agree to indemnify, defend, and hold harmless Buzzee and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising out of your use of the App, your violation of these Terms, or your violation of any rights of a third party.',
  },
  {
    title: '13. Termination',
    content: 'We may terminate or suspend your account and access to the App immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the App will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.',
  },
  {
    title: '14. Governing Law',
    content: 'These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario, Canada, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts located in Ontario, Canada.',
  },
  {
    title: '15. Contact Information',
    content: 'If you have any questions about these Terms, please contact us at:\n\nBuzzee Inc.\nEmail: legal@buzzee.ca\nAddress: Toronto, Ontario, Canada',
  },
];

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
            Welcome to Buzzee! These Terms of Service govern your use of our mobile application and services. Please read them carefully before using the App.
          </Text>
        </View>

        {/* Terms Sections */}
        {TERMS_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Terms Version 1.0</Text>
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
