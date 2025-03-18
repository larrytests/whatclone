import { useState, useEffect } from 'react';
import { ContactService } from '../services/contact/ContactService';
import { useAuth } from './useAuth';

const contactService = new ContactService();

export function useContacts() {
  const { currentUser } = useAuth();
  const [state, setState] = useState({
    contacts: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!currentUser) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    const unsubscribe = contactService.subscribeToContacts(
      currentUser._id,
      (contacts) => {
        setState(prev => ({
          ...prev,
          contacts,
          loading: false
        }));
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error,
          loading: false
        }));
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return state;
}
