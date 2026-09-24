import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphqlClient } from '../../api/client';
import { useStore } from '../../store/useStore';

const VEHICLES_QUERY = `
  query CompanyVehicles($companyId: UUID!) {
    companyVehicles(companyId: $companyId) {
      id
      plateNumber
      vehicleType
      capacity
      isActive
      driver { id firstName lastName phone }
    }
  }
`;

const ADD_VEHICLE_MUTATION = `
  mutation AddVehicle($companyId: UUID!, $plateNumber: String!, $vehicleType: String!, $capacity: Float) {
    addVehicle(companyId: $companyId, plateNumber: $plateNumber, vehicleType: $vehicleType, capacity: $capacity) {
      id plateNumber vehicleType capacity isActive
    }
  }
`;

const VEHICLE_TYPES = ['Motorcycle', 'Car', 'Van', 'Truck', 'Mini-bus'];

export function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor, company } = useStore();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ plateNumber: '', vehicleType: 'Motorcycle', capacity: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['companyVehicles', company?.id],
    queryFn: () => graphqlClient.query(VEHICLES_QUERY, { companyId: company?.id }),
    enabled: !!company?.id,
  });

  const addMutation = useMutation({
    mutationFn: () => graphqlClient.mutate(ADD_VEHICLE_MUTATION, {
      companyId: company?.id,
      plateNumber: form.plateNumber,
      vehicleType: form.vehicleType,
      capacity: form.capacity ? parseFloat(form.capacity) : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['companyVehicles'] }); setShowAdd(false); setForm({ plateNumber: '', vehicleType: 'Motorcycle', capacity: '' }); },
    onError: () => Alert.alert('Error', 'Failed to add vehicle'),
  });

  const vehicles: any[] = (data as any)?.companyVehicles ?? [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Fleet</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: primaryColor }]} onPress={() => setShowAdd(true)}>
          <Ionicons name="add-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>{vehicles.length} vehicles · {vehicles.filter(v => v.isActive).length} active</Text>
      </View>

      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={vehicles}
          keyExtractor={i => i.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.vehicleIcon, { backgroundColor: primaryColor + '15' }]}>
                  <Ionicons
                    name={item.vehicleType === 'Motorcycle' ? 'bicycle-outline' : item.vehicleType?.includes('Truck') ? 'bus-outline' : 'car-outline'}
                    size={24}
                    color={primaryColor}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.plate}>{item.plateNumber}</Text>
                  <Text style={styles.type}>{item.vehicleType}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#10b981' : '#9ca3af' }]} />
              </View>
              <View style={styles.cardMeta}>
                {item.capacity && <Text style={styles.metaText}><Ionicons name="cube-outline" size={12} /> {item.capacity} kg</Text>}
                {item.driver && <Text style={styles.metaText}><Ionicons name="person-outline" size={12} /> {item.driver.firstName} {item.driver.lastName}</Text>}
                {!item.driver && <Text style={[styles.metaText, { color: '#9ca3af' }]}>No driver assigned</Text>}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Vehicle</Text>
            <Text style={styles.label}>Plate Number</Text>
            <TextInput style={styles.input} value={form.plateNumber} onChangeText={v => setForm(p => ({ ...p, plateNumber: v }))} autoCapitalize="characters" placeholder="e.g. BAF 1234" />
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.typeRow}>
              {VEHICLE_TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, form.vehicleType === t && { backgroundColor: primaryColor }]} onPress={() => setForm(p => ({ ...p, vehicleType: t }))}>
                  <Text style={[styles.typeChipText, form.vehicleType === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Capacity (kg, optional)</Text>
            <TextInput style={styles.input} value={form.capacity} onChangeText={v => setForm(p => ({ ...p, capacity: v }))} keyboardType="numeric" placeholder="e.g. 500" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: primaryColor }]} onPress={() => addMutation.mutate()}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  summary: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  summaryText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  plate: { fontSize: 16, fontWeight: '800', color: '#111827', letterSpacing: 1 },
  type: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardMeta: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  metaText: { fontSize: 12, color: '#6b7280' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  typeChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  confirmBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
});
