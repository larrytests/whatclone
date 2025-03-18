import { useCallback, useRef, useEffect, useState } from 'react';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_ENABLED_KEY = '@sound_enabled';
const DEFAULT_VOLUME = 0.5;

export function useSound() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const soundRef = useRef(null);
  const volumeRef = useRef(DEFAULT_VOLUME);

  useEffect(() => {
    Sound.setCategory('Playback');
    
    // Load sound preferences
    AsyncStorage.getItem(SOUND_ENABLED_KEY)
      .then(value => setIsSoundEnabled(value !== 'false'))
      .catch(console.error);

    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, []);

  const loadSound = useCallback(async (filename) => {
    try {
      if (soundRef.current) {
        soundRef.current.release();
      }

      return new Promise((resolve, reject) => {
        const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            console.error('Sound loading error:', error);
            reject(error);
            return;
          }
          sound.setVolume(volumeRef.current);
          soundRef.current = sound;
          resolve(sound);
        });
      });
    } catch (error) {
      console.error('Sound loading error:', error);
      throw error;
    }
  }, []);

  const playSound = useCallback(async (filename) => {
    if (!isSoundEnabled) return;

    try {
      const sound = await loadSound(filename);
      return new Promise((resolve, reject) => {
        sound.play((success) => {
          if (success) {
            resolve();
          } else {
            reject(new Error('Playback failed'));
          }
        });
      });
    } catch (error) {
      console.error('Sound playback error:', error);
      throw error;
    }
  }, [isSoundEnabled, loadSound]);

  const toggleSound = useCallback(async () => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    try {
      await AsyncStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
    } catch (error) {
      console.error('Failed to save sound preference:', error);
    }
  }, [isSoundEnabled]);

  const setVolume = useCallback((volume) => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    volumeRef.current = normalizedVolume;
    if (soundRef.current) {
      soundRef.current.setVolume(normalizedVolume);
    }
  }, []);

  return {
    loadSound,
    playSound,
    toggleSound,
    setVolume,
    isSoundEnabled,
  };
}


