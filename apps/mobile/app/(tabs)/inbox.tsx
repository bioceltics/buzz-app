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
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { formatRelativeTime } from '@/utils/date';
import { Button } from '@/components/ui';
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
          <Text style={styles.title}>Inbox</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="chatbubbles" size={40} color={COLORS.info} />
          </View>
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Inbox</Text>
          {totalUnread > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {totalUnread > 99 ? '99+' : totalUnread}
              </Text>
            </View>
          )}
        </View>
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
            <View style={[styles.emptyIconContainer, { backgroundColor: COLORS.infoLight }]}>
              <Ionicons name="chatbubbles-outline" size={40} color={COLORS.info} />
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation with a venue to ask about deals or make reservations
            </Text>
            <Button
              title="Explore Venues"
              onPress={() => router.push('/(tabs)')}
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
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.heavy,
    color: COLORS.text,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  headerBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
  headerBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING['4xl'],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.relaxed,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    minWidth: 200,
  },
});
