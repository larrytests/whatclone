import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar } from '../common/Avatar';
import { useTheme } from '../../hooks/useTheme';
import { useContact } from '../../hooks/useContact';

export const ChatHeader = function ChatHeader({ contactId }) {
  const { contact, isOnline, loading, error, retry } = useContact(contactId);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <ErrorView 
        error={error}
        onRetry={retry}
        message="Failed to load contact info"
      />
    );
  }

  return (
    <View style={styles.header}>
      <Avatar
        uri={contact?.avatar}
        size={40}
        online={isOnline}
        fallback={contact?.name?.[0]}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{contact?.name || 'Unknown Contact'}</Text>
        <OnlineStatus isOnline={isOnline} lastSeen={contact?.lastSeen} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  info: {
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
});

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('en-US', options);
}



