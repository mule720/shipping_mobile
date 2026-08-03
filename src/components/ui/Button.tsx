import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useStore } from '../../store/useStore';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  title, onPress, variant = 'primary', loading, disabled, style, fullWidth, size = 'md',
}: Props) {
  const { primaryColor } = useStore();
  const isDisabled = disabled || loading;

  const getStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: isDisabled ? '#a5b4fc' : primaryColor, borderColor: primaryColor };
      case 'secondary':
        return { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: primaryColor };
      case 'danger':
        return { backgroundColor: isDisabled ? '#fca5a5' : '#ef4444', borderColor: '#ef4444' };
      case 'ghost':
        return { backgroundColor: 'transparent', borderColor: 'transparent' };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return '#ffffff';
      case 'danger': return '#ffffff';
      case 'secondary': return '#374151';
      case 'outline': return primaryColor;
      case 'ghost': return primaryColor;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingHorizontal: 12, paddingVertical: 7 };
      case 'lg': return { paddingHorizontal: 24, paddingVertical: 15 };
      default: return { paddingHorizontal: 18, paddingVertical: 12 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 13;
      case 'lg': return 16;
      default: return 15;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        getStyle(),
        getPadding(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
