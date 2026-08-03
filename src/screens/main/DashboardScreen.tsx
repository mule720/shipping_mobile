import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useDashboardStats, useShipments } from '../../hooks/useData';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Shipment } from '../../types';

const KPI_CARDS = [
  { key: 'totalShipments', label: 'Total Shipments', icon: 'cube-outline' as const, color: '#4f46e5' },
  { key: 'pendingShipments', label: 'Pending', icon: 'time-outline' as const, color: '#f59e0b' },
  { key: 'totalRevenue', label: 'Revenue', icon: 'cash-outline' as const, color: '#10b981', isCurrency: true },
  { key: 'deliveredShipments', label: 'Delivered', icon: 'checkmark-circle-outline' as const, color: '#06b6d4' },
];

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, company, primaryColor } = useStore();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: shipments, isLoading: shipmentsLoading, refetch: refetchShipments } = useShipments();

  const recentShipments: Shipment[] = (shipments ?? []).slice(0, 5);
  const isRefreshing = statsLoading || shipmentsLoading;

  const onRefresh = () => {
    refetchStats();
    refetchShipments();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={primaryColor} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <View style={[styles.banner, { backgroundColor: primaryColor, paddingTop: insets.top + 16 }]}>
        <View style={styles.bannerRow}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
            <Text style={styles.companyName}>{company?.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {KPI_CARDS.map(card => {
            const value = stats?.[card.key as keyof typeof stats];
            return (
              <Card key={card.key} style={styles.kpiCard} padding={14}>
                <View style={[styles.kpiIcon, { backgroundColor: card.color + '15' }]}>
                  <Ionicons name={card.icon} size={20} color={card.color} />
                </View>
                <Text style={styles.kpiValue}>
                  {statsLoading ? '—' : card.isCurrency ? formatCurrency(Number(value ?? 0)) : String(value ?? 0)}
                </Text>
                <Text style={styles.kpiLabel}>{card.label}</Text>
              </Card>
            );
          })}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            { label: 'New Shipment', icon: 'add-circle-outline' as const, tab: 'Shipments', screen: 'CreateShipment' },
            { label: 'Track', icon: 'search-outline' as const, tab: 'Shipments', screen: 'Tracking' },
            { label: 'Dispatch', icon: 'car-sport-outline' as const, tab: 'Operations', screen: null },
            { label: 'Finance', icon: 'wallet-outline' as const, tab: 'Business', screen: null },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickBtn, { borderColor: primaryColor + '30' }]}
              onPress={() => {
                if (action.screen) navigation.navigate(action.screen as any);
                else navigation.navigate(action.tab as any);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: primaryColor + '15' }]}>
                <Ionicons name={action.icon} size={22} color={primaryColor} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Shipments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Shipments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Shipments')}>
            <Text style={[styles.seeAll, { color: primaryColor }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentShipments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No shipments yet</Text>
          </Card>
        ) : (
          recentShipments.map(s => (
            <TouchableOpacity
              key={s.id}
              onPress={() => navigation.navigate('ShipmentDetail', { shipmentId: s.id })}
              activeOpacity={0.8}
            >
              <Card style={styles.shipmentCard} padding={14}>
                <View style={styles.shipmentRow}>
                  <View style={styles.shipmentLeft}>
                    <Text style={styles.trackingNum}>{s.trackingNumber}</Text>
                    <Text style={styles.shipmentRoute}>
                      {s.originBranch} → {s.destinationBranch}
                    </Text>
                    <Text style={styles.shipmentMeta}>{formatDate(s.createdAt)}</Text>
                  </View>
                  <View style={styles.shipmentRight}>
                    <StatusBadge status={s.status} small />
                    <Text style={styles.shipmentCost}>{formatCurrency(s.shippingCost)}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  banner: { paddingHorizontal: 20, paddingBottom: 28 },
  bannerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginTop: 2 },
  companyName: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: 16, marginTop: -16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  kpiCard: { width: '47%', borderRadius: 16 },
  kpiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 2 },
  kpiLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: '#9ca3af', fontSize: 14 },
  shipmentCard: { marginBottom: 10 },
  shipmentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  shipmentLeft: { flex: 1, marginRight: 12 },
  trackingNum: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  shipmentRoute: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  shipmentMeta: { fontSize: 11, color: '#9ca3af' },
  shipmentRight: { alignItems: 'flex-end', gap: 6 },
  shipmentCost: { fontSize: 13, fontWeight: '700', color: '#111827' },
});
