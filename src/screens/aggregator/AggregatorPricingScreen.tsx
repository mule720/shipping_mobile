import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { useStore } from '../../store/useStore';

const MY_PRICING_RULES_QUERY = `
  query MyPricingRules {
    myPricingRules {
      id
      serviceType
      pricingModel
      baseRate
      perKgRate
      perKmRate
      minimumCharge
      maximumCharge
      isActive
    }
  }
`;

const CREATE_PRICING_RULE_MUTATION = `
  mutation CreatePricingRule($serviceType: String!, $pricingModel: String!, $baseRate: Float!, $perKgRate: Float, $perKmRate: Float, $minimumCharge: Float, $maximumCharge: Float) {
    createPricingRule(serviceType: $serviceType, pricingModel: $pricingModel, baseRate: $baseRate, perKgRate: $perKgRate, perKmRate: $perKmRate, minimumCharge: $minimumCharge, maximumCharge: $maximumCharge) {
      id serviceType pricingModel baseRate
    }
  }
`;

const DELETE_PRICING_RULE_MUTATION = `
  mutation DeletePricingRule($ruleId: UUID!) {
    deletePricingRule(ruleId: $ruleId) { ok }
  }
`;

const SERVICE_TYPES = ['pickup', 'last_mile', 'local_delivery', 'intercity'];
const PRICING_MODELS = ['flat', 'per_kg', 'per_km', 'zone_based', 'percentage_value'];

const SERVICE_LABELS: Record<string, string> = {
  pickup: 'Pickup',
  last_mile: 'Last Mile',
  local_delivery: 'Local Delivery',
  intercity: 'Intercity',
};

const MODEL_LABELS: Record<string, string> = {
  flat: 'Flat Rate',
  per_kg: 'Per Kilogram',
  per_km: 'Per Kilometer',
  zone_based: 'Zone Based',
  percentage_value: '% of Value',
};

