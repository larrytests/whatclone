import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useMessages } from '../../hooks/useMessages';
import { useTheme } from '../../hooks/useTheme';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ScrollButtons } from '../../components/chat/ScrollButtons';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { useSound } from '../../hooks/useSound';
import { usePushNotification } from '../../hooks/usePushNotification';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { MessageOptionsModal } from '../../components/chat/MessageOptionsModal';
import { PerformanceMonitor } from '../../utils/performance';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { useContacts } from '../../hooks/useContacts';
import { MessageSearch } from '../../components/chat/MessageSearch';
import { useAuth } from '../../hooks/useAuth';
import { NetworkService } from '../../services/api/NetworkService';

const SCROLL_THRESHOLD = 200;
const TYPING_DEBOUNCE_MS = 1000;

export function ChatScreen({ route, navigation }) {
  const { contactId } = route.params;
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    loadMoreMessages,
    markAllAsRead,
    deleteMessage,
    editMessage,
    typingUsers,
    setTypingStatus,
    searchMessages,
  } = useMessages(contactId);
  const { contacts, getContact } = useContacts();
  const { playMessageSound } = useSound();
  const { sendNotification } = usePushNotification();
  
  // Refs
  const chatRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mounted = useRef(true);
  const networkRetrier = useRef(new NetworkService());
  
  // State
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [contact] = useState(() => getContact(contactId));

  useEffect(() => {
    mounted.current = true;
    
    // Set up navigation options
    navigation.setOptions({
      headerShown: false,
    });
    
    // Mark messages as read when screen opens
    markAllAsRead();
    
    return () => {
      mounted.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [navigation, markAllAsRead]);

  const handleTypingStatus = useCallback((isTyping) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setTypingStatus(isTyping);

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false);
      }, TYPING_DEBOUNCE_MS);
    }
  }, [setTypingStatus]);

  const scrollToBottom = useCallback((animated = true) => {
    if (!chatRef.current?.scrollToEnd) return;
    try {
      chatRef.current.scrollToEnd({ animated });
    } catch (error) {
      console.error('Scroll error:', error);
    }
  }, []);

  const handleSend = useCallback(async (newMessages = []) => {
    const [message] = newMessages;
    if (!message?.text?.trim()) return;

    try {
      await networkRetrier.current.executeWithRetry(async () => {
        await PerformanceMonitor.trackOperation('send_message', async () => {
          await sendMessage(message);
          await playMessageSound('send');
        });
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error toast or notification here
    }
  }, [sendMessage, playMessageSound]);

  const handleScroll = useCallback((scrollValue) => {
    setShowScrollButtons(scrollValue > SCROLL_THRESHOLD);
  }, []);

  const handleMessageLongPress = useCallback((message) => {
    setSelectedMessage(message);
    playMessageSound('select');
  }, [playMessageSound]);

  const handleMessageOptions = useCallback(async (option, message) => {
    try {
      switch (option) {
        case 'delete':
          await deleteMessage(message._id);
          playMessageSound('delete');
          break;
        case 'edit':
          await editMessage(message._id, message.text);
          playMessageSound('edit');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to ${option} message:`, error);
      // Show error toast or notification here
    } finally {
      setSelectedMessage(null);
    }
  }, [deleteMessage, editMessage, playMessageSound]);

  const handleSearch = useCallback(async (searchText) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMessages(searchText);
      if (mounted.current) {
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Show error toast or notification here
    } finally {
      setIsSearching(false);
    }
  }, [searchMessages]);

  if (error) {
    return (
      <ErrorBoundary>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Failed to load messages
          </Text>
          <Button 
            title="Retry" 
            onPress={() => loadMoreMessages()} 
            color={theme.colors.primary}
          />
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ChatHeader 
        contact={contact}
        onSearchPress={() => setShowSearch(true)}
        typingUsers={typingUsers}
      />
      
      {showSearch && (
        <MessageSearch
          onSearch={handleSearch}
          results={searchResults}
          isSearching={isSearching}
          onClose={() => {
            setShowSearch(false);
            setSearchResults([]);
          }}
        />
      )}

      <GiftedChat
        ref={chatRef}
        messages={messages}
        onSend={handleSend}
        user={currentUser}
        renderMessage={(props) => (
          <MessageBubble
            {...props}
            onLongPress={handleMessageLongPress}
            theme={theme}
          />
        )}
        onLoadEarlier={loadMoreMessages}
        loadEarlier={hasMore}
        isLoadingEarlier={loading}
        scrollToBottom
        onScroll={handleScroll}
        renderChatFooter={() => (
          <TypingIndicator users={typingUsers} theme={theme} />
        )}
        onInputTextChanged={() => handleTypingStatus(true)}
        renderLoading={() => (
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
            style={styles.loading} 
          />
        )}
      />

      {showScrollButtons && (
        <ScrollButtons
          onScrollToTop={() => chatRef.current?.scrollToTop()}
          onScrollToBottom={() => chatRef.current?.scrollToBottom()}
          theme={theme}
        />
      )}

      <MessageOptionsModal
        visible={!!selectedMessage}
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onSelect={handleMessageOptions}
        isOwnMessage={selectedMessage?.user._id === currentUser._id}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  loading: {
    marginVertical: 20,
  },
});

