import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useContacts } from '../../hooks/useContacts';
import { useTheme } from '../../hooks/useTheme';
import { ContactItem } from './ContactItem';
import { SearchBar } from '../common/SearchBar';
import { ErrorView } from '../common/ErrorView';
import { LoadingView } from '../common/LoadingView';

export const ContactList = memo(function ContactList({ contacts, searchQuery }) {
  const filteredContacts = useMemo(() => {
    if (!searchQuery?.trim()) return contacts;
    
    const query = searchQuery.toLowerCase().trim();
    const searchFields = ['name', 'email', 'phone'];
    
    return contacts.filter(contact => 
      searchFields.some(field => 
        contact[field]?.toLowerCase().includes(query)
      )
    );
  }, [contacts, searchQuery]);

  const renderItem = useCallback(({ item }) => (
    <ContactItem
      contact={item}
      key={item._id}
    />
  ), []);

  return (
    <FlatList
      data={filteredContacts}
      renderItem={renderItem}
      keyExtractor={item => item._id}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
});

