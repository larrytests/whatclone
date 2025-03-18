import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import { useKeyboardController } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MessageInput({ onSend, onTyping }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const { theme } = useTheme();
  const { keyboardHeight } = useKeyboardController();
  const insets = useSafeAreaInsets();

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    
    onSend(message.trim());
    setMessage('');
    inputRef.current?.clear();
  }, [message, onSend]);

  const handleChangeText = useCallback((text) => {
    setMessage(text);
    onTyping?.();
  }, [onTyping]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 60}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.inputBackground,
            paddingBottom: Platform.OS === 'ios' 
              ? keyboardHeight 
              : insets.bottom,
          }
        ]}
      >
        <View style={styles.inputContainer}>
          <Pressable
            style={styles.attachButton}
            onPress={() => {/* Handle attachment */}}
          >
            <Icon
              name="attachment"
              size={24}
              color={theme.inputIcon}
            />
          </Pressable>

          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { color: theme.inputText }
            ]}
            placeholder="Type a message..."
            placeholderTextColor={theme.inputPlaceholder}
            value={message}
            onChangeText={handleChangeText}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />

          <Pressable
            style={styles.emojiButton}
            onPress={() => {/* Handle emoji picker */}}
          >
            <Icon
              name="emoticon-outline"
              size={24}
              color={theme.inputIcon}
            />
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.sendButton,
            { backgroundColor: message.trim() ? theme.primary : theme.disabled }
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Icon
            name="send"
            size={24}
            color={theme.buttonText}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  attachButton: {
    padding: 8,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
