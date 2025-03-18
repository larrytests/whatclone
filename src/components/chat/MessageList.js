import React, { memo, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { useTheme } from '../../hooks/useTheme';
import { LoadingIndicator } from '../common/LoadingIndicator';

export const MessageList = memo(function MessageList({
  messages,
  loading,
  hasMore,
  onLoadMore,
  onLongPress,
  selectedMessages,
}) {
  const { theme } = useTheme();

  const renderItem = useCallback(({ item }) => (
    <MessageBubble
      message={item}
      onLongPress={onLongPress}
      isSelected={selectedMessages?.includes(item.id)}
      theme={theme}
    />
  ), [onLongPress, selectedMessages, theme]);

  const keyExtractor = useCallback((item) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return <LoadingIndicator />;
  }, [loading]);

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      inverted
      onEndReached={hasMore ? onLoadMore : null}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={21}
      removeClippedSubviews={true}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});