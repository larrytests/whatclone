import { useEffect, useCallback } from 'react';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function usePushNotification() {
  const navigation = useNavigation();

  useEffect(() => {
    PushNotification.configure({
      onRegister: function(token) {
        // Save the token to your backend
      },

      onNotification: function(notification) {
        const { data, userInteraction } = notification;

        if (userInteraction) {
          // Handle notification click
          if (data?.chatId) {
            navigation.navigate('Chat', { contactId: data.chatId });
          }
        }

        // Required on iOS only
        if (Platform.OS === 'ios') {
          notification.finish('backgroundFetchResultNoData');
        }
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }, [navigation]);

  const sendNotification = useCallback(({
    title,
    message,
    data = {},
    channelId = 'default',
  }) => {
    PushNotification.localNotification({
      channelId,
      title,
      message,
      data,
      playSound: true,
      soundName: 'message.mp3',
      importance: 'high',
      priority: 'high',
      ...Platform.select({
        android: {
          largeIcon: 'ic_launcher',
          smallIcon: 'ic_notification',
          vibrate: true,
          vibration: 300,
        },
      }),
    });
  }, []);

  return {
    sendNotification,
  };
}