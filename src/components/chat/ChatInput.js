import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { TextInput, View, Platform } from 'react-native';
import debounce from 'lodash/debounce';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import { useKeyboardController } from 'react-native-keyboard-controller';

export const ChatInput = memo(function ChatInput({
  onSend,
  onAttachment,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
}) {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  const { keyboardHeight } = useKeyboardController({
    onKeyboardMoved: (height) => {
      // Handle keyboard height changes
    },
  });

  // Debounced typing indicator
  const debouncedTyping = useCallback(
    debounce((isTyping) => {
      onTyping?.(isTyping);
    }, 500),
    [onTyping]
  );

  useEffect(() => {
    return () => {
      debouncedTyping.cancel();
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [debouncedTyping]);

  const handleChangeText = useCallback((text) => {
    setMessage(text);
    debouncedTyping(true);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      debouncedTyping(false);
    }, 3000);
  }, [debouncedTyping]);

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSend(trimmedMessage);
    setMessage('');
    debouncedTyping.cancel();
    debouncedTyping(false);
    
    // Focus input after sending
    inputRef.current?.focus();
  }, [message, disabled, onSend, debouncedTyping]);

  const handleKeyPress = useCallback(({ nativeEvent }) => {
    if (Platform.OS === 'web' && !isComposing && nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
      handleSend();
      nativeEvent.preventDefault();
    }
  }, [handleSend, isComposing]);

  const handleAttachment = () => {
    Keyboard.dismiss();
    onAttachment?.();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.inputBackground },
        Platform.OS === 'ios' && { marginBottom: keyboardHeight },
      ]}
    >
      <Pressable
        style={styles.attachButton}
        onPress={handleAttachment}
      >
        <Icon
          name="attachment"
          size={24}
          color={theme.inputIcon}
        />
      </Pressable>

      <TextInput
        ref={inputRef}
        value={message}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        multiline
        maxLength={1000}
        style={[
          styles.input,
          { color: theme.inputText, backgroundColor: theme.inputFieldBackground },
        ]}
        editable={!disabled}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      />

      {message.trim() ? (
        <Pressable
          style={styles.sendButton}
          onPress={handleSend}
        >
          <Icon
            name="send"
            size={24}
            color={theme.primary}
          />
        </Pressable>
      ) : (
        <View style={styles.rightButtons}>
          <Pressable
            style={styles.actionButton}
            onPress={() => {/* Handle camera */}}
          >
            <Icon
              name="camera"
              size={24}
              color={theme.inputIcon}
            />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => {/* Handle voice message */}}
          >
            <Icon
              name="microphone"
              size={24}
              color={theme.inputIcon}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  attachButton: {
    padding: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
    marginBottom: 8,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginBottom: 8,
  },
});
