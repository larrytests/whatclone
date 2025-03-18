import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';

export const ScrollButtons = memo(function ScrollButtons({
  visible,
  chatRef,
}) {
  const { theme } = useTheme();

  if (!visible) return null;

  const scrollToBottom = () => {
    chatRef.current?.scrollToBottom();
  };

  const scrollToTop = () => {
    chatRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, { backgroundColor: theme.buttonBackground }]}
        onPress={scrollToTop}
      >
        <Icon name="chevron-up" size={24} color={theme.buttonIcon} />
      </Pressable>
      <Pressable
        style={[styles.button, { backgroundColor: theme.buttonBackground }]}
        onPress={scrollToBottom}
      >
        <Icon name="chevron-down" size={24} color={theme.buttonIcon} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});