export function AggregatorPricingScreen() {
  const { primaryColor } = useStore();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    serviceType: 'pickup',
    pricingModel: 'flat',
    baseRate: '',
    perKgRate: '',
    perKmRate: '',
    minimumCharge: '',
    maximumCharge: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myPricingRules'],
    queryFn: () => graphqlClient.query(MY_PRICING_RULES_QUERY, {}),
  });

  const createMutation = useMutation({
    mutationFn: () => graphqlClient.mutate(CREATE_PRICING_RULE_MUTATION, {
      serviceType: form.serviceType,
      pricingModel: form.pricingModel,
      baseRate: parseFloat(form.baseRate) || 0,
      perKgRate: form.perKgRate ? parseFloat(form.perKgRate) : null,
      perKmRate: form.perKmRate ? parseFloat(form.perKmRate) : null,
      minimumCharge: form.minimumCharge ? parseFloat(form.minimumCharge) : null,
      maximumCharge: form.maximumCharge ? parseFloat(form.maximumCharge) : null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myPricingRules'] });
      setShowCreate(false);
      setForm({ serviceType: 'pickup', pricingModel: 'flat', baseRate: '', perKgRate: '', perKmRate: '', minimumCharge: '', maximumCharge: '' });
    },
    onError: () => Alert.alert('Error', 'Failed to create pricing rule'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => graphqlClient.mutate(DELETE_PRICING_RULE_MUTATION, { ruleId: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myPricingRules'] }),
    onError: () => Alert.alert('Error', 'Failed to delete rule'),
  });

  const rules: any[] = (data as any)?.myPricingRules ?? [];

  const needsKg = form.pricingModel === 'per_kg';
  const needsKm = form.pricingModel === 'per_km';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.count}>{rules.length} pricing rules</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: primaryColor }]} onPress={() => setShowCreate(true)}>
          <Ionicons name="add-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add Rule</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={rules}
          keyExtractor={i => i.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="pricetag-outline" size={40} color="#d1d5db" />
              <Text style={styles.emptyText}>No pricing rules yet</Text>
              <Text style={styles.emptySub}>Add rules to define how you charge for your services</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardLabels}>
                  <View style={[styles.serviceChip, { backgroundColor: primaryColor + '20' }]}>
                    <Text style={[styles.serviceChipText, { color: primaryColor }]}>{SERVICE_LABELS[item.serviceType] ?? item.serviceType}</Text>
                  </View>
                  <View style={styles.modelChip}>
                    <Text style={styles.modelChipText}>{MODEL_LABELS[item.pricingModel] ?? item.pricingModel}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Delete Rule', 'Remove this pricing rule?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                ])}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.ratesRow}>
                <View style={styles.rate}>
                  <Text style={styles.rateValue}>K {Number(item.baseRate).toFixed(2)}</Text>
                  <Text style={styles.rateLabel}>Base Rate</Text>
                </View>
                {item.perKgRate != null && (
                  <View style={styles.rate}>
                    <Text style={styles.rateValue}>K {Number(item.perKgRate).toFixed(2)}</Text>
                    <Text style={styles.rateLabel}>Per kg</Text>
                  </View>
                )}
                {item.perKmRate != null && (
                  <View style={styles.rate}>
                    <Text style={styles.rateValue}>K {Number(item.perKmRate).toFixed(2)}</Text>
                    <Text style={styles.rateLabel}>Per km</Text>
                  </View>
                )}
                {item.minimumCharge != null && (
                  <View style={styles.rate}>
                    <Text style={styles.rateValue}>K {Number(item.minimumCharge).toFixed(2)}</Text>
                    <Text style={styles.rateLabel}>Min</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView style={styles.modal} contentContainerStyle={{ padding: 24 }}>
            <Text style={styles.modalTitle}>New Pricing Rule</Text>

            <Text style={styles.label}>Service Type</Text>
            <View style={styles.chipRow}>
              {SERVICE_TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.chip, form.serviceType === t && { backgroundColor: primaryColor }]} onPress={() => setForm(p => ({ ...p, serviceType: t }))}>
                  <Text style={[styles.chipText, form.serviceType === t && { color: '#fff' }]}>{SERVICE_LABELS[t]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Pricing Model</Text>
            <View style={styles.chipRow}>
              {PRICING_MODELS.map(m => (
                <TouchableOpacity key={m} style={[styles.chip, form.pricingModel === m && { backgroundColor: primaryColor }]} onPress={() => setForm(p => ({ ...p, pricingModel: m }))}>
                  <Text style={[styles.chipText, form.pricingModel === m && { color: '#fff' }]}>{MODEL_LABELS[m]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Base Rate (K)</Text>
            <TextInput style={styles.input} value={form.baseRate} onChangeText={v => setForm(p => ({ ...p, baseRate: v }))} keyboardType="numeric" placeholder="0.00" />

            {needsKg && (
              <>
                <Text style={styles.label}>Per kg Rate (K)</Text>
                <TextInput style={styles.input} value={form.perKgRate} onChangeText={v => setForm(p => ({ ...p, perKgRate: v }))} keyboardType="numeric" placeholder="0.00" />
              </>
            )}

            {needsKm && (
              <>
                <Text style={styles.label}>Per km Rate (K)</Text>
                <TextInput style={styles.input} value={form.perKmRate} onChangeText={v => setForm(p => ({ ...p, perKmRate: v }))} keyboardType="numeric" placeholder="0.00" />
              </>
            )}

            <Text style={styles.label}>Minimum Charge (K, optional)</Text>
            <TextInput style={styles.input} value={form.minimumCharge} onChangeText={v => setForm(p => ({ ...p, minimumCharge: v }))} keyboardType="numeric" placeholder="0.00" />

            <Text style={styles.label}>Maximum Charge (K, optional)</Text>
            <TextInput style={styles.input} value={form.maximumCharge} onChangeText={v => setForm(p => ({ ...p, maximumCharge: v }))} keyboardType="numeric" placeholder="Leave blank for no limit" />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: primaryColor }]} onPress={() => createMutation.mutate()}>
                {createMutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.confirmBtnText}>Create Rule</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLabels: { flexDirection: 'row', gap: 8 },
  serviceChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  serviceChipText: { fontSize: 12, fontWeight: '700' },
  modelChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: '#f3f4f6' },
  modelChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  ratesRow: { flexDirection: 'row', gap: 20 },
  rate: { alignItems: 'center' },
  rateValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  rateLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#9ca3af', marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 8 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  confirmBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
