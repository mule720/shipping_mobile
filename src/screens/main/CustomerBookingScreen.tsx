import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphqlClient } from '../../api/client';
import { useStore } from '../../store/useStore';
import { NotificationChannelSelector } from '../../components/NotificationChannelSelector';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const BOOK_SHIPMENT_MUTATION = `
  mutation BookShipment(
    $serviceType: String!
    $senderName: String! $senderPhone: String! $senderAddress: String!
    $recipientName: String! $recipientPhone: String! $recipientAddress: String!
    $originCity: String! $destinationCity: String!
    $weightKg: Float $declaredValue: Float
    $paymentMethod: String! $notes: String
    $notificationChannel: String
  ) {
    bookShipment(
      serviceType: $serviceType
      senderName: $senderName senderPhone: $senderPhone senderAddress: $senderAddress
      recipientName: $recipientName recipientPhone: $recipientPhone recipientAddress: $recipientAddress
      originCity: $originCity destinationCity: $destinationCity
      weightKg: $weightKg declaredValue: $declaredValue
      paymentMethod: $paymentMethod notes: $notes
      notificationChannel: $notificationChannel
    ) {
      id trackingNumber estimatedCost status
    }
  }
`;

const ZAMBIAN_CITIES = [
  'Lusaka', 'Kitwe', 'Ndola', 'Livingstone', 'Kabwe', 'Chipata',
  'Solwezi', 'Mansa', 'Mongu', 'Kasama', 'Chingola', 'Mufulira',
];

const SERVICE_TYPES = [
  { value: 'standard', label: 'Standard', desc: 'Regular delivery, 2-5 days', icon: 'cube-outline', price: 'From K 50' },
  { value: 'express', label: 'Express', desc: 'Next business day', icon: 'flash-outline', price: 'From K 120' },
  { value: 'same_day', label: 'Same Day', desc: 'Delivery within hours', icon: 'rocket-outline', price: 'From K 200' },
];

