import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';

export const MessageStatus = memo(function MessageStatus({ status, createdAt }) {
  const { theme } = useTheme();

  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <Icon name="check" size={16} color={theme.messageStatusColor} />;
      case 'delivered':
        return <Icon name="check-all" size={16} color={theme.messageStatusColor} />;
      case 'read':
        return <Icon name="check-all" size={16} color={theme.messageReadColor} />;
      case 'error':
        return <Icon name="alert-circle" size={16} color={theme.errorColor} />;
      default:
        return <Icon name="clock-outline" size={16} color={theme.messageStatusColor} />;
    }
  };

  return (
    <View style={styles.container}>
      {getStatusIcon()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    alignSelf: 'flex-end',
  },
});
