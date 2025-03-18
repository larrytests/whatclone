import { useState, useEffect } from 'react';
import { ContactService } from '../services/contact/ContactService';
import { ContactStatusService } from '../services/contact/ContactStatusService';

const contactService = new ContactService();
const statusService = new ContactStatusService();

export function useContact(contactId) {
  const [state, setState] = useState({
    contact: null,
    isOnline: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!contactId) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: new Error('Contact ID is required')
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const handleContactUpdate = (contact) => {
      setState(prev => ({
        ...prev,
        contact,
        loading: false,
        error: null
      }));
    };

    const handleStatusUpdate = (isOnline) => {
      setState(prev => ({
        ...prev,
        isOnline
      }));
    };

    const handleError = (error) => {
      setState(prev => ({
        ...prev,
        loading: false,
        error
      }));
    };

    const unsubscribeContact = contactService.subscribeToContact(
      contactId,
      handleContactUpdate,
      handleError
    );

    const unsubscribeStatus = statusService.subscribeToStatus(
      contactId,
      handleStatusUpdate,
      handleError
    );

    return () => {
      unsubscribeContact();
      unsubscribeStatus();
    };
  }, [contactId]);

  return state;
}



