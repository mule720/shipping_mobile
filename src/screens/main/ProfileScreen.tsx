import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ROLES } from '../../constants/config';
import { getInitials } from '../../utils/format';

const MENU_ITEMS = [
  { icon: 'person-outline' as const, label: 'Account Settings', screen: 'AccountSettings' },
  { icon: 'business-outline' as const, label: 'Company Profile', screen: 'CompanyProfile' },
  { icon: 'card-outline' as const, label: 'Subscription', screen: 'Subscription' },
  { icon: 'color-palette-outline' as const, label: 'Branding & Theme', screen: 'Branding' },
  { icon: 'notifications-outline' as const, label: 'Notifications', screen: 'Notifications' },
  { icon: 'shield-checkmark-outline' as const, label: 'Security', screen: 'Security' },
  { icon: 'help-circle-outline' as const, label: 'Help & Support', screen: 'Help' },
];

export function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, company, logout, primaryColor } = useStore();
  const initials = getInitials(user?.name || user?.email || 'U');
  const roleLabel = ROLES.find(r => r.value === user?.role)?.label ?? user?.role ?? '';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const SUBSCRIPTION_COLORS: Record<string, string> = {
    starter: '#10b981',
    professional: '#4f46e5',
    enterprise: '#f59e0b',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Banner */}
      <View style={[styles.banner, { backgroundColor: primaryColor, paddingTop: insets.top + 20 }]}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Company Card */}
        {company && (
          <Card style={styles.companyCard} padding={16}>
            <View style={styles.companyRow}>
              <View style={[styles.companyIcon, { backgroundColor: primaryColor + '20' }]}>
                <Ionicons name="business-outline" size={22} color={primaryColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>{company.name}</Text>
                <View style={styles.subRow}>
                  <View style={[styles.subBadge, { backgroundColor: (SUBSCRIPTION_COLORS[company.subscription] || '#6b7280') + '20' }]}>
                    <Text style={[styles.subText, { color: SUBSCRIPTION_COLORS[company.subscription] || '#6b7280' }]}>
                      {company.subscription?.toUpperCase()} PLAN
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </View>
          </Card>
        )}

        {/* Menu Items */}
        <Card style={styles.menuCard} padding={0}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              onPress={() => navigation?.navigate?.(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: primaryColor + '15' }]}>
                <Ionicons name={item.icon} size={18} color={primaryColor} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </Card>

        {/* App Version */}
        <Text style={styles.version}>ShipFlow Mobile v1.0.0</Text>

        {/* Logout */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          size="lg"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  banner: { alignItems: 'center', paddingBottom: 32, paddingHorizontal: 24 },
  avatarWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#ffffff' },
  name: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleText: { fontSize: 13, color: '#ffffff', fontWeight: '600' },
  body: { padding: 16, gap: 12, marginTop: -16 },
  companyCard: { marginBottom: 0 },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  companyIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  companyName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subRow: { flexDirection: 'row' },
  subBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  subText: { fontSize: 11, fontWeight: '700' },
  menuCard: { overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
  version: { textAlign: 'center', fontSize: 12, color: '#9ca3af', paddingVertical: 4 },
});
