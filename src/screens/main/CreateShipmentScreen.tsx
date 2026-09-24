import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useCreateShipment, useBranches } from '../../hooks/useData';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { ZAMBIAN_CITIES, PAYMENT_TYPES } from '../../constants/config';
import { NotificationChannelSelector } from '../../components/NotificationChannelSelector';
import { graphqlClient } from '../../api/client';
import { MY_NOTIFICATION_PREFERENCES_QUERY } from '../../api/queries';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

type Step = 1 | 2 | 3;

interface FormData {
  senderName: string; senderPhone: string; senderAddress: string; senderCity: string; senderEmail: string;
  receiverName: string; receiverPhone: string; receiverAddress: string; receiverCity: string; recipientEmail: string;
  description: string; weight: string; pieces: string;
  paymentType: string; shippingCost: string; codAmount: string;
  originBranch: string; destinationBranch: string;
  isFragile: boolean; isSensitive: boolean; isColdChain: boolean; isInsured: boolean; insuranceValue: string;
  specialInstructions: string;
}

const INITIAL: FormData = {
  senderName: '', senderPhone: '', senderAddress: '', senderCity: '', senderEmail: '',
  receiverName: '', receiverPhone: '', receiverAddress: '', receiverCity: '', recipientEmail: '',
  description: '', weight: '', pieces: '1',
  paymentType: 'prepaid', shippingCost: '', codAmount: '',
  originBranch: '', destinationBranch: '',
  isFragile: false, isSensitive: false, isColdChain: false, isInsured: false, insuranceValue: '',
  specialInstructions: '',
};

