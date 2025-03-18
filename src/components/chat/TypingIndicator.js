import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const DotAnimation = memo(function DotAnimation() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 1,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 1,
            duration: 400,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsContainer}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [{
                translateY: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4],
                }),
              }],
            },
          ]}
        />
      ))}
    </View>
  );
});

export const TypingIndicator = memo(function TypingIndicator({
  typingUsers = [],
  maxDisplayNames = 2,
}) {
  const { theme } = useTheme();

  if (!typingUsers?.length) return null;

  const text = typingUsers.length === 1
    ? `${typingUsers[0]} is typing`
    : typingUsers.length <= maxDisplayNames
    ? `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing`
    : 'Several people are typing';

  return (
    <View style={[styles.container, { backgroundColor: theme.typingBackground }]}>
      <Text
        style={[styles.text, { color: theme.textSecondary }]}
        numberOfLines={1}
      >
        {text}
      </Text>
      <DotAnimation />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    marginRight: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginHorizontal: 2,
  },
});

