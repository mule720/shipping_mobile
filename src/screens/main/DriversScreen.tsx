import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useDrivers, useCreateDriver, useVehicles, useCreateVehicle, useBranches } from '../../hooks/useData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { VEHICLE_TYPES } from '../../constants/config';
import type { Driver, Vehicle } from '../../types';

type Tab = 'drivers' | 'vehicles';

export function DriversScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [tab, setTab] = useState<Tab>('drivers');
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const { data: drivers, isLoading: driversLoading, refetch: refetchDrivers } = useDrivers();
  const { data: vehicles, isLoading: vehiclesLoading, refetch: refetchVehicles } = useVehicles();

  const renderDriver = ({ item: d }: { item: Driver }) => (
    <Card style={styles.card} padding={14}>
      <View style={styles.cardRow}>
        <View style={[styles.avatar, { backgroundColor: primaryColor + '20' }]}>
          <Text style={[styles.avatarText, { color: primaryColor }]}>
            {d.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{d.name}</Text>
          <Text style={styles.meta}>{d.phone}</Text>
          <Text style={styles.meta}>License: {d.licenseNumber}</Text>
        </View>
        <View style={styles.stats}>
          <View style={[styles.availBadge, { backgroundColor: d.isAvailable ? '#d1fae5' : '#fee2e2' }]}>
            <Text style={[styles.availText, { color: d.isAvailable ? '#059669' : '#ef4444' }]}>
              {d.isAvailable ? 'Available' : 'Busy'}
            </Text>
          </View>
          {d.rating && <Text style={styles.rating}>⭐ {d.rating.toFixed(1)}</Text>}
          {d.activeDeliveries !== undefined && (
            <Text style={styles.deliveries}>{d.activeDeliveries} active</Text>
          )}
        </View>
      </View>
    </Card>
  );

  const renderVehicle = ({ item: v }: { item: Vehicle }) => (
    <Card style={styles.card} padding={14}>
      <View style={styles.cardRow}>
        <View style={[styles.avatar, { backgroundColor: '#f59e0b20' }]}>
          <Ionicons name="car-sport-outline" size={22} color="#f59e0b" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{v.plateNumber}</Text>
          <Text style={styles.meta}>{v.make} {v.model} {v.year}</Text>
          <Text style={styles.meta}>{v.type || 'Vehicle'} · {v.capacityKg} kg</Text>
        </View>
        <View style={[styles.availBadge, { backgroundColor: v.isActive ? '#d1fae5' : '#f3f4f6', alignSelf: 'flex-start' }]}>
          <Text style={[styles.availText, { color: v.isActive ? '#059669' : '#9ca3af' }]}>
            {v.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.tabRow}>
        {(['drivers', 'vehicles'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: primaryColor }]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && { color: primaryColor, fontWeight: '700' }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'drivers' ? (
        <FlatList
          data={drivers as Driver[]}
          keyExtractor={item => item.id}
          renderItem={renderDriver}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={<RefreshControl refreshing={driversLoading} onRefresh={refetchDrivers} tintColor={primaryColor} />}
          ListEmptyComponent={<EmptyState icon="person-outline" title="No drivers" message="Add your first driver" />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={vehicles as Vehicle[]}
          keyExtractor={item => item.id}
          renderItem={renderVehicle}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
          refreshControl={<RefreshControl refreshing={vehiclesLoading} onRefresh={refetchVehicles} tintColor={primaryColor} />}
          ListEmptyComponent={<EmptyState icon="car-outline" title="No vehicles" message="Add your first vehicle" />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={() => tab === 'drivers' ? setShowDriverModal(true) : setShowVehicleModal(true)}
      >
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      <AddDriverModal visible={showDriverModal} onClose={() => setShowDriverModal(false)} />
      <AddVehicleModal visible={showVehicleModal} onClose={() => setShowVehicleModal(false)} />
    </View>
  );
}

function AddDriverModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { company } = useStore();
  const { data: branches } = useBranches();
  const createDriver = useCreateDriver();
  const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [license, setLicense] = useState(''); const [branchId, setBranchId] = useState('');

  const handleAdd = async () => {
    if (!name || !phone || !license || !branchId) {
      Alert.alert('Missing Info', 'Fill all required fields.'); return;
    }
    try {
      await createDriver.mutateAsync({ companyId: company!.id, name, phone, licenseNumber: license, branchId });
      Alert.alert('Success', 'Driver added!');
      setName(''); setPhone(''); setLicense(''); setBranchId(''); onClose();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={modal.container}>
        <View style={modal.header}>
          <Text style={modal.title}>Add Driver</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
        </View>
        <ScrollView style={modal.body} keyboardShouldPersistTaps="handled">
          <Input label="Full Name" value={name} onChangeText={setName} required leftIcon="person-outline" />
          <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" required leftIcon="call-outline" />
          <Input label="License Number" value={license} onChangeText={setLicense} required leftIcon="card-outline" />
          <Text style={modal.pickerLabel}>Branch *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {(branches ?? []).map(b => (
              <TouchableOpacity key={b.id} style={[modal.chip, branchId === b.id && modal.chipActive]} onPress={() => setBranchId(b.id)}>
                <Text style={[modal.chipText, branchId === b.id && modal.chipTextActive]}>{b.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button title="Add Driver" onPress={handleAdd} loading={createDriver.isPending} fullWidth size="lg" />
        </ScrollView>
      </View>
    </Modal>
  );
}

function AddVehicleModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { company, primaryColor } = useStore();
  const { data: branches } = useBranches();
  const createVehicle = useCreateVehicle();
  const [plate, setPlate] = useState(''); const [make, setMake] = useState('');
  const [model, setModel] = useState(''); const [year, setYear] = useState('');
  const [capacity, setCapacity] = useState(''); const [vehicleType, setVehicleType] = useState('van');
  const [branchId, setBranchId] = useState('');

  const handleAdd = async () => {
    if (!plate || !make || !model || !year || !capacity || !branchId) {
      Alert.alert('Missing Info', 'Fill all required fields.'); return;
    }
    try {
      await createVehicle.mutateAsync({ companyId: company!.id, plateNumber: plate, make, model, year: parseInt(year), vehicleType, capacityKg: parseFloat(capacity), branchId });
      Alert.alert('Success', 'Vehicle added!');
      setPlate(''); setMake(''); setModel(''); setYear(''); setCapacity(''); setBranchId(''); onClose();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={modal.container}>
        <View style={modal.header}>
          <Text style={modal.title}>Add Vehicle</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
        </View>
        <ScrollView style={modal.body} keyboardShouldPersistTaps="handled">
          <Input label="Plate Number" value={plate} onChangeText={setPlate} autoCapitalize="characters" required leftIcon="card-outline" />
          <Input label="Make (Brand)" value={make} onChangeText={setMake} placeholder="Toyota" required leftIcon="car-outline" />
          <Input label="Model" value={model} onChangeText={setModel} placeholder="Hilux" required leftIcon="car-outline" />
          <Input label="Year" value={year} onChangeText={setYear} keyboardType="number-pad" placeholder="2022" required leftIcon="calendar-outline" />
          <Input label="Capacity (kg)" value={capacity} onChangeText={setCapacity} keyboardType="decimal-pad" required leftIcon="scale-outline" />
          <Text style={modal.pickerLabel}>Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {VEHICLE_TYPES.map(t => (
              <TouchableOpacity key={t.value} style={[modal.chip, vehicleType === t.value && modal.chipActive]} onPress={() => setVehicleType(t.value)}>
                <Text style={[modal.chipText, vehicleType === t.value && modal.chipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={modal.pickerLabel}>Branch *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {(branches ?? []).map(b => (
              <TouchableOpacity key={b.id} style={[modal.chip, branchId === b.id && modal.chipActive]} onPress={() => setBranchId(b.id)}>
                <Text style={[modal.chipText, branchId === b.id && modal.chipTextActive]}>{b.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button title="Add Vehicle" onPress={handleAdd} loading={createVehicle.isPending} fullWidth size="lg" />
        </ScrollView>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#ffffff' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  body: { padding: 20 },
  pickerLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', marginRight: 8 },
  chipActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#ffffff' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  tabRow: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 0 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  meta: { fontSize: 12, color: '#6b7280', marginBottom: 1 },
  stats: { alignItems: 'flex-end', gap: 4 },
  availBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  availText: { fontSize: 11, fontWeight: '700' },
  rating: { fontSize: 12, color: '#374151' },
  deliveries: { fontSize: 11, color: '#9ca3af' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
});
