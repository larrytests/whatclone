import { Platform, AppState } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { PerformanceMonitor } from '../../utils/performance';

export class ContactStatusService {
  static ONLINE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
  static STATUS_COLLECTION = 'status';
  
  constructor() {
    this.firestore = firestore;
    this.subscriptions = new Map();
  }

  subscribeToStatus(contactId, onUpdate, onError) {
    if (this.subscriptions.has(contactId)) {
      return this.subscriptions.get(contactId);
    }

    const unsubscribe = this.firestore()
      .collection(ContactStatusService.STATUS_COLLECTION)
      .doc(contactId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            onUpdate(this.checkOnlineStatus(doc.data()));
          }
        },
        (error) => {
          console.error(`Status subscription error for ${contactId}:`, error);
          onError(error);
        }
      );

    this.subscriptions.set(contactId, unsubscribe);
    return unsubscribe;
  }

  checkOnlineStatus(statusData) {
    if (!statusData) return false;
    
    const lastSeen = statusData.lastSeen?.toDate();
    return statusData.state === 'online' &&
      (!lastSeen || Date.now() - lastSeen.getTime() < ContactStatusService.ONLINE_THRESHOLD_MS);
  }

  async updateUserStatus(userId, isOnline) {
    return PerformanceMonitor.trackOperation('update_status', async () => {
      const statusRef = this.firestore()
        .collection(ContactStatusService.STATUS_COLLECTION)
        .doc(userId);

      await statusRef.set({
        state: isOnline ? 'online' : 'offline',
        lastSeen: this.firestore.FieldValue.serverTimestamp(),
        device: Platform.OS,
      }, { merge: true });
    });
  }

  startStatusTracking(userId) {
    this.updateUserStatus(userId, true);

    if (Platform.OS === 'web') {
      const handleVisibilityChange = () => {
        this.updateUserStatus(userId, document.visibilityState === 'visible');
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        this.updateUserStatus(userId, false);
      };
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      this.updateUserStatus(userId, nextAppState === 'active');
    });

    return () => {
      subscription.remove();
      this.updateUserStatus(userId, false);
    };
  }

  unsubscribeAll() {
    this.subscriptions.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.subscriptions.clear();
  }
}



