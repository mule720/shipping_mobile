import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useShipments, useUpdateShipmentStatus } from '../../hooks/useData';
import { graphqlClient } from '../../api/client';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';
import type { Shipment } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const STATUS_FLOW = ['pending', 'picked_up', 'in_warehouse', 'in_transit', 'out_for_delivery', 'delivered'];

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { shipmentId: string } };
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value)}</Text>
    </View>
  );
}

export function ShipmentDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { primaryColor, user } = useStore();
  const { shipmentId } = route.params;
  const { data: shipments, isLoading } = useShipments();
  const updateStatus = useUpdateShipmentStatus();
  const [resending, setResending] = useState(false);

  const shipment: Shipment | undefined = shipments?.find(s => s.id === shipmentId);

  if (!shipment && !isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Shipment" showBack onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.notFound}>Shipment not found.</Text>
        </View>
      </View>
    );
  }

  const canAdvance = shipment && STATUS_FLOW.indexOf(shipment.status) < STATUS_FLOW.length - 1;
  const nextStatus = shipment ? STATUS_FLOW[STATUS_FLOW.indexOf(shipment.status) + 1] : null;

  const handleResendReceipt = async () => {
    if (!shipment) return;
    setResending(true);
    try {
      await graphqlClient.query(
        `mutation SendShipmentReceipt($shipmentId: UUID!) { sendShipmentReceipt(shipmentId: $shipmentId) }`,
        { shipmentId: shipment.id },
      );
      Alert.alert('Receipt Sent', 'The receipt has been resent successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to resend receipt.');
    } finally {
      setResending(false);
    }
  };

  const handleAdvance = () => {
    if (!shipment || !nextStatus) return;
    Alert.alert(
      'Update Status',
      `Move to "${nextStatus.replace(/_/g, ' ')}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => updateStatus.mutate({ id: shipment.id, status: nextStatus }),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Shipment Detail"
        subtitle={shipment?.trackingNumber}
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        {shipment && (
          <Card style={styles.statusCard} padding={16}>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.trackNum}>{shipment.trackingNumber}</Text>
                <Text style={styles.dateText}>{formatDateTime(shipment.createdAt)}</Text>
              </View>
              <StatusBadge status={shipment.status} />
            </View>

            {/* Timeline */}
            <View style={styles.timeline}>
              {STATUS_FLOW.map((s, i) => {
                const currentIdx = STATUS_FLOW.indexOf(shipment.status);
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <View key={s} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        done && { backgroundColor: primaryColor },
                        active && styles.timelineDotActive,
                      ]} />
                      {i < STATUS_FLOW.length - 1 && (
                        <View style={[styles.timelineLine, done && i < currentIdx && { backgroundColor: primaryColor }]} />
                      )}
                    </View>
                    <Text style={[styles.timelineLabel, active && { color: primaryColor, fontWeight: '700' }]}>
                      {s.replace(/_/g, ' ')}
                    </Text>
                  </View>
                );
              })}
            </View>

            {canAdvance && ['company_admin', 'branch_manager', 'dispatch_officer', 'warehouse_officer'].includes(user?.role ?? '') && (
              <Button
                title={`Mark as ${nextStatus?.replace(/_/g, ' ')}`}
                onPress={handleAdvance}
                loading={updateStatus.isPending}
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        )}

        {/* Sender Info */}
        {shipment && (
          <>
            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Sender</Text>
              <InfoRow label="Name" value={shipment.senderName} />
              <InfoRow label="Phone" value={shipment.senderPhone} />
              <InfoRow label="Email" value={shipment.senderEmail} />
              <InfoRow label="Address" value={shipment.senderAddress} />
              <InfoRow label="City" value={shipment.senderCity} />
            </Card>

            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Receiver</Text>
              <InfoRow label="Name" value={shipment.receiverName} />
              <InfoRow label="Phone" value={shipment.receiverPhone} />
              <InfoRow label="Email" value={shipment.recipientEmail} />
              <InfoRow label="Address" value={shipment.receiverAddress} />
              <InfoRow label="City" value={shipment.receiverCity} />
            </Card>

            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Parcel Details</Text>
              <InfoRow label="Description" value={shipment.description} />
              <InfoRow label="Weight" value={`${shipment.weight} kg`} />
              <InfoRow label="Pieces" value={shipment.pieces} />
              <InfoRow label="Origin" value={shipment.originBranch} />
              <InfoRow label="Destination" value={shipment.destinationBranch} />
              {shipment.estimatedDelivery && (
                <InfoRow label="Est. Delivery" value={formatDate(shipment.estimatedDelivery)} />
              )}
              <View style={styles.flagsRow}>
                {shipment.isFragile && <View style={styles.flag}><Text style={styles.flagText}>FRAGILE</Text></View>}
                {shipment.isSensitive && <View style={[styles.flag, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}><Text style={[styles.flagText, { color: '#d97706' }]}>SENSITIVE</Text></View>}
                {shipment.isColdChain && <View style={[styles.flag, { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }]}><Text style={[styles.flagText, { color: '#0284c7' }]}>COLD CHAIN</Text></View>}
                {shipment.isInsured && <View style={[styles.flag, { backgroundColor: '#d1fae5', borderColor: '#a7f3d0' }]}><Text style={[styles.flagText, { color: '#059669' }]}>INSURED</Text></View>}
              </View>
            </Card>

            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Payment</Text>
              <InfoRow label="Type" value={shipment.paymentType.toUpperCase()} />
              <InfoRow label="Shipping Cost" value={formatCurrency(shipment.shippingCost)} />
              {shipment.codAmount && <InfoRow label="COD Amount" value={formatCurrency(shipment.codAmount)} />}
              {shipment.insuranceValue && <InfoRow label="Insurance Value" value={formatCurrency(shipment.insuranceValue)} />}
            </Card>

            {shipment.specialInstructions && (
              <Card style={styles.section} padding={16}>
                <Text style={styles.sectionTitle}>Special Instructions</Text>
                <Text style={styles.instructions}>{shipment.specialInstructions}</Text>
              </Card>
            )}

            {/* Receipt Section */}
            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Receipt</Text>

              {(shipment as any).notificationChannel && (
                <View style={styles.channelRow}>
                  <Ionicons
                    name={
                      (shipment as any).notificationChannel === 'whatsapp'
                        ? 'logo-whatsapp'
                        : (shipment as any).notificationChannel === 'email'
                        ? 'mail-outline'
                        : 'chatbubble-outline'
                    }
                    size={14}
                    color={primaryColor}
                  />
                  <View style={[styles.channelBadge, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '40' }]}>
                    <Text style={[styles.channelBadgeText, { color: primaryColor }]}>
                      {((shipment as any).notificationChannel as string).toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.receiptBtnRow}>
                <TouchableOpacity
                  style={[styles.receiptBtn, { borderColor: primaryColor }]}
                  onPress={handleResendReceipt}
                  activeOpacity={0.7}
                  disabled={resending}
                >
                  {resending
                    ? <ActivityIndicator size="small" color={primaryColor} />
                    : <Ionicons name="send-outline" size={15} color={primaryColor} />
                  }
                  <Text style={[styles.receiptBtnText, { color: primaryColor }]}>Resend Receipt</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.receiptBtn, { borderColor: '#6b7280' }]}
                  onPress={() => navigation.navigate('ReceiptLookup', { trackingNumber: shipment.trackingNumber })}
                  activeOpacity={0.7}
                >
                  <Ionicons name="globe-outline" size={15} color="#6b7280" />
                  <Text style={[styles.receiptBtnText, { color: '#6b7280' }]}>Look Up Online</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, gap: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { color: '#9ca3af', fontSize: 16 },
  statusCard: { marginBottom: 0 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  trackNum: { fontSize: 16, fontWeight: '700', color: '#111827' },
  dateText: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timelineLeft: { alignItems: 'center', width: 20 },
  timelineDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#e5e7eb', borderWidth: 2, borderColor: '#d1d5db',
    marginTop: 2,
  },
  timelineDotActive: { borderWidth: 3 },
  timelineLine: { width: 2, height: 24, backgroundColor: '#e5e7eb' },
  timelineLabel: { fontSize: 13, color: '#6b7280', paddingVertical: 2, flex: 1 },
  section: { marginBottom: 0 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { fontSize: 13, color: '#6b7280' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#111827', maxWidth: '60%', textAlign: 'right' },
  flagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 },
  flag: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  flagText: { fontSize: 10, fontWeight: '700', color: '#ef4444' },
  instructions: { fontSize: 14, color: '#374151', lineHeight: 20 },
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  channelBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  channelBadgeText: { fontSize: 12, fontWeight: '700' },
  receiptBtnRow: { flexDirection: 'row', gap: 10 },
  receiptBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 10, paddingVertical: 10,
  },
  receiptBtnText: { fontSize: 13, fontWeight: '600' },
});
