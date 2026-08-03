import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useBranches, useCreateBranch } from '../../hooks/useData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { ZAMBIAN_CITIES } from '../../constants/config';
import type { Branch } from '../../types';

export function BranchesScreen() {
  const insets = useSafeAreaInsets();
  const { company, primaryColor } = useStore();
  const { data: branches, isLoading, refetch } = useBranches();
  const [showModal, setShowModal] = useState(false);

  const renderBranch = ({ item: b }: { item: Branch }) => (
    <Card style={styles.card} padding={16}>
      <View style={styles.cardRow}>
        <View style={[styles.icon, { backgroundColor: primaryColor + '15' }]}>
          <Ionicons name="business-outline" size={22} color={primaryColor} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{b.name}</Text>
          <Text style={styles.code}>Code: {b.code}</Text>
          <Text style={styles.address}>{b.address}</Text>
          <Text style={styles.city}>{b.city}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: b.isActive ? '#d1fae5' : '#f3f4f6' }]}>
          <Text style={[styles.statusText, { color: b.isActive ? '#059669' : '#9ca3af' }]}>
            {b.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={branches as Branch[]}
        keyExtractor={item => item.id}
        renderItem={renderBranch}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />}
        ListEmptyComponent={<EmptyState icon="business-outline" title="No branches" message="Add your first branch location" />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      <AddBranchModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        companyId={company?.id ?? ''}
      />
    </View>
  );
}

function AddBranchModal({ visible, onClose, companyId }: { visible: boolean; onClose: () => void; companyId: string }) {
  const { primaryColor } = useStore();
  const createBranch = useCreateBranch();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const handleAdd = async () => {
    if (!name || !code || !city) {
      Alert.alert('Missing Info', 'Branch name, code and city are required.'); return;
    }
    try {
      await createBranch.mutateAsync({ companyId, name, code: code.toUpperCase(), address, city });
      Alert.alert('Success', 'Branch added successfully!');
      setName(''); setCode(''); setAddress(''); setCity('');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add branch.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={modal.container}>
        <View style={modal.header}>
          <Text style={modal.title}>Add Branch</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <ScrollView style={modal.body} keyboardShouldPersistTaps="handled">
          <Input label="Branch Name" value={name} onChangeText={setName} placeholder="e.g. Lusaka Main" required leftIcon="business-outline" />
          <Input label="Branch Code" value={code} onChangeText={setCode} placeholder="e.g. LKA-01" autoCapitalize="characters" required leftIcon="barcode-outline" />
          <Input label="Address" value={address} onChangeText={setAddress} placeholder="Street address" leftIcon="location-outline" />

          <Text style={modal.pickerLabel}>City *</Text>
          <View style={modal.cityGrid}>
            {ZAMBIAN_CITIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[modal.cityBtn, city === c && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                onPress={() => setCity(c)}
              >
                <Text style={[modal.cityText, city === c && { color: '#ffffff' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Add Branch" onPress={handleAdd} loading={createBranch.isPending} fullWidth size="lg" style={{ marginTop: 16 }} />
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
  pickerLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityBtn: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1.5, borderColor: '#e5e7eb' },
  cityText: { fontSize: 13, fontWeight: '500', color: '#374151' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 0 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  code: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  address: { fontSize: 12, color: '#6b7280', marginBottom: 1 },
  city: { fontSize: 12, fontWeight: '600', color: '#374151' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '700' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
});
