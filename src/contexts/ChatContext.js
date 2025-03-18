import React, { createContext, useState, useContext, useCallback } from 'react';
import firebase from '@react-native-firebase/firestore';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);

  const updateContacts = useCallback((newContacts) => {
    setContacts(newContacts);
  }, []);

  const updateMessages = useCallback((chatId, newMessages) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: newMessages,
    }));
  }, []);

  const value = {
    contacts,
    messages,
    activeChat,
    updateContacts,
    updateMessages,
    setActiveChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}