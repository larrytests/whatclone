import NetInfo from '@react-native-community/netinfo';

export function useConnection() {
  const [isConnected, setIsConnected] = useState(true);
  const [type, setType] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setType(state.type);

      if (!state.isConnected) {
        // Show offline banner
        showOfflineBanner();
      }
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, type };
}