import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { graphqlClient } from '../../api/client';
import { MY_NOTIFICATION_PREFERENCES_QUERY, UPDATE_MY_NOTIFICATION_PREFERENCES_MUTATION } from '../../api/queries';

const PREFS = [
  { key: 'shipment_updates', label: 'Shipment Updates', desc: 'Status changes for your shipments' },
  { key: 'delivery_alerts', label: 'Delivery Alerts', desc: 'When shipments are delivered' },
  { key: 'cod_reminders', label: 'COD Reminders', desc: 'Pending cash-on-delivery collections' },
  { key: 'team_activity', label: 'Team Activity', desc: 'New users and role changes' },
  { key: 'system_alerts', label: 'System Alerts', desc: 'Maintenance and service updates' },
];

const RECEIPT_CHANNELS = [
  { value: 'sms', label: 'SMS', icon: 'phone-portrait-outline' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'chatbubble-ellipses-outline' },
  { value: 'email', label: 'Mail', icon: 'mail-outline' },
] as const;

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
  const [receiptChannel, setReceiptChannel] = useState('sms');
  const [loadingPref, setLoadingPref] = useState(true);
  const [savingPref, setSavingPref] = useState(false);

  useEffect(() => {
    graphqlClient.query(MY_NOTIFICATION_PREFERENCES_QUERY)
      .then((data: any) => {
        if (data?.myNotificationPreferences?.preferredReceiptChannel) {
          setReceiptChannel(data.myNotificationPreferences.preferredReceiptChannel);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPref(false));
  }, []);

  const handleSaveChannel = async () => {
    setSavingPref(true);
    try {
      await graphqlClient.mutate(UPDATE_MY_NOTIFICATION_PREFERENCES_MUTATION, {
        preferredReceiptChannel: receiptChannel,
      });
      Alert.alert('Saved', 'Default receipt channel updated.');
    } catch {
      Alert.alert('Error', 'Could not save preference.');
    } finally {
      setSavingPref(false);
    }
  };

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

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Receipt Delivery</Text>
        <Text style={styles.channelDesc}>
          Your preferred channel for shipment receipts. Pre-filled when you create new shipments.
        </Text>
        {loadingPref ? (
          <ActivityIndicator color={primaryColor} style={{ marginVertical: 12 }} />
        ) : (
          <Card padding={16}>
            <View style={styles.channelRow}>
              {RECEIPT_CHANNELS.map(ch => {
                const active = receiptChannel === ch.value;
                return (
                  <TouchableOpacity
                    key={ch.value}
                    style={[styles.channelBtn, active && { borderColor: primaryColor, backgroundColor: primaryColor + '15' }]}
                    onPress={() => setReceiptChannel(ch.value)}
                  >
                    <Ionicons name={ch.icon as any} size={18} color={active ? primaryColor : '#9ca3af'} />
                    <Text style={[styles.channelLabel, active && { color: primaryColor }]}>{ch.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: primaryColor }, savingPref && { opacity: 0.6 }]}
              onPress={handleSaveChannel}
              disabled={savingPref}
            >
              <Text style={styles.saveBtnText}>{savingPref ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </Card>
        )}
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
  channelDesc: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  channelRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  channelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', gap: 6 },
  channelLabel: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  saveBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