const PAYMENT_METHODS = [
  { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: 'cash-outline' },
  { value: 'mobile_money', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  { value: 'prepaid', label: 'Prepaid (Pay Now)', icon: 'card-outline' },
];

const STEPS = ['Service', 'Details', 'Review', 'Done'];

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export function CustomerBookingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({
    serviceType: 'standard',
    senderName: '', senderPhone: '', senderAddress: '',
    recipientName: '', recipientPhone: '', recipientAddress: '',
    originCity: 'Lusaka', destinationCity: 'Ndola',
    weightKg: '', declaredValue: '',
    paymentMethod: 'cash_on_delivery',
    notes: '',
  });
  const [confirmed, setConfirmed] = useState<any>(null);
  const [notifChannel, setNotifChannel] = useState('sms');

  const bookMutation = useMutation({
    mutationFn: () => graphqlClient.mutate(BOOK_SHIPMENT_MUTATION, {
      serviceType: booking.serviceType,
      senderName: booking.senderName, senderPhone: booking.senderPhone, senderAddress: booking.senderAddress,
      recipientName: booking.recipientName, recipientPhone: booking.recipientPhone, recipientAddress: booking.recipientAddress,
      originCity: booking.originCity, destinationCity: booking.destinationCity,
      weightKg: booking.weightKg ? parseFloat(booking.weightKg) : null,
      declaredValue: booking.declaredValue ? parseFloat(booking.declaredValue) : null,
      paymentMethod: booking.paymentMethod,
      notes: booking.notes || null,
      notificationChannel: notifChannel,
    }),
    onSuccess: (data: any) => {
      setConfirmed(data?.bookShipment);
      setStep(3);
    },
    onError: () => Alert.alert('Error', 'Booking failed. Please try again.'),
  });

  const set = (field: string, value: string) => setBooking(p => ({ ...p, [field]: value }));

  const canProceed = () => {
    if (step === 0) return !!booking.serviceType;
    if (step === 1) return booking.senderName && booking.senderPhone && booking.recipientName && booking.recipientPhone && booking.originCity && booking.destinationCity;
    return true;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => step > 0 && step < 3 ? setStep(p => p - 1) : navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Shipment</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepWrap}>
              <View style={[styles.stepDot, { backgroundColor: i <= step ? primaryColor : '#e5e7eb' }]}>
                {i < step ? (
                  <Ionicons name="checkmark-outline" size={12} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, { color: i === step ? '#fff' : '#9ca3af' }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, { color: i <= step ? primaryColor : '#9ca3af' }]}>{s}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, { backgroundColor: i < step ? primaryColor : '#e5e7eb' }]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>

        {/* Step 0: Service type */}
        {step === 0 && (
          <>
            <Text style={styles.stepTitle}>Choose Service</Text>
            {SERVICE_TYPES.map(s => (
              <TouchableOpacity
                key={s.value}
                style={[styles.serviceCard, booking.serviceType === s.value && { borderColor: primaryColor, backgroundColor: primaryColor + '08' }]}
                onPress={() => set('serviceType', s.value)}
              >
                <Ionicons name={s.icon as any} size={24} color={booking.serviceType === s.value ? primaryColor : '#9ca3af'} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.serviceLabel, booking.serviceType === s.value && { color: primaryColor }]}>{s.label}</Text>
                  <Text style={styles.serviceDesc}>{s.desc}</Text>
                </View>
                <Text style={[styles.servicePrice, { color: primaryColor }]}>{s.price}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Step 1: Sender & recipient details */}
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>Sender Details</Text>
            <InputField label="Full Name *" value={booking.senderName} onChange={v => set('senderName', v)} placeholder="John Banda" />
            <InputField label="Phone *" value={booking.senderPhone} onChange={v => set('senderPhone', v)} placeholder="0977123456" keyboardType="phone-pad" />
            <InputField label="Pickup Address" value={booking.senderAddress} onChange={v => set('senderAddress', v)} placeholder="Plot 5, Cairo Road" />
            <CityPicker label="Origin City *" value={booking.originCity} onChange={v => set('originCity', v)} />

            <Text style={[styles.stepTitle, { marginTop: 20 }]}>Recipient Details</Text>
            <InputField label="Full Name *" value={booking.recipientName} onChange={v => set('recipientName', v)} placeholder="Jane Mwale" />
            <InputField label="Phone *" value={booking.recipientPhone} onChange={v => set('recipientPhone', v)} placeholder="0966987654" keyboardType="phone-pad" />
            <InputField label="Delivery Address" value={booking.recipientAddress} onChange={v => set('recipientAddress', v)} placeholder="House 12, Independence Ave" />
            <CityPicker label="Destination City *" value={booking.destinationCity} onChange={v => set('destinationCity', v)} />

            <Text style={[styles.stepTitle, { marginTop: 20 }]}>Package Info</Text>
            <InputField label="Weight (kg)" value={booking.weightKg} onChange={v => set('weightKg', v)} placeholder="2.5" keyboardType="numeric" />
            <InputField label="Declared Value (K)" value={booking.declaredValue} onChange={v => set('declaredValue', v)} placeholder="500" keyboardType="numeric" />

            <Text style={[styles.stepTitle, { marginTop: 20 }]}>Payment Method</Text>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity
                key={m.value}
                style={[styles.payCard, booking.paymentMethod === m.value && { borderColor: primaryColor }]}
                onPress={() => set('paymentMethod', m.value)}
              >
                <Ionicons name={m.icon as any} size={20} color={booking.paymentMethod === m.value ? primaryColor : '#9ca3af'} />
                <Text style={[styles.payLabel, booking.paymentMethod === m.value && { color: primaryColor }]}>{m.label}</Text>
                {booking.paymentMethod === m.value && <Ionicons name="checkmark-circle" size={18} color={primaryColor} />}
              </TouchableOpacity>
            ))}

            <InputField label="Notes (optional)" value={booking.notes} onChange={v => set('notes', v)} placeholder="Fragile, handle with care…" multiline />

            <Text style={[styles.stepTitle, { marginTop: 20 }]}>Receipt Notification</Text>
            <NotificationChannelSelector value={notifChannel} onChange={setNotifChannel} primaryColor={primaryColor} />
          </>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Review Your Booking</Text>
            <View style={styles.reviewCard}>
              <ReviewRow icon="flash-outline" label="Service" value={SERVICE_TYPES.find(s => s.value === booking.serviceType)?.label ?? booking.serviceType} />
              <ReviewRow icon="radio-button-on-outline" label="From" value={`${booking.originCity} — ${booking.senderName}`} />
              <ReviewRow icon="location-outline" label="To" value={`${booking.destinationCity} — ${booking.recipientName}`} />
              {booking.weightKg && <ReviewRow icon="cube-outline" label="Weight" value={`${booking.weightKg} kg`} />}
              <ReviewRow icon="cash-outline" label="Payment" value={PAYMENT_METHODS.find(m => m.value === booking.paymentMethod)?.label ?? booking.paymentMethod} />
            </View>
          </>
        )}

        {/* Step 3: Done */}
        {step === 3 && confirmed && (
          <View style={styles.doneWrap}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            <Text style={styles.doneTitle}>Booking Confirmed!</Text>
            <Text style={styles.doneTrack}>Tracking #: {confirmed.trackingNumber}</Text>
            <Text style={styles.doneEst}>Estimated cost: K {Number(confirmed.estimatedCost ?? 0).toFixed(2)}</Text>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: primaryColor }]} onPress={() => navigation.goBack()}>
              <Text style={styles.doneBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      {step < 3 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: canProceed() ? primaryColor : '#e5e7eb' }]}
            onPress={() => {
              if (!canProceed()) return;
              if (step === 2) bookMutation.mutate();
              else setStep(p => p + 1);
            }}
            disabled={!canProceed() || bookMutation.isPending}
          >
            {bookMutation.isPending ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={[styles.nextBtnText, { color: canProceed() ? '#fff' : '#9ca3af' }]}>
                  {step === 2 ? 'Confirm Booking' : 'Continue'}
                </Text>
                <Ionicons name="arrow-forward-outline" size={18} color={canProceed() ? '#fff' : '#9ca3af'} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function InputField({ label, value, onChange, placeholder, keyboardType, multiline }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={[inputStyles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
      />
    </View>
  );
}

function CityPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={inputStyles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {ZAMBIAN_CITIES.map(c => (
            <TouchableOpacity key={c} style={[inputStyles.cityChip, value === c && { backgroundColor: '#4f46e5', borderColor: '#4f46e5' }]} onPress={() => onChange(c)}>
              <Text style={[inputStyles.cityChipText, value === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ReviewRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={reviewStyles.row}>
      <Ionicons name={icon as any} size={16} color="#9ca3af" />
      <Text style={reviewStyles.label}>{label}</Text>
      <Text style={reviewStyles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  progressRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  stepWrap: { alignItems: 'center', gap: 4 },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 11, fontWeight: '700' },
  stepLabel: { fontSize: 10, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4, marginBottom: 14 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: '#e5e7eb', elevation: 1 },
  serviceLabel: { fontSize: 15, fontWeight: '700', color: '#374151' },
  serviceDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  servicePrice: { fontSize: 13, fontWeight: '700' },
  payCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: '#e5e7eb', elevation: 1 },
  payLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  reviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 1 },
  doneWrap: { alignItems: 'center', paddingTop: 40 },
  doneTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginTop: 16 },
  doneTrack: { fontSize: 16, color: '#374151', marginTop: 8, fontWeight: '600' },
  doneEst: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  doneBtn: { marginTop: 32, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 14 },
  nextBtnText: { fontSize: 16, fontWeight: '700' },
});

const inputStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, backgroundColor: '#fff', color: '#111827' },
  cityChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  cityChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
});

const reviewStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  label: { width: 70, fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  value: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '600' },
});
