import firestore from '@react-native-firebase/firestore';
import { ContactStatusService } from './ContactStatusService';

export class ContactService {
  constructor() {
    this.firestore = firestore;
    this.statusService = new ContactStatusService();
  }

  async getContacts(userId) {
    const userDoc = await this.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const contactIds = userDoc.data().contacts || [];
    const contactsSnapshot = await this.firestore()
      .collection('users')
      .where(firestore.FieldPath.documentId(), 'in', contactIds)
      .get();

    return contactsSnapshot.docs.map(this.formatContact);
  }

  subscribeToContacts(userId, onUpdate, onError) {
    return this.firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(
        async (doc) => {
          if (!doc.exists) {
            onError(new Error('User not found'));
            return;
          }

          const contactIds = doc.data().contacts || [];
          if (contactIds.length === 0) {
            onUpdate([]);
            return;
          }

          try {
            const contacts = await this.getContacts(userId);
            onUpdate(contacts);
          } catch (error) {
            onError(error);
          }
        },
        onError
      );
  }

  formatContact(doc) {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || 'Unknown',
      avatar: data.avatar,
      email: data.email,
      phone: data.phone,
      lastSeen: data.lastSeen?.toDate(),
      status: data.status,
      metadata: {
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      }
    };
  }

  async addContact(userId, contactId) {
    const userRef = this.firestore().collection('users').doc(userId);
    const contactRef = this.firestore().collection('users').doc(contactId);

    return this.firestore().runTransaction(async (transaction) => {
      const [userDoc, contactDoc] = await Promise.all([
        transaction.get(userRef),
        transaction.get(contactRef),
      ]);

      if (!userDoc.exists || !contactDoc.exists) {
        throw new Error('User or contact not found');
      }

      const userContacts = userDoc.data().contacts || [];
      const contactContacts = contactDoc.data().contacts || [];

      if (!userContacts.includes(contactId)) {
        transaction.update(userRef, {
          contacts: [...userContacts, contactId],
          updatedAt: this.firestore.FieldValue.serverTimestamp(),
        });
      }

      if (!contactContacts.includes(userId)) {
        transaction.update(contactRef, {
          contacts: [...contactContacts, userId],
          updatedAt: this.firestore.FieldValue.serverTimestamp(),
        });
      }
    });
  }

  async removeContact(userId, contactId) {
    const userRef = this.firestore().collection('users').doc(userId);
    const contactRef = this.firestore().collection('users').doc(contactId);

    return this.firestore().runTransaction(async (transaction) => {
      const [userDoc, contactDoc] = await Promise.all([
        transaction.get(userRef),
        transaction.get(contactRef),
      ]);

      if (!userDoc.exists || !contactDoc.exists) {
        throw new Error('User or contact not found');
      }

      transaction.update(userRef, {
        contacts: this.firestore.FieldValue.arrayRemove(contactId),
        updatedAt: this.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(contactRef, {
        contacts: this.firestore.FieldValue.arrayRemove(userId),
        updatedAt: this.firestore.FieldValue.serverTimestamp(),
      });
    });
  }

  async updateContactMetadata(userId, contactId, metadata) {
    return this.firestore()
      .collection('users')
      .doc(userId)
      .collection('contactMetadata')
      .doc(contactId)
      .set({
        ...metadata,
        updatedAt: this.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
  }
}