function Picker({
  label, value, options, onChange, required,
}: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; required?: boolean }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <View style={pickerStyles.wrap}>
      <Text style={pickerStyles.label}>{label}{required && <Text style={{ color: '#ef4444' }}> *</Text>}</Text>
      <TouchableOpacity style={pickerStyles.trigger} onPress={() => setOpen(o => !o)}>
        <Text style={[pickerStyles.triggerText, !selected && pickerStyles.placeholder]}>
          {selected?.label ?? `Select ${label}`}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#9ca3af" />
      </TouchableOpacity>
      {open && (
        <View style={pickerStyles.dropdown}>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
            {options.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[pickerStyles.option, opt.value === value && pickerStyles.optionSelected]}
                onPress={() => { onChange(opt.value); setOpen(false); }}
              >
                <Text style={[pickerStyles.optionText, opt.value === value && { color: '#4f46e5', fontWeight: '700' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  placeholder: { color: '#9ca3af' },
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 12,
  },
  triggerText: { fontSize: 15, color: '#111827' },
  dropdown: {
    backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 12, marginTop: 4, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
    zIndex: 100,
  },
  option: { padding: 12 },
  optionSelected: { backgroundColor: '#eef2ff' },
  optionText: { fontSize: 14, color: '#374151' },
});

export function CreateShipmentScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { company, primaryColor } = useStore();
  const { data: branches } = useBranches();
  const createMutation = useCreateShipment();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [notifChannel, setNotifChannel] = useState('sms');

  useEffect(() => {
    graphqlClient.query(MY_NOTIFICATION_PREFERENCES_QUERY)
      .then((data: any) => {
        if (data?.myNotificationPreferences?.preferredReceiptChannel) {
          setNotifChannel(data.myNotificationPreferences.preferredReceiptChannel);
        }
      })
      .catch(() => {}); // silently ignore — default to sms
  }, []);

  const cityOptions = ZAMBIAN_CITIES.map(c => ({ value: c, label: c }));
  const branchOptions = (branches ?? []).map(b => ({ value: b.name, label: b.name }));

  const set = (key: keyof FormData, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const validateStep1 = () => {
    if (!form.senderName || !form.senderPhone || !form.senderCity) {
      Alert.alert('Missing Info', 'Please fill sender name, phone and city.'); return false;
    }
    if (!form.receiverName || !form.receiverPhone || !form.receiverCity) {
      Alert.alert('Missing Info', 'Please fill receiver name, phone and city.'); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.description || !form.weight) {
      Alert.alert('Missing Info', 'Please fill description and weight.'); return false;
    }
    if (!form.originBranch || !form.destinationBranch) {
      Alert.alert('Missing Info', 'Please select origin and destination branch.'); return false;
    }
    if (!form.shippingCost) {
      Alert.alert('Missing Info', 'Please enter shipping cost.'); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!company) return;
    try {
      const result = await createMutation.mutateAsync({
        companyId: company.id,
        senderName: form.senderName, senderPhone: form.senderPhone,
        senderAddress: form.senderAddress, senderCity: form.senderCity, senderEmail: form.senderEmail || undefined,
        receiverName: form.receiverName, receiverPhone: form.receiverPhone,
        receiverAddress: form.receiverAddress, receiverCity: form.receiverCity, recipientEmail: form.recipientEmail || undefined,
        description: form.description, weight: parseFloat(form.weight), pieces: parseInt(form.pieces || '1'),
        paymentType: form.paymentType, shippingCost: parseFloat(form.shippingCost),
        codAmount: form.codAmount ? parseFloat(form.codAmount) : undefined,
        originBranch: form.originBranch, destinationBranch: form.destinationBranch,
        isFragile: form.isFragile, isSensitive: form.isSensitive, isColdChain: form.isColdChain, isInsured: form.isInsured,
        insuranceValue: form.insuranceValue ? parseFloat(form.insuranceValue) : undefined,
        specialInstructions: form.specialInstructions || undefined,
        notificationChannel: notifChannel,
      });
      Alert.alert('Success', `Shipment created!\nTracking: ${result.trackingNumber}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create shipment.');
    }
  };

  const ToggleFlag = ({ label, value, onChange, color = '#4f46e5' }: any) => (
    <View style={flagStyles.row}>
      <Text style={flagStyles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#e5e7eb', true: color + '60' }}
        thumbColor={value ? color : '#f4f4f5'}
        ios_backgroundColor="#e5e7eb"
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Create Shipment" showBack onBack={() => navigation.goBack()} />

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {[1, 2, 3].map(s => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, step >= s && { backgroundColor: primaryColor }]}>
              <Text style={[styles.stepNum, step >= s && { color: '#ffffff' }]}>{s}</Text>
            </View>
            <Text style={[styles.stepLabel, step === s && { color: primaryColor }]}>
              {s === 1 ? 'Parties' : s === 2 ? 'Package' : 'Review'}
            </Text>
            {s < 3 && <View style={[styles.stepLine, step > s && { backgroundColor: primaryColor }]} />}
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* STEP 1: Sender & Receiver */}
        {step === 1 && (
          <>
            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Sender Information</Text>
              <Input label="Full Name" value={form.senderName} onChangeText={v => set('senderName', v)} placeholder="John Doe" required leftIcon="person-outline" />
              <Input label="Phone" value={form.senderPhone} onChangeText={v => set('senderPhone', v)} keyboardType="phone-pad" placeholder="+260 97X XXX XXX" required leftIcon="call-outline" />
              <Input label="Email" value={form.senderEmail} onChangeText={v => set('senderEmail', v)} keyboardType="email-address" autoCapitalize="none" placeholder="sender@email.com" leftIcon="mail-outline" />
              <Input label="Address" value={form.senderAddress} onChangeText={v => set('senderAddress', v)} placeholder="Street address" leftIcon="location-outline" />
              <Picker label="City" value={form.senderCity} options={cityOptions} onChange={v => set('senderCity', v)} required />
            </Card>

            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Receiver Information</Text>
              <Input label="Full Name" value={form.receiverName} onChangeText={v => set('receiverName', v)} placeholder="Jane Doe" required leftIcon="person-outline" />
              <Input label="Phone" value={form.receiverPhone} onChangeText={v => set('receiverPhone', v)} keyboardType="phone-pad" placeholder="+260 97X XXX XXX" required leftIcon="call-outline" />
              <Input label="Email" value={form.recipientEmail} onChangeText={v => set('recipientEmail', v)} keyboardType="email-address" autoCapitalize="none" placeholder="receiver@email.com" leftIcon="mail-outline" />
              <Input label="Address" value={form.receiverAddress} onChangeText={v => set('receiverAddress', v)} placeholder="Street address" leftIcon="location-outline" />
              <Picker label="City" value={form.receiverCity} options={cityOptions} onChange={v => set('receiverCity', v)} required />
            </Card>

            <Button title="Next: Package Details →" onPress={() => { if (validateStep1()) setStep(2); }} fullWidth size="lg" />
          </>
        )}

        {/* STEP 2: Package & Logistics */}
        {step === 2 && (
          <>
            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Package Details</Text>
              <Input label="Description" value={form.description} onChangeText={v => set('description', v)} placeholder="Electronics, clothing..." required leftIcon="document-text-outline" />
              <Input label="Weight (kg)" value={form.weight} onChangeText={v => set('weight', v)} keyboardType="decimal-pad" placeholder="0.0" required leftIcon="scale-outline" />
              <Input label="Number of Pieces" value={form.pieces} onChangeText={v => set('pieces', v)} keyboardType="number-pad" placeholder="1" leftIcon="layers-outline" />
            </Card>

            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Route</Text>
              <Picker label="Origin Branch" value={form.originBranch} options={branchOptions} onChange={v => set('originBranch', v)} required />
              <Picker label="Destination Branch" value={form.destinationBranch} options={branchOptions} onChange={v => set('destinationBranch', v)} required />
            </Card>

            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Payment</Text>
              <Picker label="Payment Type" value={form.paymentType} options={PAYMENT_TYPES} onChange={v => set('paymentType', v)} required />
              <Input label="Shipping Cost (ZMW)" value={form.shippingCost} onChangeText={v => set('shippingCost', v)} keyboardType="decimal-pad" placeholder="0.00" required leftIcon="cash-outline" />
              {form.paymentType === 'cod' && (
                <Input label="COD Amount (ZMW)" value={form.codAmount} onChangeText={v => set('codAmount', v)} keyboardType="decimal-pad" placeholder="0.00" leftIcon="cash-outline" />
              )}
              <NotificationChannelSelector value={notifChannel} onChange={setNotifChannel} primaryColor={primaryColor} />
            </Card>

            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Special Handling</Text>
              <ToggleFlag label="Fragile" value={form.isFragile} onChange={(v: boolean) => set('isFragile', v)} color="#ef4444" />
              <ToggleFlag label="Sensitive" value={form.isSensitive} onChange={(v: boolean) => set('isSensitive', v)} color="#f59e0b" />
              <ToggleFlag label="Cold Chain Required" value={form.isColdChain} onChange={(v: boolean) => set('isColdChain', v)} color="#06b6d4" />
              <ToggleFlag label="Insurance" value={form.isInsured} onChange={(v: boolean) => set('isInsured', v)} color="#10b981" />
              {form.isInsured && (
                <Input label="Insurance Value (ZMW)" value={form.insuranceValue} onChangeText={v => set('insuranceValue', v)} keyboardType="decimal-pad" placeholder="0.00" leftIcon="shield-outline" />
              )}
              <Input label="Special Instructions" value={form.specialInstructions} onChangeText={v => set('specialInstructions', v)} placeholder="Handle with care..." multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
            </Card>

            <View style={styles.btnRow}>
              <Button title="← Back" onPress={() => setStep(1)} variant="outline" style={{ flex: 1 }} />
              <Button title="Review →" onPress={() => { if (validateStep2()) setStep(3); }} style={{ flex: 2 }} />
            </View>
          </>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <>
            <Card style={styles.section} padding={16}>
              <Text style={styles.sectionTitle}>Review & Confirm</Text>
              {[
                ['Sender', form.senderName],
                ['Sender City', form.senderCity],
                ['Receiver', form.receiverName],
                ['Receiver City', form.receiverCity],
                ['Description', form.description],
                ['Weight', `${form.weight} kg`],
                ['Pieces', form.pieces],
                ['Origin', form.originBranch],
                ['Destination', form.destinationBranch],
                ['Payment', form.paymentType],
                ['Cost', `ZMW ${form.shippingCost}`],
                ['Receipt via', notifChannel.toUpperCase()],
                ...(form.paymentType === 'cod' ? [['COD Amount', `ZMW ${form.codAmount}`]] : []),
              ].map(([label, value]) => (
                <View key={label} style={reviewStyles.row}>
                  <Text style={reviewStyles.label}>{label}</Text>
                  <Text style={reviewStyles.value}>{value}</Text>
                </View>
              ))}
              <View style={styles.flagsRow}>
                {form.isFragile && <View style={styles.flag}><Text style={styles.flagText}>FRAGILE</Text></View>}
                {form.isSensitive && <View style={[styles.flag, { backgroundColor: '#fef3c7' }]}><Text style={[styles.flagText, { color: '#d97706' }]}>SENSITIVE</Text></View>}
                {form.isColdChain && <View style={[styles.flag, { backgroundColor: '#e0f2fe' }]}><Text style={[styles.flagText, { color: '#0284c7' }]}>COLD CHAIN</Text></View>}
                {form.isInsured && <View style={[styles.flag, { backgroundColor: '#d1fae5' }]}><Text style={[styles.flagText, { color: '#059669' }]}>INSURED</Text></View>}
              </View>
            </Card>

            <View style={styles.btnRow}>
              <Button title="← Back" onPress={() => setStep(2)} variant="outline" style={{ flex: 1 }} />
              <Button title="Create Shipment" onPress={handleSubmit} loading={createMutation.isPending} style={{ flex: 2 }} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const reviewStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 13, color: '#6b7280' },
  value: { fontSize: 13, fontWeight: '600', color: '#111827', maxWidth: '60%', textAlign: 'right' },
});

const flagStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontSize: 14, color: '#374151', fontWeight: '500' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  stepRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#9ca3af' },
  stepLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginLeft: 6 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e5e7eb', marginHorizontal: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  section: { marginBottom: 0 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },
  btnRow: { flexDirection: 'row', gap: 10 },
  flagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 },
  flag: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  flagText: { fontSize: 10, fontWeight: '700', color: '#ef4444' },
});
