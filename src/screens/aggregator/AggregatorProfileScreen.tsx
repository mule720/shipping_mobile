import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { MY_AGGREGATOR_PROFILE_QUERY, UPDATE_AGGREGATOR_PROFILE_MUTATION } from '../../api/queries';
import { useStore } from '../../store/useStore';

export function AggregatorProfileScreen() {
  const { primaryColor } = useStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['myAggregatorProfile'],
    queryFn: () => graphqlClient.query(MY_AGGREGATOR_PROFILE_QUERY, {}),
    onSuccess: (d: any) => {
      const p = d?.myAggregatorProfile;
      setForm({ vehicleType: p?.vehicleType ?? '', vehiclePlate: p?.vehiclePlate ?? '', serviceRadius: String(p?.serviceRadius ?? '') });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => graphqlClient.mutate(UPDATE_AGGREGATOR_PROFILE_MUTATION, {
      vehicleType: form.vehicleType,
      vehiclePlate: form.vehiclePlate,
      serviceRadius: parseFloat(form.serviceRadius),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myAggregatorProfile'] }); setEditing(false); Alert.alert('Success', 'Profile updated'); },
    onError: () => Alert.alert('Error', 'Failed to update profile'),
  });

  const profile = (data as any)?.myAggregatorProfile;

  if (isLoading) return <ActivityIndicator style={{ marginTop: 60 }} color={primaryColor} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Avatar & name */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: primaryColor + '20' }]}>
          <Text style={[styles.avatarText, { color: primaryColor }]}>
            {profile?.user?.firstName?.[0] ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.user?.firstName} {profile?.user?.lastName}</Text>
        <Text style={styles.email}>{profile?.user?.email}</Text>
        <View style={[styles.badge, { backgroundColor: profile?.isAvailable ? '#dcfce7' : '#fee2e2' }]}>
          <Text style={[styles.badgeText, { color: profile?.isAvailable ? '#16a34a' : '#dc2626' }]}>
            {profile?.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Deliveries', value: profile?.totalDeliveries ?? 0 },
          { label: 'Rating', value: Number(profile?.averageRating ?? 0).toFixed(1) },
          { label: 'Earnings', value: `K ${Number(profile?.totalEarnings ?? 0).toFixed(0)}` },
        ].map(s => (
          <View key={s.label} style={styles.statBox}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Vehicle info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehicle Info</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'close-outline' : 'pencil-outline'} size={20} color={primaryColor} />
          </TouchableOpacity>
        </View>

        {editing ? (
          <>
            <Text style={styles.label}>Vehicle Type</Text>
            <TextInput style={styles.input} value={form.vehicleType} onChangeText={v => setForm((p: any) => ({ ...p, vehicleType: v }))} />
            <Text style={styles.label}>Plate Number</Text>
            <TextInput style={styles.input} value={form.vehiclePlate} onChangeText={v => setForm((p: any) => ({ ...p, vehiclePlate: v }))} autoCapitalize="characters" />
            <Text style={styles.label}>Service Radius (km)</Text>
            <TextInput style={styles.input} value={form.serviceRadius} onChangeText={v => setForm((p: any) => ({ ...p, serviceRadius: v }))} keyboardType="numeric" />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: primaryColor }]} onPress={() => updateMutation.mutate()}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <InfoRow icon="car-outline" label="Vehicle" value={profile?.vehicleType ?? '—'} />
            <InfoRow icon="id-card-outline" label="Plate" value={profile?.vehiclePlate ?? '—'} />
            <InfoRow icon="navigate-outline" label="Radius" value={`${profile?.serviceRadius ?? 0} km`} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={16} color="#9ca3af" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: '#111827' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: { marginTop: 8, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 1 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { flex: 1, fontSize: 13, color: '#6b7280' },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 4 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
