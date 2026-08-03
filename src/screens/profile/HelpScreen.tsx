import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';

const FAQ = [
  { q: 'How do I create a shipment?', a: 'Go to the Shipments tab and tap the + button.' },
  { q: 'How do I track a package?', a: 'Use the Track button on the Home screen or Shipments tab.' },
  { q: 'How does COD collection work?', a: 'Drivers collect cash on delivery and reconcile it in the Finance tab.' },
  { q: 'Can I add multiple branches?', a: 'Yes — go to Operations > Branches and tap the + button.' },
  { q: 'How do I invite team members?', a: 'Go to Business > Team and tap Add User.' },
];

export function HelpScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [expanded, setExpanded] = React.useState<number | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Card style={styles.card} padding={0}>
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:support@shipflow.com')}>
            <View style={[styles.icon, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="mail-outline" size={20} color={primaryColor} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@shipflow.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.contactRow}>
            <View style={[styles.icon, { backgroundColor: '#10b981' + '15' }]}>
              <Ionicons name="chatbubble-outline" size={20} color="#10b981" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Live Chat</Text>
              <Text style={styles.contactValue}>Available 9am–6pm</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </Card>

        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        <Card padding={0}>
          {FAQ.map((item, i) => (
            <View key={i}>
              <TouchableOpacity
                style={styles.faqRow}
                onPress={() => setExpanded(expanded === i ? null : i)}
              >
                <Text style={styles.faqQ}>{item.q}</Text>
                <Ionicons name={expanded === i ? 'chevron-up' : 'chevron-down'} size={18} color="#9ca3af" />
              </TouchableOpacity>
              {expanded === i && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqA}>{item.a}</Text>
                </View>
              )}
              {i < FAQ.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        <Text style={styles.version}>ShipFlow Mobile v1.0.0</Text>
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
  card: { marginBottom: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  contactValue: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 16 },
  faqTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  faqRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827', marginRight: 8 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 14 },
  faqA: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  version: { textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24 },
});
