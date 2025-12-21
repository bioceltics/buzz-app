import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/colors';

interface Conversation {
  id: string;
  customer_name: string;
  customer_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
}

interface Message {
  id: string;
  sender: 'venue' | 'customer';
  content: string;
  timestamp: string;
  read: boolean;
}

export default function ChatScreen() {
  const { venue } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock conversations for demo
  const mockConversations: Conversation[] = [
    {
      id: '1',
      customer_name: 'Sarah Johnson',
      last_message: 'Is the happy hour deal still available?',
      last_message_time: '2 min ago',
      unread_count: 2,
      is_online: true,
    },
    {
      id: '2',
      customer_name: 'Mike Chen',
      last_message: 'Thanks for the great service!',
      last_message_time: '1 hr ago',
      unread_count: 0,
      is_online: false,
    },
    {
      id: '3',
      customer_name: 'Emily Davis',
      last_message: 'Can I make a reservation for tonight?',
      last_message_time: '3 hrs ago',
      unread_count: 1,
      is_online: true,
    },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      sender: 'customer',
      content: 'Hi! I saw your 2-for-1 cocktail deal on Buzzee.',
      timestamp: '2:30 PM',
      read: true,
    },
    {
      id: '2',
      sender: 'venue',
      content: 'Hello! Yes, our happy hour deal is running from 4-7 PM today. Would you like to reserve a table?',
      timestamp: '2:32 PM',
      read: true,
    },
    {
      id: '3',
      sender: 'customer',
      content: 'That sounds great! Is the happy hour deal still available?',
      timestamp: '2:35 PM',
      read: false,
    },
  ];

  const { data: conversations = mockConversations, refetch } = useQuery({
    queryKey: ['venue-conversations', venue?.id],
    queryFn: async () => {
      // TODO: Implement actual conversation fetching
      return mockConversations;
    },
    enabled: !!venue,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // TODO: Implement actual message sending
    setMessageText('');
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  // Conversation List View
  if (!selectedConversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {totalUnread > 0 ? `${totalUnread} unread messages` : 'All caught up!'}
            </Text>
          </View>
          {totalUnread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.conversationList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptyText}>
                When customers message you about your deals, they'll appear here
              </Text>
            </View>
          ) : (
            conversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={styles.conversationItem}
                onPress={() => setSelectedConversation(conversation)}
              >
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {conversation.customer_name.charAt(0)}
                    </Text>
                  </View>
                  {conversation.is_online && <View style={styles.onlineIndicator} />}
                </View>
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.customerName}>{conversation.customer_name}</Text>
                    <Text style={styles.messageTime}>{conversation.last_message_time}</Text>
                  </View>
                  <View style={styles.messagePreview}>
                    <Text
                      style={[
                        styles.lastMessage,
                        conversation.unread_count > 0 && styles.lastMessageUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {conversation.last_message}
                    </Text>
                    {conversation.unread_count > 0 && (
                      <View style={styles.unreadCount}>
                        <Text style={styles.unreadCountText}>{conversation.unread_count}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Chat View
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedConversation(null)}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>
              {selectedConversation.customer_name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.chatHeaderName}>{selectedConversation.customer_name}</Text>
            <Text style={styles.chatHeaderStatus}>
              {selectedConversation.is_online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {mockMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'venue' ? styles.venueBubble : styles.customerBubble,
              ]}
            >
              {message.sender === 'venue' ? (
                <LinearGradient
                  colors={[COLORS.primary, '#E91E63']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.venueMessageGradient}
                >
                  <Text style={styles.venueMessageText}>{message.content}</Text>
                  <Text style={styles.venueMessageTime}>{message.timestamp}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.customerMessage}>
                  <Text style={styles.customerMessageText}>{message.content}</Text>
                  <Text style={styles.customerMessageTime}>{message.timestamp}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textTertiary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={messageText.trim() ? '#FFF' : COLORS.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  conversationList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  lastMessageUnread: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  unreadCount: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    minWidth: 22,
    alignItems: 'center',
  },
  unreadCountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  bottomPadding: {
    height: 100,
  },
  // Chat View Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatAvatarText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  chatHeaderName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  chatHeaderStatus: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  messageBubble: {
    marginBottom: SPACING.sm,
    maxWidth: '80%',
  },
  venueBubble: {
    alignSelf: 'flex-end',
  },
  customerBubble: {
    alignSelf: 'flex-start',
  },
  venueMessageGradient: {
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderBottomRightRadius: 4,
  },
  venueMessageText: {
    color: '#FFF',
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 22,
  },
  venueMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  customerMessage: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    borderBottomLeftRadius: 4,
    ...SHADOWS.sm,
  },
  customerMessageText: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 22,
  },
  customerMessageTime: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.backgroundSecondary,
  },
});
