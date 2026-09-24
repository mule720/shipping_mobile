import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { ADMIN_PAYOUTS_QUERY, GENERATE_PAYOUT_MUTATION, MARK_PAYOUT_PAID_MUTATION } from '../../api/queries';
import { useStore } from '../../store/useStore';

export function AdminPayoutsScreen() {
  const { primaryColor } = useStore();
  const qc = useQueryClient();
  const [showGenModal, setShowGenModal] = useState(false);
  const [companyId, setCompanyId] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminPayouts'],
    queryFn: () => graphqlClient.query(ADMIN_PAYOUTS_QUERY, {}),
  });

  const generateMutation = useMutation({
    mutationFn: (id: string) => graphqlClient.mutate(GENERATE_PAYOUT_MUTATION, { companyId: id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminPayouts'] }); setShowGenModal(false); Alert.alert('Success', 'Payout generated'); },
    onError: () => Alert.alert('Error', 'Failed to generate payout'),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => graphqlClient.mutate(MARK_PAYOUT_PAID_MUTATION, { payoutId: id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminPayouts'] }); Alert.alert('Success', 'Marked as paid'); },
    onError: () => Alert.alert('Error', 'Failed to update'),
  });

  const payouts: any[] = (data as any)?.adminPayouts ?? [];

  const statusColor = (s: string) => s === 'paid' ? '#10b981' : s === 'pending' ? '#f59e0b' : '#6b7280';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.total}>{payouts.length} payouts</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: primaryColor }]} onPress={() => setShowGenModal(true)}>
          <Ionicons name="add-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Generate</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={payouts}
          keyExtractor={i => i.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.companyName}>{item.company?.name ?? 'Company'}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '20' }]}>
                  <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.amount}>K {Number(item.amount).toFixed(2)}</Text>
              <Text style={styles.period}>{item.periodStart} – {item.periodEnd}</Text>
              {item.status === 'pending' && (
                <TouchableOpacity style={[styles.markBtn, { borderColor: '#10b981' }]} onPress={() =>
                  Alert.alert('Mark Paid', 'Mark this payout as paid?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Mark Paid', onPress: () => markPaidMutation.mutate(item.id) },
                  ])
                }>
                  <Text style={styles.markBtnText}>Mark as Paid</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      <Modal visible={showGenModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Generate Payout</Text>
            <Text style={styles.modalLabel}>Company ID</Text>
            <TextInput style={styles.modalInput} value={companyId} onChangeText={setCompanyId} placeholder="Enter company UUID" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowGenModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: primaryColor }]} onPress={() => generateMutation.mutate(companyId)}>
                <Text style={styles.confirmBtnText}>Generate</Text>
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  total: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  companyName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  amount: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 6 },
  period: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  markBtn: { marginTop: 10, borderWidth: 1.5, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  markBtnText: { fontSize: 14, fontWeight: '600', color: '#10b981' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  confirmBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
