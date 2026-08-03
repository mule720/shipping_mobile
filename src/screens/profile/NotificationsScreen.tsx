import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';

const PREFS = [
  { key: 'shipment_updates', label: 'Shipment Updates', desc: 'Status changes for your shipments' },
  { key: 'delivery_alerts', label: 'Delivery Alerts', desc: 'When shipments are delivered' },
  { key: 'cod_reminders', label: 'COD Reminders', desc: 'Pending cash-on-delivery collections' },
  { key: 'team_activity', label: 'Team Activity', desc: 'New users and role changes' },
  { key: 'system_alerts', label: 'System Alerts', desc: 'Maintenance and service updates' },
];

export function NotificationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    shipment_updates: true,
    delivery_alerts: true,
    cod_reminders: true,
    team_activity: false,
    system_alerts: false,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Text style={styles.sectionLabel}>Push Notification Preferences</Text>
        <Card padding={0}>
          {PREFS.map((pref, i) => (
            <View key={pref.key} style={[styles.row, i < PREFS.length - 1 && styles.rowBorder]}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>{pref.label}</Text>
                <Text style={styles.rowDesc}>{pref.desc}</Text>
              </View>
              <Switch
                value={enabled[pref.key]}
                onValueChange={v => setEnabled(prev => ({ ...prev, [pref.key]: v }))}
                trackColor={{ false: '#e5e7eb', true: primaryColor + '80' }}
                thumbColor={enabled[pref.key] ? primaryColor : '#9ca3af'}
              />
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  body: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLeft: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  rowDesc: { fontSize: 13, color: '#9ca3af' },
});
