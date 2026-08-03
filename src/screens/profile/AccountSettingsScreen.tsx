import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function AccountSettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, primaryColor } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    Alert.alert('Saved', 'Account settings updated successfully.');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Card style={styles.card} padding={20}>
          <Text style={styles.sectionLabel}>Profile Information</Text>
          <Input label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        </Card>

        <Card style={styles.card} padding={20}>
          <Text style={styles.sectionLabel}>Role</Text>
          <View style={styles.roleRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={primaryColor} />
            <Text style={styles.roleText}>{user?.role?.replace(/_/g, ' ') || 'User'}</Text>
          </View>
        </Card>

        <Button title="Save Changes" onPress={handleSave} fullWidth size="lg" />
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
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roleText: { fontSize: 15, color: '#374151', fontWeight: '500', textTransform: 'capitalize' },
});
