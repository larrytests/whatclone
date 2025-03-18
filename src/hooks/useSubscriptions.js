import { useRef, useEffect } from 'react';

export function useSubscriptions() {
  const mounted = useRef(true);
  const subscriptions = useRef([]);
  const operationLock = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearSubscriptions();
    };
  }, []);

  const addSubscription = async (subscription) => {
    if (operationLock.current) return;
    operationLock.current = true;
    
    try {
      if (typeof subscription === 'function') {
        subscriptions.current.push(subscription);
      }
    } finally {
      operationLock.current = false;
    }
  };

  const removeSubscription = async (subscription) => {
    if (operationLock.current) return;
    operationLock.current = true;
    
    try {
      subscriptions.current = subscriptions.current.filter(sub => sub !== subscription);
      if (typeof subscription === 'function') {
        await subscription();
      }
    } finally {
      operationLock.current = false;
    }
  };

  const clearSubscriptions = async () => {
    if (operationLock.current) return;
    operationLock.current = true;
    
    try {
      await Promise.all(
        subscriptions.current.map(async (unsub) => {
          if (typeof unsub === 'function') {
            await unsub();
          }
        })
      );
      subscriptions.current = [];
    } finally {
      operationLock.current = false;
    }
  };

  return {
    isMounted: () => mounted.current,
    addSubscription,
    removeSubscription,
    clearSubscriptions
  };
}
