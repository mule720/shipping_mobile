import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SHIPMENT_STATUS_LABELS, STATUS_COLORS } from '../../constants/config';

interface Props {
  status: string;
  small?: boolean;
}

export function StatusBadge({ status, small }: Props) {
  const color = STATUS_COLORS[status] || '#6b7280';
  const label = SHIPMENT_STATUS_LABELS[status] || status;
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color, fontSize: small ? 10 : 12 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
