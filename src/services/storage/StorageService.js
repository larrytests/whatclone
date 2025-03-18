import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  static KEYS = {
    MESSAGES: 'messages',
    USER: 'user',
    SETTINGS: 'settings'
  };

  async saveData(key, data) {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Storage error for key ${key}:`, error);
      throw error;
    }
  }

  async loadData(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Loading error for key ${key}:`, error);
      return null;
    }
  }
}