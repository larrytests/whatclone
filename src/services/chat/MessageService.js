import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { concurrencyManager } from './concurrencyManager';

export class MessageService {
  static MESSAGES_PER_PAGE = 20;
  static SEARCH_LIMIT = 100;
  static CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.firestore = firestore;
    this.#messageCache = new Map();
  }

  #messageCache;

  getMessagesRef(chatId) {
    return this.firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages');
  }

  async sendMessage(chatId, message, sender) {
    return concurrencyManager.runExclusive(`send_${chatId}`, async () => {
      const batch = this.firestore().batch();
      const messageRef = this.getMessagesRef(chatId).doc();
      const chatRef = this.firestore().collection('chats').doc(chatId);

      const messageData = {
        ...message,
        _id: messageRef.id,
        sender: sender._id,
        createdAt: this.firestore.FieldValue.serverTimestamp(),
        status: 'sent',
        metadata: {
          device: Platform.OS,
          appVersion: Constants.manifest.version,
          clientTimestamp: Date.now(),
        }
      };

      try {
        batch.set(messageRef, messageData);
        batch.update(chatRef, {
          lastMessage: {
            text: message.text,
            createdAt: this.firestore.FieldValue.serverTimestamp(),
            sender: sender._id
          },
          updatedAt: this.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();
        return messageRef.id;
      } catch (error) {
        console.error('Failed to send message:', error);
        throw new Error('Failed to send message');
      }
    });
  }

  subscribeToMessages(chatId, callback) {
    return this.getMessagesRef(chatId)
      .orderBy('createdAt', 'desc')
      .limit(MessageService.MESSAGES_PER_PAGE)
      .onSnapshot(
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            _id: doc.id,
            ...doc.data(),
          }));
          callback(messages);
        },
        (error) => {
          console.error('Messages subscription error:', error);
          throw new Error('Failed to subscribe to messages');
        }
      );
  }

  async markMessageAsRead(chatId, messageId) {
    return concurrencyManager.runExclusive(`read_${chatId}_${messageId}`, async () => {
      const messageRef = this.getMessagesRef(chatId).doc(messageId);
      
      try {
        await this.firestore.runTransaction(async (transaction) => {
          const doc = await transaction.get(messageRef);
          if (!doc.exists || doc.data().status === 'read') return;
          
          transaction.update(messageRef, {
            status: 'read',
            readAt: this.firestore.FieldValue.serverTimestamp(),
          });
        });
      } catch (error) {
        console.error('Failed to mark message as read:', error);
        throw new Error('Failed to update message status');
      }
    });
  }

  async getMessageById(chatId, messageId) {
    const cacheKey = `${chatId}_${messageId}`;
    
    return concurrencyManager.runExclusive(cacheKey, async () => {
      // Check cache first
      if (this.#messageCache.has(cacheKey)) {
        return this.#messageCache.get(cacheKey);
      }

      try {
        const doc = await this.getMessagesRef(chatId).doc(messageId).get();
        if (!doc.exists) return null;

        const message = { _id: doc.id, ...doc.data() };
        
        // Cache the message
        this.#messageCache.set(cacheKey, message);
        setTimeout(() => this.clearMessageCache(cacheKey), MessageService.CACHE_TIMEOUT);

        return message;
      } catch (error) {
        console.error('Failed to fetch message:', error);
        throw new Error('Failed to fetch message');
      }
    });
  }

  async fetchMessages(chatId, lastMessageId = null, limit = MessageService.MESSAGES_PER_PAGE) {
    let query = this.getMessagesRef(chatId)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (lastMessageId) {
      const lastDoc = await this.getMessagesRef(chatId).doc(lastMessageId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    try {
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  clearMessageCache(key) {
    if (key) {
      this.#messageCache.delete(key);
    } else {
      this.#messageCache.clear();
    }
  }

  async searchMessages(chatId, searchText) {
    try {
      const snapshot = await this.getMessagesRef(chatId)
        .orderBy('createdAt', 'desc')
        .where('text', '>=', searchText)
        .where('text', '<=', searchText + '\uf8ff')
        .limit(MessageService.SEARCH_LIMIT)
        .get();

      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Failed to search messages:', error);
      throw new Error('Failed to search messages');
    }
  }
}

export default MessageService;



