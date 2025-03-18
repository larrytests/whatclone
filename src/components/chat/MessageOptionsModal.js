import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';

export const MessageOptionsModal = memo(function MessageOptionsModal({
  visible,
  onClose,
  onEdit,
  onDelete,
  onForward,
  onCopy,
  onReply,
  isOwnMessage,
  message,
}) {
  const { theme } = useTheme();

  const options = [
    {
      icon: 'reply',
      label: 'Reply',
      onPress: onReply,
      show: true,
    },
    {
      icon: 'pencil',
      label: 'Edit',
      onPress: onEdit,
      show: isOwnMessage && !message.deleted,
    },
    {
      icon: 'delete',
      label: 'Delete',
      onPress: onDelete,
      show: isOwnMessage && !message.deleted,
    },
    {
      icon: 'forward',
      label: 'Forward',
      onPress: onForward,
      show: !message.deleted,
    },
    {
      icon: 'content-copy',
      label: 'Copy',
      onPress: onCopy,
      show: !message.deleted,
    },
  ].filter(option => option.show);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.modal,
            { backgroundColor: theme.backgroundColor },
          ]}
        >
          {options.map((option) => (
            <Pressable
              key={option.label}
              style={[
                styles.option,
                { borderBottomColor: theme.borderColor },
              ]}
              onPress={() => {
                option.onPress();
                onClose();
              }}
            >
              <Icon name={option.icon} size={24} color={theme.textColor} />
              <Text style={[styles.optionText, { color: theme.textColor }]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
  },
});