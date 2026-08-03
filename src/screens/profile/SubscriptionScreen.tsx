import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';

const PLANS = [
  { key: 'starter', label: 'Starter', price: '$49/mo', color: '#10b981', features: ['500 shipments/mo', '2 branches', '5 users', 'Basic reports'] },
  { key: 'professional', label: 'Professional', price: '$149/mo', color: '#4f46e5', features: ['5,000 shipments/mo', '10 branches', '25 users', 'Advanced reports', 'API access'] },
  { key: 'enterprise', label: 'Enterprise', price: '$399/mo', color: '#f59e0b', features: ['Unlimited shipments', 'Unlimited branches', 'Unlimited users', 'White-label', '24/7 support'] },
];

export function SubscriptionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { company, primaryColor } = useStore();
  const currentPlan = company?.subscription || 'starter';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Text style={styles.currentLabel}>Current Plan</Text>
        {PLANS.map(plan => {
          const isActive = plan.key === currentPlan;
          return (
            <Card key={plan.key} style={[styles.planCard, isActive && { borderColor: plan.color, borderWidth: 2 }]} padding={18}>
              <View style={styles.planHeader}>
                <View style={[styles.planBadge, { backgroundColor: plan.color + '20' }]}>
                  <Text style={[styles.planName, { color: plan.color }]}>{plan.label}</Text>
                </View>
                <Text style={styles.planPrice}>{plan.price}</Text>
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: plan.color }]}>
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                )}
              </View>
              {plan.features.map(f => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={plan.color} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </Card>
          );
        })}
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
  currentLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  planCard: { marginBottom: 14 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  planName: { fontSize: 14, fontWeight: '700' },
  planPrice: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  activeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  featureText: { fontSize: 14, color: '#374151' },
});
