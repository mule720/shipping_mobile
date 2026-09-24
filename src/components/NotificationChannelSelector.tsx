import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CHANNELS = [
  { value: 'sms', label: 'SMS', icon: 'chatbubble-outline' as const, desc: 'Text message' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' as const, desc: 'WhatsApp' },
  { value: 'email', label: 'Email', icon: 'mail-outline' as const, desc: 'Email' },
];

interface Props {
  value: string;
  onChange: (channel: string) => void;
  disabled?: boolean;
  primaryColor?: string;
}

export function NotificationChannelSelector({ value, onChange, disabled, primaryColor = '#3b82f6' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Receipt Delivery Channel</Text>
      <Text style={styles.desc}>Receipts sent to both sender & recipient after booking</Text>
      <View style={styles.row}>
        {CHANNELS.map(ch => {
          const active = value === ch.value;
          return (
            <TouchableOpacity
              key={ch.value}
              onPress={() => !disabled && onChange(ch.value)}
              style={[
                styles.chip,
                active && { borderColor: primaryColor, backgroundColor: primaryColor + '15' },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={ch.icon}
                size={16}
                color={active ? primaryColor : '#6b7280'}
              />
              <Text style={[styles.chipLabel, active && { color: primaryColor }]}>
                {ch.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  desc: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  chipLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
});
