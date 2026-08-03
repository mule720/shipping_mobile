import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useShipmentByTracking } from '../../hooks/useData';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/format';

const STATUS_STEPS = ['pending', 'picked_up', 'in_warehouse', 'in_transit', 'out_for_delivery', 'delivered'];

export function TrackingScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const { data: shipment, isLoading, error } = useShipmentByTracking(query);

  const handleTrack = () => {
    if (input.trim()) setQuery(input.trim().toUpperCase());
  };

  const currentIdx = shipment ? STATUS_STEPS.indexOf(shipment.status) : -1;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Track Shipment</Text>
      <Text style={styles.subheading}>Enter your tracking number to get real-time updates</Text>

      <View style={styles.searchBox}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. SFW-20240101-001"
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={v => setInput(v.toUpperCase())}
            onSubmitEditing={handleTrack}
            returnKeyType="search"
            autoCapitalize="characters"
          />
          {input.length > 0 && (
            <TouchableOpacity onPress={() => { setInput(''); setQuery(''); }}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <Button title="Track" onPress={handleTrack} loading={isLoading} style={styles.trackBtn} />
      </View>

      {query && error && (
        <Card style={styles.notFoundCard} padding={20}>
          <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />
          <Text style={styles.notFoundTitle}>Not Found</Text>
          <Text style={styles.notFoundMsg}>No shipment found for tracking number "{query}"</Text>
        </Card>
      )}

      {shipment && (
        <Card style={styles.resultCard} padding={16}>
          {/* Header */}
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.resultTracking}>{shipment.trackingNumber}</Text>
              <Text style={styles.resultDate}>Created {formatDate(shipment.createdAt)}</Text>
            </View>
            <StatusBadge status={shipment.status} />
          </View>

          {/* Route */}
          <View style={[styles.routeBox, { borderColor: primaryColor + '30' }]}>
            <View style={styles.routeItem}>
              <Ionicons name="radio-button-on" size={16} color={primaryColor} />
              <View>
                <Text style={styles.routeLabel}>From</Text>
                <Text style={styles.routeValue}>{shipment.senderCity}</Text>
                <Text style={styles.routeBranch}>{shipment.originBranch}</Text>
              </View>
            </View>
            <View style={[styles.routeLine, { backgroundColor: primaryColor + '40' }]} />
            <View style={styles.routeItem}>
              <Ionicons name="location" size={16} color="#10b981" />
              <View>
                <Text style={styles.routeLabel}>To</Text>
                <Text style={styles.routeValue}>{shipment.receiverCity}</Text>
                <Text style={styles.routeBranch}>{shipment.destinationBranch}</Text>
              </View>
            </View>
          </View>

          {/* People */}
          <View style={styles.peopleRow}>
            <View style={styles.personBox}>
              <Text style={styles.personLabel}>Sender</Text>
              <Text style={styles.personName}>{shipment.senderName}</Text>
            </View>
            <View style={styles.personBox}>
              <Text style={styles.personLabel}>Receiver</Text>
              <Text style={styles.personName}>{shipment.receiverName}</Text>
            </View>
          </View>

          {shipment.estimatedDelivery && (
            <View style={[styles.etaBox, { backgroundColor: primaryColor + '10' }]}>
              <Ionicons name="calendar-outline" size={16} color={primaryColor} />
              <Text style={[styles.etaText, { color: primaryColor }]}>
                Estimated Delivery: {formatDate(shipment.estimatedDelivery)}
              </Text>
            </View>
          )}

          {/* Timeline */}
          <Text style={styles.timelineTitle}>Tracking History</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((s, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <View key={s} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.dot,
                      done && { backgroundColor: primaryColor, borderColor: primaryColor },
                      active && { width: 18, height: 18, borderRadius: 9 },
                    ]} />
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[styles.line, done && i < currentIdx && { backgroundColor: primaryColor }]} />
                    )}
                  </View>
                  <View style={styles.timelineBody}>
                    <Text style={[styles.timelineStatus, active && { color: primaryColor, fontWeight: '700' }, !done && { color: '#9ca3af' }]}>
                      {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Text>
                    {active && <Text style={styles.timelineCurrent}>Current Status</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {!query && (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={48} color="#d1d5db" />
          <Text style={styles.hintText}>Enter a tracking number above to track your shipment</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, gap: 20 },
  heading: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subheading: { fontSize: 14, color: '#6b7280' },
  searchBox: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1.5, borderColor: '#e5e7eb', paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827', letterSpacing: 1 },
  trackBtn: { alignSelf: 'stretch' },
  notFoundCard: { alignItems: 'center', gap: 8 },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: '#ef4444' },
  notFoundMsg: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  resultCard: {},
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  resultTracking: { fontSize: 18, fontWeight: '800', color: '#111827' },
  resultDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  routeBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, gap: 0, marginBottom: 14 },
  routeItem: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  routeLine: { width: 2, height: 40, marginHorizontal: 4 },
  routeLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },
  routeValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  routeBranch: { fontSize: 11, color: '#6b7280' },
  peopleRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  personBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 10, padding: 10 },
  personLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  personName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  etaBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10, marginBottom: 16 },
  etaText: { fontSize: 13, fontWeight: '600' },
  timelineTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timelineLeft: { alignItems: 'center', width: 20 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#e5e7eb', borderWidth: 2, borderColor: '#d1d5db', marginTop: 2 },
  line: { width: 2, height: 28, backgroundColor: '#e5e7eb' },
  timelineBody: { flex: 1, paddingBottom: 8 },
  timelineStatus: { fontSize: 13, color: '#374151' },
  timelineCurrent: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  hint: { alignItems: 'center', gap: 12, paddingTop: 40 },
  hintText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', maxWidth: 260 },
});
