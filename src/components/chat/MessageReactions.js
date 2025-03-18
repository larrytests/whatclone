import React, { memo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageReactions = memo(function MessageReactions({
  reactions,
  onAddReaction,
  onRemoveReaction,
  currentUserId,
}) {
  const { theme } = useTheme();
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const groupedReactions = reactions?.reduce((acc, reaction) => {
    acc[reaction.emoji] = acc[reaction.emoji] || [];
    acc[reaction.emoji].push(reaction.userId);
    return acc;
  }, {}) || {};

  const handleReactionPress = (emoji) => {
    const userReacted = groupedReactions[emoji]?.includes(currentUserId);
    if (userReacted) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
    setShowReactionPicker(false);
  };

  return (
    <View style={styles.container}>
      {Object.entries(groupedReactions).map(([emoji, users]) => (
        <Pressable
          key={emoji}
          style={[
            styles.reactionBubble,
            {
              backgroundColor: users.includes(currentUserId)
                ? theme.reactionActiveBackground
                : theme.reactionBackground,
            },
          ]}
          onPress={() => handleReactionPress(emoji)}
        >
          <Text style={styles.reactionEmoji}>{emoji}</Text>
          <Text style={[styles.reactionCount, { color: theme.textColor }]}>
            {users.length}
          </Text>
        </Pressable>
      ))}

      <Pressable
        style={[styles.addReactionButton, { backgroundColor: theme.reactionBackground }]}
        onPress={() => setShowReactionPicker(true)}
      >
        <Icon name="emoticon-outline" size={16} color={theme.textColor} />
      </Pressable>

      <Modal
        visible={showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowReactionPicker(false)}
        >
          <View style={[styles.reactionPicker, { backgroundColor: theme.backgroundColor }]}>
            {REACTIONS.map((emoji) => (
              <Pressable
                key={emoji}
                style={styles.reactionOption}
                onPress={() => handleReactionPress(emoji)}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  addReactionButton: {
    padding: 4,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionPicker: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  reactionOption: {
    padding: 8,
  },
});

