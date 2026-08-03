import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';

const PRESET_COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#16a34a', '#dc2626', '#d97706', '#db2777'];

export function BrandingScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { primaryColor, setPrimaryColor } = useStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Branding & Theme</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Card style={styles.card} padding={20}>
          <Text style={styles.sectionLabel}>Primary Color</Text>
          <Text style={styles.hint}>Choose a color that represents your brand</Text>
          <View style={styles.swatchGrid}>
            {PRESET_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.swatch, { backgroundColor: color }, primaryColor === color && styles.swatchActive]}
                onPress={() => setPrimaryColor(color)}
              >
                {primaryColor === color && <Ionicons name="checkmark" size={18} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.card} padding={20}>
          <Text style={styles.sectionLabel}>Preview</Text>
          <View style={[styles.preview, { backgroundColor: primaryColor }]}>
            <Text style={styles.previewText}>ShipFlow</Text>
            <Text style={styles.previewSub}>Your branding color</Text>
          </View>
        </Card>
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
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  hint: { fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  swatchActive: { borderWidth: 3, borderColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  preview: { borderRadius: 14, padding: 20, alignItems: 'center' },
  previewText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  previewSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
});
