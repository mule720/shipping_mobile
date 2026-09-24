import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { ADMIN_SUBSCRIPTIONS_QUERY, CREATE_SUBSCRIPTION_PLAN_MUTATION, UPDATE_SUBSCRIPTION_PLAN_MUTATION } from '../../api/queries';
import { useStore } from '../../store/useStore';

export function AdminSubscriptionsScreen() {
  const { primaryColor } = useStore();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', price: '', maxShipments: '', maxUsers: '', features: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: () => graphqlClient.query(ADMIN_SUBSCRIPTIONS_QUERY, {}),
  });

  const createMutation = useMutation({
    mutationFn: () => graphqlClient.mutate(CREATE_SUBSCRIPTION_PLAN_MUTATION, {
      name: form.name, price: parseFloat(form.price), maxShipments: parseInt(form.maxShipments),
      maxUsers: parseInt(form.maxUsers), features: form.features.split(',').map(f => f.trim()),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminSubscriptions'] }); setShowCreate(false); setForm({ name: '', price: '', maxShipments: '', maxUsers: '', features: '' }); },
    onError: () => Alert.alert('Error', 'Failed to create plan'),
  });

  const updateMutation = useMutation({
    mutationFn: () => graphqlClient.mutate(UPDATE_SUBSCRIPTION_PLAN_MUTATION, {
      planId: editing?.id, name: form.name, price: parseFloat(form.price),
      maxShipments: parseInt(form.maxShipments), maxUsers: parseInt(form.maxUsers),
      features: form.features.split(',').map(f => f.trim()),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminSubscriptions'] }); setEditing(null); },
    onError: () => Alert.alert('Error', 'Failed to update plan'),
  });

  const plans: any[] = (data as any)?.adminSubscriptionPlans ?? [];

  const openEdit = (plan: any) => {
    setForm({ name: plan.name, price: String(plan.price), maxShipments: String(plan.maxShipments ?? ''), maxUsers: String(plan.maxUsers ?? ''), features: (plan.features ?? []).join(', ') });
    setEditing(plan);
  };

  const ModalContent = ({ isEdit }: { isEdit: boolean }) => (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>{isEdit ? 'Edit Plan' : 'New Plan'}</Text>
        {(['name', 'price', 'maxShipments', 'maxUsers'] as const).map(f => (
          <TextInput key={f} style={styles.input} placeholder={f} value={form[f]} onChangeText={v => setForm(p => ({ ...p, [f]: v }))}
            keyboardType={f !== 'name' ? 'numeric' : 'default'} />
        ))}
        <TextInput style={styles.input} placeholder="Features (comma-separated)" value={form.features} onChangeText={v => setForm(p => ({ ...p, features: v }))} />
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => isEdit ? setEditing(null) : setShowCreate(false)}><Text>Cancel</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: primaryColor }]} onPress={() => isEdit ? updateMutation.mutate() : createMutation.mutate()}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{isEdit ? 'Update' : 'Create'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.count}>{plans.length} plans</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: primaryColor }]} onPress={() => setShowCreate(true)}>
          <Ionicons name="add-outline" size={18} color="#fff" /><Text style={styles.addBtnText}>New Plan</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={plans}
          keyExtractor={i => i.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.planName}>{item.name}</Text>
                <TouchableOpacity onPress={() => openEdit(item)}>
                  <Ionicons name="pencil-outline" size={18} color={primaryColor} />
                </TouchableOpacity>
              </View>
              <Text style={styles.price}>K {Number(item.price).toFixed(2)} / mo</Text>
              <View style={styles.limits}>
                <Text style={styles.limit}><Ionicons name="cube-outline" size={12} /> {item.maxShipments ?? '∞'} shipments</Text>
                <Text style={styles.limit}><Ionicons name="people-outline" size={12} /> {item.maxUsers ?? '∞'} users</Text>
                <Text style={styles.limit}><Ionicons name="people-outline" size={12} /> {item.activeCompanies ?? 0} companies</Text>
              </View>
              {item.features?.length > 0 && (
                <View style={styles.featureList}>
                  {item.features.map((f: string, i: number) => (
                    <View key={i} style={styles.feature}>
                      <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      )}

      <Modal visible={showCreate} transparent animationType="slide"><ModalContent isEdit={false} /></Modal>
      <Modal visible={!!editing} transparent animationType="slide"><ModalContent isEdit={true} /></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  count: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  price: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 6 },
  limits: { flexDirection: 'row', gap: 16, marginTop: 8 },
  limit: { fontSize: 12, color: '#6b7280' },
  featureList: { marginTop: 10, gap: 4 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { fontSize: 13, color: '#374151' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  confirmBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
});
