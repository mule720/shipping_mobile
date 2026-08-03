import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';

export function CompanyProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { company, primaryColor } = useStore();

  const fields = [
    { label: 'Company Name', value: company?.name || '—', icon: 'business-outline' as const },
    { label: 'Subscription', value: company?.subscription ? (company.subscription.charAt(0).toUpperCase() + company.subscription.slice(1)) + ' Plan' : '—', icon: 'card-outline' as const },
    { label: 'Status', value: company?.isActive ? 'Active' : 'Inactive', icon: 'checkmark-circle-outline' as const },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={[styles.banner, { backgroundColor: primaryColor }]}>
          <View style={styles.companyIcon}>
            <Text style={styles.companyInitial}>{(company?.name || 'C')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.companyName}>{company?.name || 'Your Company'}</Text>
        </View>

        <Card style={styles.card} padding={20}>
          {fields.map((f, i) => (
            <View key={f.label} style={[styles.fieldRow, i < fields.length - 1 && styles.fieldBorder]}>
              <Ionicons name={f.icon} size={18} color={primaryColor} />
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <Text style={styles.fieldValue}>{f.value}</Text>
              </View>
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
  body: { flex: 1 },
  banner: { alignItems: 'center', paddingVertical: 32 },
  companyIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  companyInitial: { fontSize: 32, fontWeight: '800', color: '#fff' },
  companyName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  card: { margin: 16 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '500', marginBottom: 2 },
  fieldValue: { fontSize: 15, color: '#111827', fontWeight: '600' },
});
