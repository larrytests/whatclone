import firestore from '@react-native-firebase/firestore';
import { MessageService } from './MessageService';
import { concurrencyManager } from './concurrencyManager';

export class ChatService {
  constructor() {
    this.firestore = firestore;
    this.messageService = new MessageService(firestore);
  }

  getChatId(userId, contactId) {
    return [userId, contactId].sort().join('_');
  }

  getMessagesRef(chatId) {
    return this.firestore().collection('chats').doc(chatId).collection('messages');
  }

  async createOrGetChat(userId, contactId) {
    const chatId = this.getChatId(userId, contactId);
    const chatRef = this.firestore().collection('chats').doc(chatId);

    const chat = await chatRef.get();
    if (!chat.exists) {
      await chatRef.set({
        participants: [userId, contactId],
        createdAt: this.firestore.FieldValue.serverTimestamp(),
        updatedAt: this.firestore.FieldValue.serverTimestamp(),
        lastMessage: null,
      });
    }

    return chatId;
  }

  async updateLastMessage(chatId, message) {
    return concurrencyManager.runExclusive(`last_message_${chatId}`, async () => {
      const chatRef = this.firestore().collection('chats').doc(chatId);
      
      return this.firestore.runTransaction(async (transaction) => {
        const chatDoc = await transaction.get(chatRef);
        if (!chatDoc.exists) return;
        
        const currentData = chatDoc.data();
        const newTimestamp = this.firestore.FieldValue.serverTimestamp();
        
        if (!currentData.lastMessageAt || message.createdAt > currentData.lastMessageAt.toDate()) {
          transaction.update(chatRef, {
            lastMessage: {
              text: message.text,
              senderId: message.user._id,
              createdAt: message.createdAt,
            },
            lastMessageAt: newTimestamp,
            updatedAt: newTimestamp,
          });
        }
      });
    });
  }

  async editMessage(chatId, messageId, newText) {
    return concurrencyManager.runExclusive(`edit_${chatId}_${messageId}`, async () => {
      const messageRef = this.getMessagesRef(chatId).doc(messageId);
      
      return this.firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(messageRef);
        if (!doc.exists) throw new Error('Message not found');
        
        const data = doc.data();
        if (data.text === newText) return;
        
        transaction.update(messageRef, {
          text: newText,
          edited: true,
          editedAt: this.firestore.FieldValue.serverTimestamp(),
        });
      });
    });
  }

  async deleteMessage(chatId, messageId) {
    const messageRef = this.getMessagesRef(chatId).doc(messageId);
    return messageRef.update({
      deleted: true,
      deletedAt: this.firestore.FieldValue.serverTimestamp(),
    });
  }

  async forwardMessage(originalMessage, targetChatId) {
    const { text, image, video, audio } = originalMessage;
    return this.getMessagesRef(targetChatId).add({
      text,
      image,
      video,
      audio,
      createdAt: this.firestore.FieldValue.serverTimestamp(),
      forwarded: true,
      originalMessageId: originalMessage._id,
      originalChatId: originalMessage.chatId,
    });
  }
}

