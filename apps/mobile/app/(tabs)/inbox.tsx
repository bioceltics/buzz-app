import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { formatRelativeTime } from '@/utils/date';
import { Button } from '@/components/ui';
import { BuzzeeIcon } from '@/components/ui/BuzzeeIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

export default function InboxScreen() {
  const { user } = useAuth();
  const { conversations, isLoading } = useConversations();

  const totalUnread = conversations?.reduce((sum: number, conv: any) => sum + (conv.user_unread_count || 0), 0) || 0;

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[COLORS.primary, '#D81B60']}
              style={styles.logoContainer}
            >
              <BuzzeeIcon size={18} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.logoText}>Buzzee</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <LinearGradient
            colors={['#3B82F6', '#60A5FA']}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="chatbubbles" size={40} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Sign in to view messages</Text>
          <Text style={styles.emptySubtext}>
            Chat with venues about deals, reservations, and special requests
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            size="lg"
            style={styles.actionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderConversation = ({ item }: { item: any }) => {
    const hasUnread = item.user_unread_count > 0;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.venue.logo_url || 'https://via.placeholder.com/50' }}
            style={styles.venueImage}
          />
          {item.venue.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={8} color={COLORS.white} />
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text
              style={[styles.venueName, hasUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {item.venue.name}
            </Text>
            <Text style={[styles.timestamp, hasUnread && styles.timestampUnread]}>
              {formatRelativeTime(item.last_message_at)}
            </Text>
          </View>
          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadMessage]}
              numberOfLines={1}
            >
              {item.last_message || 'No messages yet'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.user_unread_count > 99 ? '99+' : item.user_unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[COLORS.primary, '#D81B60']}
              style={styles.logoContainer}
            >
              <BuzzeeIcon size={18} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.logoText}>Buzzee</Text>
          </View>
          {totalUnread > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {totalUnread > 99 ? '99+' : totalUnread}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>Inbox</Text>
        {conversations && conversations.length > 0 && (
          <Text style={styles.subtitle}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#3B82F6', '#60A5FA']}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="chatbubbles-outline" size={40} color={COLORS.white} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation with a venue to ask about deals or make reservations
            </Text>
            <Button
              title="Explore Venues"
              onPress={() => router.push('/venues')}
              size="lg"
              style={styles.actionButton}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    position: 'relative',
  },
  venueImage: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.backgroundTertiary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.info,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  conversationContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  venueName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
  timestampUnread: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  unreadText: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  unreadMessage: {
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  unreadCount: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: SPACING.base + 56 + SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...SHADOWS.lg,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    minWidth: 200,
  },
});
