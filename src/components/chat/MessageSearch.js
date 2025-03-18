import React, { memo, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Animated } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';

export const MessageSearch = memo(function MessageSearch({
  onSearch,
  onNext,
  onPrevious,
  resultsCount,
  currentIndex,
  onClose,
}) {
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const toggleSearch = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
    }).start();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    onSearch(text);
  };

  const width = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchContainer, { width }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.inputBackground,
            color: theme.textColor 
          }]}
          placeholder="Search messages..."
          placeholderTextColor={theme.textSecondary}
          value={searchText}
          onChangeText={handleSearch}
          autoFocus={isExpanded}
        />
        {resultsCount > 0 && (
          <View style={styles.navigationContainer}>
            <Text style={[styles.resultsText, { color: theme.textSecondary }]}>
              {currentIndex + 1} of {resultsCount}
            </Text>
            <Pressable onPress={onPrevious} style={styles.navButton}>
              <Icon name="chevron-up" size={24} color={theme.textColor} />
            </Pressable>
            <Pressable onPress={onNext} style={styles.navButton}>
              <Icon name="chevron-down" size={24} color={theme.textColor} />
            </Pressable>
          </View>
        )}
      </Animated.View>
      <Pressable
        onPress={isExpanded ? onClose : toggleSearch}
        style={styles.searchButton}
      >
        <Icon
          name={isExpanded ? 'close' : 'magnify'}
          size={24}
          color={theme.textColor}
        />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsText: {
    marginRight: 8,
    fontSize: 12,
  },
  navButton: {
    padding: 4,
  },
  searchButton: {
    padding: 8,
  },
});
