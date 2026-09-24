import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { graphqlClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const SHIPMENT_RECEIPT_PUBLIC_QUERY = `
  query ShipmentReceiptPublic($trackingNumber: String!, $phone: String!) {
    shipmentReceiptPublic(trackingNumber: $trackingNumber, phone: $phone) {
      trackingNumber senderName senderPhone senderAddress
      recipientName recipientPhone recipientAddress
      description weight shippingCost paymentMethod
      status notificationChannel createdAt estimatedDelivery actualDelivery
    }
  }
`;

interface ReceiptData {
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress?: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress?: string;
  description: string;
  weight: number;
  shippingCost: number;
  paymentMethod: string;
  status: string;
  notificationChannel: string;
  createdAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
  route?: { params?: { trackingNumber?: string } };
}

const CHANNEL_LABELS: Record<string, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  email: 'Email',
};

export function ReceiptLookupScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();

  const prefill = route?.params?.trackingNumber ?? '';
  const [trackingNumber, setTrackingNumber] = useState(prefill);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    if (!receipt) return;
    try {
      await Share.share({
        message: `Shipment Receipt\nTracking: ${receipt.trackingNumber}\nFrom: ${receipt.senderName} → ${receipt.recipientName}\nStatus: ${receipt.status}`,
        title: 'Shipment Receipt',
      });
    } catch {
      // user cancelled
    }
  };

  const handleLookup = async () => {
    const tn = trackingNumber.trim().toUpperCase();
    const ph = phone.trim();
    if (!tn || !ph) return;

    setLoading(true);
    setReceipt(null);
    setNotFound(false);
    setError(null);

    try {
      const data = await graphqlClient.query(SHIPMENT_RECEIPT_PUBLIC_QUERY, {
        trackingNumber: tn,
        phone: ph,
      });
      if (data?.shipmentReceiptPublic) {
        setReceipt(data.shipmentReceiptPublic);
      } else {
        setNotFound(true);
      }
    } catch (e: any) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Receipt Lookup" showBack onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card padding={16} style={styles.formCard}>
          <Text style={styles.formTitle}>Look Up Your Receipt</Text>
          <Text style={styles.formDesc}>Enter your tracking number and phone number to retrieve your shipment receipt.</Text>

          <Text style={styles.inputLabel}>Tracking Number</Text>
          <View style={styles.inputRow}>
            <Ionicons name="barcode-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. SFW-20240101-001"
              placeholderTextColor="#9ca3af"
              value={trackingNumber}
              onChangeText={v => setTrackingNumber(v.toUpperCase())}
              autoCapitalize="characters"
              returnKeyType="next"
            />
          </View>

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Phone Number</Text>
          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="+260 97X XXX XXX"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="search"
              onSubmitEditing={handleLookup}
            />
          </View>

          <Button
            title="Find Receipt"
            onPress={handleLookup}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: 16 }}
          />
        </Card>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={styles.loadingText}>Searching…</Text>
          </View>
        )}

        {notFound && !loading && (
          <Card padding={20} style={styles.notFoundCard}>
            <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
            <Text style={styles.notFoundTitle}>Not Found</Text>
            <Text style={styles.notFoundMsg}>
              No receipt found. Check your tracking number and phone number and try again.
            </Text>
          </Card>
        )}

        {receipt && !loading && (
          <Card padding={16} style={styles.receiptCard}>
            {/* Header */}
            <View style={styles.receiptHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.receiptTracking}>{receipt.trackingNumber}</Text>
                <Text style={styles.receiptDate}>Booked {formatDate(receipt.createdAt)}</Text>
              </View>
              <StatusBadge status={receipt.status} />
            </View>

            {/* Channel badge */}
            <View style={[styles.channelBadge, { backgroundColor: primaryColor + '15', borderColor: primaryColor + '40' }]}>
              <Ionicons
                name={receipt.notificationChannel === 'whatsapp' ? 'logo-whatsapp' : receipt.notificationChannel === 'email' ? 'mail-outline' : 'chatbubble-outline'}
                size={14}
                color={primaryColor}
              />
              <Text style={[styles.channelBadgeText, { color: primaryColor }]}>
                Receipt sent via {CHANNEL_LABELS[receipt.notificationChannel] ?? receipt.notificationChannel}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Sender */}
            <Text style={styles.sectionTitle}>Sender</Text>
            <InfoRow label="Name" value={receipt.senderName} />
            <InfoRow label="Phone" value={receipt.senderPhone} />
            {receipt.senderAddress ? <InfoRow label="Address" value={receipt.senderAddress} /> : null}

            <View style={styles.divider} />

            {/* Recipient */}
            <Text style={styles.sectionTitle}>Recipient</Text>
            <InfoRow label="Name" value={receipt.recipientName} />
            <InfoRow label="Phone" value={receipt.recipientPhone} />
            {receipt.recipientAddress ? <InfoRow label="Address" value={receipt.recipientAddress} /> : null}

            <View style={styles.divider} />

            {/* Package */}
            <Text style={styles.sectionTitle}>Package</Text>
            <InfoRow label="Description" value={receipt.description} />
            <InfoRow label="Weight" value={`${receipt.weight} kg`} />

            <View style={styles.divider} />

            {/* Cost */}
            <Text style={styles.sectionTitle}>Payment</Text>
            <InfoRow label="Shipping Cost" value={formatCurrency(receipt.shippingCost)} />
            <InfoRow label="Payment Method" value={receipt.paymentMethod?.toUpperCase()} />

            {/* Dates */}
            {receipt.estimatedDelivery && (
              <>
                <View style={styles.divider} />
                <InfoRow label="Est. Delivery" value={formatDate(receipt.estimatedDelivery)} />
              </>
            )}
            {receipt.actualDelivery && (
              <InfoRow label="Delivered" value={formatDate(receipt.actualDelivery)} />
            )}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.75}>
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text style={styles.shareButtonText}>Share Receipt</Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </View>
  );
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, gap: 12 },
  formCard: { marginBottom: 0 },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  formDesc: { fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 18 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827' },
  centered: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  loadingText: { fontSize: 14, color: '#9ca3af' },
  notFoundCard: { alignItems: 'center', gap: 8 },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: '#ef4444' },
  notFoundMsg: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  receiptCard: { marginBottom: 0 },
  receiptHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  receiptTracking: { fontSize: 18, fontWeight: '800', color: '#111827' },
  receiptDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  channelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, marginBottom: 12,
  },
  channelBadgeText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  infoLabel: { fontSize: 13, color: '#6b7280' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#111827', maxWidth: '60%', textAlign: 'right' },
  shareButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#4f46e5', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
  },
  shareButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
