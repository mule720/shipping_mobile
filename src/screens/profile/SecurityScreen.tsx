import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function SecurityScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const handleChange = () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPw.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    Alert.alert('Success', 'Password changed successfully.');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Card style={styles.card} padding={20}>
          <Text style={styles.sectionLabel}>Change Password</Text>
          <Input label="Current Password" value={currentPw} onChangeText={setCurrentPw} secureTextEntry placeholder="••••••••" />
          <Input label="New Password" value={newPw} onChangeText={setNewPw} secureTextEntry placeholder="••••••••" />
          <Input label="Confirm New Password" value={confirmPw} onChangeText={setConfirmPw} secureTextEntry placeholder="••••••••" />
          <Button title="Change Password" onPress={handleChange} fullWidth />
        </Card>

        <Card style={styles.card} padding={20}>
          <Text style={styles.sectionLabel}>Active Sessions</Text>
          <View style={styles.sessionRow}>
            <Ionicons name="phone-portrait-outline" size={20} color={primaryColor} />
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionDevice}>Current Device</Text>
              <Text style={styles.sessionMeta}>Mobile App · Active now</Text>
            </View>
            <View style={[styles.activeDot, { backgroundColor: '#22c55e' }]} />
          </View>
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
  card: { marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionInfo: { flex: 1 },
  sessionDevice: { fontSize: 15, fontWeight: '600', color: '#111827' },
  sessionMeta: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
});
