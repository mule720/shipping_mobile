import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useInvoices, usePayments, useFinanceSummary } from '../../hooks/useData';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Invoice, Payment } from '../../types';

type Tab = 'summary' | 'invoices' | 'payments';

export function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [tab, setTab] = useState<Tab>('summary');

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useFinanceSummary();
  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices();
  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments } = usePayments();

  const TABS: [Tab, string, string][] = [
    ['summary', 'Summary', 'analytics-outline'],
    ['invoices', 'Invoices', 'document-text-outline'],
    ['payments', 'Payments', 'cash-outline'],
  ];

  const renderInvoice = ({ item: inv }: { item: Invoice }) => (
    <Card style={styles.card} padding={14}>
      <View style={styles.cardRow}>
        <View style={styles.left}>
          <Text style={styles.invNum}>{inv.invoiceNumber}</Text>
          <Text style={styles.customerName}>{inv.customerName}</Text>
          <Text style={styles.meta}>Issued: {formatDate(inv.issuedAt)}</Text>
          <Text style={styles.meta}>Due: {formatDate(inv.dueDate)}</Text>
        </View>
        <View style={styles.right}>
          <StatusBadge status={inv.status} small />
          <Text style={styles.amount}>{formatCurrency(inv.total ?? inv.amount)}</Text>
        </View>
      </View>
    </Card>
  );

  const renderPayment = ({ item: p }: { item: Payment }) => (
    <Card style={styles.card} padding={14}>
      <View style={styles.cardRow}>
        <View style={styles.left}>
          <Text style={styles.invNum}>{p.trackingNumber}</Text>
          <Text style={styles.meta}>{p.type.toUpperCase()} · {p.status}</Text>
          {p.collectedAt && <Text style={styles.meta}>Collected: {formatDate(p.collectedAt)}</Text>}
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: '#10b981' }]}>{formatCurrency(p.amount)}</Text>
          <View style={[styles.payStatus, { backgroundColor: p.status === 'collected' ? '#d1fae5' : '#fef3c7' }]}>
            <Text style={[styles.payStatusText, { color: p.status === 'collected' ? '#059669' : '#d97706' }]}>
              {p.status}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map(([key, label, icon]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && { borderBottomColor: primaryColor }]}
            onPress={() => setTab(key)}
          >
            <Ionicons name={icon as any} size={16} color={tab === key ? primaryColor : '#9ca3af'} />
            <Text style={[styles.tabText, tab === key && { color: primaryColor, fontWeight: '700' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Tab */}
      {tab === 'summary' && (
        <View style={styles.summaryContent}>
          {summaryLoading ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : (
            <View style={styles.summaryGrid}>
              {[
                { label: 'Total Revenue', value: formatCurrency(summary?.totalRevenue ?? 0), icon: 'trending-up-outline', color: '#10b981' },
                { label: 'Pending Amount', value: formatCurrency(summary?.pendingAmount ?? 0), icon: 'time-outline', color: '#f59e0b' },
                { label: 'Collected', value: formatCurrency(summary?.collectedAmount ?? 0), icon: 'checkmark-circle-outline', color: '#4f46e5' },
                { label: 'COD Pending', value: formatCurrency(summary?.codPending ?? 0), icon: 'cash-outline', color: '#ef4444' },
              ].map(item => (
                <Card key={item.label} style={styles.summaryCard} padding={16}>
                  <View style={[styles.summaryIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                </Card>
              ))}
            </View>
          )}

          {/* Monthly Revenue mini chart placeholder */}
          {summary?.monthlyRevenue && (
            <Card style={styles.monthlyCard} padding={16}>
              <Text style={styles.monthlyTitle}>Monthly Revenue</Text>
              <Text style={styles.monthlyValue}>{formatCurrency(summary.monthlyRevenue)}</Text>
              <Text style={styles.monthlyMeta}>This month</Text>
            </Card>
          )}
        </View>
      )}

      {/* Invoices Tab */}
      {tab === 'invoices' && (
        <FlatList
          data={invoices as Invoice[]}
          keyExtractor={item => item.id}
          renderItem={renderInvoice}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          refreshControl={<RefreshControl refreshing={invoicesLoading} onRefresh={refetchInvoices} tintColor={primaryColor} />}
          ListEmptyComponent={<EmptyState icon="document-text-outline" title="No invoices" />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <FlatList
          data={payments as Payment[]}
          keyExtractor={item => item.id}
          renderItem={renderPayment}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          refreshControl={<RefreshControl refreshing={paymentsLoading} onRefresh={refetchPayments} tintColor={primaryColor} />}
          ListEmptyComponent={<EmptyState icon="cash-outline" title="No payments" />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  tabBar: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  summaryContent: { padding: 16 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryCard: { width: '47%', borderRadius: 16 },
  summaryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 2 },
  summaryLabel: { fontSize: 12, color: '#6b7280' },
  monthlyCard: { marginTop: 12 },
  monthlyTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  monthlyValue: { fontSize: 28, fontWeight: '800', color: '#4f46e5', marginBottom: 2 },
  monthlyMeta: { fontSize: 12, color: '#9ca3af' },
  loading: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
  list: { padding: 16, gap: 10 },
  card: { marginBottom: 0 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flex: 1, marginRight: 10 },
  right: { alignItems: 'flex-end', gap: 6 },
  invNum: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  customerName: { fontSize: 13, color: '#374151', marginBottom: 2 },
  meta: { fontSize: 11, color: '#9ca3af', marginBottom: 1 },
  amount: { fontSize: 15, fontWeight: '800', color: '#111827' },
  payStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  payStatusText: { fontSize: 11, fontWeight: '700' },
});
