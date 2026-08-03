import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  ScrollView, Alert, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useManifests, useCreateManifest, useUpdateManifestStatus, useShipments, useDrivers, useVehicles, useBranches } from '../../hooks/useData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/format';
import type { Manifest, Shipment } from '../../types';

type Tab = 'active' | 'completed';

export function DispatchScreen() {
  const insets = useSafeAreaInsets();
  const { company, primaryColor } = useStore();
  const [tab, setTab] = useState<Tab>('active');
  const [showCreate, setShowCreate] = useState(false);

  const { data: activeManifests, isLoading: loadingActive, refetch: refetchActive } = useManifests('active');
  const { data: completedManifests, isLoading: loadingCompleted, refetch: refetchCompleted } = useManifests('completed');
  const updateStatus = useUpdateManifestStatus();

  const manifests: Manifest[] = tab === 'active' ? (activeManifests ?? []) : (completedManifests ?? []);
  const isLoading = tab === 'active' ? loadingActive : loadingCompleted;

  const handleComplete = (manifestId: string) => {
    Alert.alert('Complete Dispatch', 'Mark this dispatch as completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: () => updateStatus.mutate({ manifestId, status: 'completed' }) },
    ]);
  };

  const renderManifest = ({ item: m }: { item: Manifest }) => (
    <Card style={styles.card} padding={14}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.manifestNum}>{m.manifestNumber}</Text>
          <Text style={styles.manifestDate}>{formatDate(m.createdAt)}</Text>
        </View>
        <StatusBadge status={m.status} />
      </View>
      <View style={styles.cardGrid}>
        <View style={styles.gridItem}>
          <Ionicons name="person-outline" size={14} color="#9ca3af" />
          <Text style={styles.gridLabel}>Driver</Text>
          <Text style={styles.gridValue}>{m.driverName || '—'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Ionicons name="car-outline" size={14} color="#9ca3af" />
          <Text style={styles.gridLabel}>Vehicle</Text>
          <Text style={styles.gridValue}>{m.vehiclePlate || '—'}</Text>
        </View>
        <View style={styles.gridItem}>
          <Ionicons name="cube-outline" size={14} color="#9ca3af" />
          <Text style={styles.gridLabel}>Shipments</Text>
          <Text style={styles.gridValue}>{m.shipmentCount ?? 0}</Text>
        </View>
      </View>
      {m.originBranch && (
        <Text style={styles.route}>{m.originBranch} → {m.destinationBranch}</Text>
      )}
      {m.notes && <Text style={styles.notes}>{m.notes}</Text>}
      {tab === 'active' && (
        <Button
          title="Mark Completed"
          onPress={() => handleComplete(m.id)}
          variant="outline"
          size="sm"
          style={{ marginTop: 10 }}
          loading={updateStatus.isPending}
        />
      )}
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['active', 'completed'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: primaryColor }]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && { color: primaryColor, fontWeight: '700' }]}>
              {t === 'active' ? 'Active' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={manifests}
        keyExtractor={item => item.id}
        renderItem={renderManifest}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={tab === 'active' ? refetchActive : refetchCompleted}
            tintColor={primaryColor}
          />
        }
        ListEmptyComponent={<EmptyState icon="car-sport-outline" title="No dispatches" message={tab === 'active' ? 'Create a new dispatch manifest' : 'No completed dispatches'} />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={() => setShowCreate(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      <CreateManifestModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        companyId={company?.id ?? ''}
      />
    </View>
  );
}

function CreateManifestModal({ visible, onClose, companyId }: { visible: boolean; onClose: () => void; companyId: string }) {
  const { primaryColor } = useStore();
  const { data: shipments } = useShipments('pending');
  const { data: drivers } = useDrivers();
  const { data: vehicles } = useVehicles();
  const { data: branches } = useBranches();
  const createManifest = useCreateManifest();

  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [originBranch, setOriginBranch] = useState('');
  const [destinationBranch, setDestinationBranch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterSensitive, setFilterSensitive] = useState(false);
  const [filterCold, setFilterCold] = useState(false);
  const [notes, setNotes] = useState('');

  const filteredShipments = useMemo(() => {
    let list: Shipment[] = shipments ?? [];
    if (filterSensitive) list = list.filter(s => s.isSensitive);
    if (filterCold) list = list.filter(s => s.isColdChain);
    if (destinationBranch) list = list.filter(s => s.destinationBranch === destinationBranch);
    return list;
  }, [shipments, filterSensitive, filterCold, destinationBranch]);

  const toggleShipment = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (!driverId || !vehicleId || selectedIds.length === 0) {
      Alert.alert('Missing Info', 'Select driver, vehicle and at least one shipment.'); return;
    }
    try {
      await createManifest.mutateAsync({
        companyId,
        driverId,
        vehicleId,
        shipmentIds: selectedIds,
        originBranch: originBranch || undefined,
        destinationBranch: destinationBranch || undefined,
        notes: notes || undefined,
      });
      Alert.alert('Success', 'Manifest created successfully!');
      setDriverId(''); setVehicleId(''); setSelectedIds([]); setOriginBranch(''); setDestinationBranch(''); setNotes('');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create manifest.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={modal.container}>
        <View style={modal.header}>
          <Text style={modal.title}>Create Manifest</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
        </View>

        <ScrollView style={modal.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Driver */}
          <Text style={modal.sectionLabel}>Driver *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {(drivers ?? []).filter(d => d.isActive).map(d => (
              <TouchableOpacity
                key={d.id}
                style={[modal.chip, driverId === d.id && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                onPress={() => setDriverId(d.id)}
              >
                <Text style={[modal.chipText, driverId === d.id && { color: '#ffffff' }]}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Vehicle */}
          <Text style={modal.sectionLabel}>Vehicle *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {(vehicles ?? []).filter(v => v.isActive).map(v => (
              <TouchableOpacity
                key={v.id}
                style={[modal.chip, vehicleId === v.id && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                onPress={() => setVehicleId(v.id)}
              >
                <Text style={[modal.chipText, vehicleId === v.id && { color: '#ffffff' }]}>{v.plateNumber}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Destination Filter */}
          <Text style={modal.sectionLabel}>Filter by Destination</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <TouchableOpacity
              style={[modal.chip, !destinationBranch && { backgroundColor: primaryColor, borderColor: primaryColor }]}
              onPress={() => setDestinationBranch('')}
            >
              <Text style={[modal.chipText, !destinationBranch && { color: '#ffffff' }]}>All</Text>
            </TouchableOpacity>
            {(branches ?? []).map(b => (
              <TouchableOpacity
                key={b.id}
                style={[modal.chip, destinationBranch === b.name && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                onPress={() => setDestinationBranch(b.name)}
              >
                <Text style={[modal.chipText, destinationBranch === b.name && { color: '#ffffff' }]}>{b.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Special Filters */}
          <View style={modal.specialRow}>
            <TouchableOpacity
              style={[modal.specialChip, filterSensitive && { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}
              onPress={() => setFilterSensitive(v => !v)}
            >
              <Text style={[modal.specialChipText, filterSensitive && { color: '#d97706' }]}>Sensitive Only</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modal.specialChip, filterCold && { backgroundColor: '#e0f2fe', borderColor: '#06b6d4' }]}
              onPress={() => setFilterCold(v => !v)}
            >
              <Text style={[modal.specialChipText, filterCold && { color: '#0284c7' }]}>Cold Chain Only</Text>
            </TouchableOpacity>
          </View>

          {/* Shipments */}
          <Text style={modal.sectionLabel}>Select Shipments ({selectedIds.length} selected) *</Text>
          {filteredShipments.length === 0 ? (
            <Text style={modal.noShipments}>No pending shipments match filters</Text>
          ) : (
            filteredShipments.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[modal.shipmentRow, selectedIds.includes(s.id) && { backgroundColor: primaryColor + '10', borderColor: primaryColor }]}
                onPress={() => toggleShipment(s.id)}
              >
                <View style={[modal.checkbox, selectedIds.includes(s.id) && { backgroundColor: primaryColor, borderColor: primaryColor }]}>
                  {selectedIds.includes(s.id) && <Ionicons name="checkmark" size={12} color="#ffffff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={modal.shipmentTrack}>{s.trackingNumber}</Text>
                  <Text style={modal.shipmentNames}>{s.senderName} → {s.receiverName}</Text>
                  <Text style={modal.shipmentDest}>{s.destinationBranch}</Text>
                </View>
                {s.isSensitive && <View style={modal.sBadge}><Text style={modal.sBadgeText}>S</Text></View>}
                {s.isColdChain && <View style={[modal.sBadge, { backgroundColor: '#e0f2fe' }]}><Text style={[modal.sBadgeText, { color: '#0284c7' }]}>C</Text></View>}
              </TouchableOpacity>
            ))
          )}

          <Button
            title={`Create Manifest (${selectedIds.length} shipments)`}
            onPress={handleCreate}
            loading={createManifest.isPending}
            fullWidth
            size="lg"
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#ffffff' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll: { padding: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  specialRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  specialChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#ffffff' },
  specialChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  noShipments: { color: '#9ca3af', fontSize: 14, marginBottom: 12 },
  shipmentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#ffffff', marginBottom: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  shipmentTrack: { fontSize: 13, fontWeight: '700', color: '#111827' },
  shipmentNames: { fontSize: 12, color: '#6b7280' },
  shipmentDest: { fontSize: 11, color: '#9ca3af' },
  sBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  sBadgeText: { fontSize: 10, fontWeight: '800', color: '#d97706' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  tabRow: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  manifestNum: { fontSize: 15, fontWeight: '700', color: '#111827' },
  manifestDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  cardGrid: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  gridItem: { flex: 1, gap: 2 },
  gridLabel: { fontSize: 11, color: '#9ca3af' },
  gridValue: { fontSize: 13, fontWeight: '600', color: '#374151' },
  route: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  notes: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
});
