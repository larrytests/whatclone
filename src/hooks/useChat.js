import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatService } from '../services/chat/ChatService';
import { useAuth } from './useAuth';

const chatService = new ChatService();

export function useChat(contactId) {
  const { currentUser } = useAuth();
  const [state, setState] = useState({
    messages: [],
    loading: true,
    error: null,
    hasMore: true,
  });

  const [chatId, setChatId] = useState(null);

  const mounted = useRef(true);
  const subscriptions = useRef([]);

  useEffect(() => {
    mounted.current = true;
    
    return () => {
      mounted.current = false;
      subscriptions.current.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
      subscriptions.current = [];
    };
  }, []);

  useEffect(() => {
    if (!currentUser || !contactId) return;

    const initializeChat = async () => {
      try {
        const id = await chatService.createOrGetChat(currentUser._id, contactId);
        setChatId(id);
      } catch (error) {
        setState(prev => ({ ...prev, error, loading: false }));
      }
    };

    initializeChat();
  }, [currentUser, contactId]);

  useEffect(() => {
    if (!chatId) return;

    const messageSubscription = chatService.messageService.subscribeToMessages(
      chatId,
      ({ messages, error }) => {
        if (mounted.current) {
          setState(prev => ({
            ...prev,
            messages,
            loading: false,
            error,
            hasMore: messages.length >= chatService.messageService.messagesPerPage,
          }));
        }
      }
    );

    subscriptions.current.push(messageSubscription);

    return () => {
      messageSubscription();
      subscriptions.current = subscriptions.current.filter(
        sub => sub !== messageSubscription
      );
    };
  }, [chatId]);

  const sendMessage = useCallback(async (text) => {
    if (!chatId || !currentUser) return;

    try {
      const message = {
        text,
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
      };

      await chatService.messageService.sendMessage(chatId, message, currentUser);
      await chatService.updateLastMessage(chatId, message);
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error }));
      return false;
    }
  }, [chatId, currentUser]);

  const loadMoreMessages = useCallback(async () => {
    if (!chatId || !state.hasMore || state.loading) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const lastMessage = state.messages[state.messages.length - 1];
      const olderMessages = await chatService.messageService.loadMoreMessages(
        chatId,
        lastMessage.createdAt
      );

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, ...olderMessages],
        loading: false,
        hasMore: olderMessages.length >= chatService.messageService.messagesPerPage,
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error, loading: false }));
    }
  }, [chatId, state.messages, state.hasMore, state.loading]);

  return {
    ...state,
    sendMessage,
    loadMoreMessages,
  };
}
