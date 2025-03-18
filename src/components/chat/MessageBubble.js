import React, { memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

export const MessageBubble = memo(function MessageBubble({
  message,
  position,
  onLongPress,
  onPress,
}) {
  const { theme } = useTheme();
  const isUser = position === 'right';

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <Image
            source={{ uri: message.image }}
            style={styles.image}
            resizeMode="cover"
          />
        );
      case 'voice':
        return (
          <View style={styles.voiceContainer}>
            <Icon name="microphone" size={20} color={isUser ? theme.bubbleTextLight : theme.bubbleTextDark} />
            <Text style={[
              styles.voiceDuration,
              { color: isUser ? theme.bubbleTextLight : theme.bubbleTextDark }
            ]}>
              {message.duration}s
            </Text>
          </View>
        );
      default:
        return (
          <Text style={[
            styles.messageText,
            { color: isUser ? theme.bubbleTextLight : theme.bubbleTextDark }
          ]}>
            {message.text}
          </Text>
        );
    }
  };

  const renderStatus = () => {
    if (!isUser) return null;

    return (
      <View style={styles.statusContainer}>
        <Text style={[styles.time, { color: theme.bubbleTextLight }]}>
          {format(new Date(message.createdAt), 'HH:mm')}
        </Text>
        {message.status === 'sent' && (
          <Icon name="check" size={16} color={theme.bubbleTextLight} />
        )}
        {message.status === 'delivered' && (
          <Icon name="check-all" size={16} color={theme.bubbleTextLight} />
        )}
        {message.status === 'read' && (
          <Icon name="check-all" size={16} color={theme.bubbleStatusRead} />
        )}
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.otherContainer
    ]}>
      <Pressable
        style={[
          styles.bubble,
          isUser ? [
            styles.userBubble,
            { backgroundColor: theme.bubbleBackgroundUser }
          ] : [
            styles.otherBubble,
            { backgroundColor: theme.bubbleBackgroundOther }
          ]
        ]}
        onLongPress={onLongPress}
        onPress={onPress}
      >
        {renderContent()}
        {renderStatus()}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 8,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 8,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  otherBubble: {
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  voiceDuration: {
    marginLeft: 8,
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    marginRight: 4,
  },
});

