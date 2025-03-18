import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageService } from '../services/chat/MessageService';

export function useMessages(chatId) {
  const [state, setState] = useState({
    messages: [],
    loading: true,
    error: null,
    hasMore: true
  });

  const [searchState, setSearchState] = useState({
    results: [],
    currentIndex: -1,
    isSearching: false,
    query: ''
  });

  const [typingUsers, setTypingUsers] = useState([]);
  const isMounted = useRef(true);
  const subscriptions = useRef([]);
  const messageService = useRef(new MessageService());

  useEffect(() => {
    return () => {
      isMounted.current = false;
      subscriptions.current.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
      subscriptions.current = [];
    };
  }, []);

  useEffect(() => {
    setSearchState({
      results: [],
      currentIndex: -1,
      isSearching: false,
      query: ''
    });
  }, [chatId]);

  const deleteMessage = useCallback(async (messageId) => {
    if (!chatId) return false;

    try {
      await messageService.current.deleteMessage(chatId, messageId);
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error }));
      return false;
    }
  }, [chatId]);

  const editMessage = useCallback(async (messageId, newText) => {
    if (!chatId) return false;

    try {
      await messageService.current.editMessage(chatId, messageId, newText);
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error }));
      return false;
    }
  }, [chatId]);

  return {
    ...state,
    ...searchState,
    typingUsers,
    deleteMessage,
    editMessage,
  };
}

