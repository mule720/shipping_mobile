import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useUsers, useCreateEmployee, useBranches } from '../../hooks/useData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { ROLES } from '../../constants/config';
import { getInitials } from '../../utils/format';

const ROLE_COLORS: Record<string, string> = {
  company_admin: '#4f46e5',
  branch_manager: '#7c3aed',
  warehouse_officer: '#0891b2',
  dispatch_officer: '#059669',
  driver: '#d97706',
  accounts_officer: '#dc2626',
};

export function UsersScreen() {
  const insets = useSafeAreaInsets();
  const { company, primaryColor } = useStore();
  const { data: users, isLoading, refetch } = useUsers();
  const [showModal, setShowModal] = useState(false);

  const renderUser = ({ item: u }: { item: any }) => {
    const roleColor = ROLE_COLORS[u.role] || '#6b7280';
    return (
      <Card style={styles.card} padding={14}>
        <View style={styles.cardRow}>
          <View style={[styles.avatar, { backgroundColor: roleColor + '20' }]}>
            <Text style={[styles.avatarText, { color: roleColor }]}>{getInitials(u.name || u.email)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{u.name || 'Unnamed'}</Text>
            <Text style={styles.email}>{u.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + '15', borderColor: roleColor + '40' }]}>
              <Text style={[styles.roleText, { color: roleColor }]}>
                {ROLES.find(r => r.value === u.role)?.label ?? u.role}
              </Text>
            </View>
          </View>
          <View style={[styles.statusDot, { backgroundColor: u.isActive ? '#10b981' : '#ef4444' }]} />
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderUser}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No users" message="Add your first team member" />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      <AddEmployeeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        companyId={company?.id ?? ''}
      />
    </View>
  );
}

function AddEmployeeModal({ visible, onClose, companyId }: { visible: boolean; onClose: () => void; companyId: string }) {
  const { primaryColor } = useStore();
  const { data: branches } = useBranches();
  const createEmployee = useCreateEmployee();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [branchId, setBranchId] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleAdd = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert('Missing Info', 'Name, email, password and role are required.'); return;
    }
    try {
      await createEmployee.mutateAsync({
        companyId, name, email, password, role, branchId: branchId || undefined,
      });
      Alert.alert('Success', `Employee ${name} created successfully!`);
      setName(''); setEmail(''); setPassword(''); setRole(''); setBranchId('');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create employee.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={modal.container}>
        <View style={modal.header}>
          <Text style={modal.title}>Add Employee</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
        </View>
        <ScrollView style={modal.body} keyboardShouldPersistTaps="handled">
          <Input label="Full Name" value={name} onChangeText={setName} required leftIcon="person-outline" />
          <Input label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" required leftIcon="mail-outline" />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPwd}
            required
            leftIcon="lock-closed-outline"
            rightIcon={showPwd ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPwd(v => !v)}
          />

          <Text style={modal.pickerLabel}>Role *</Text>
          <View style={modal.roleGrid}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[modal.roleBtn, role === r.value && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                onPress={() => setRole(r.value)}
              >
                <Text style={[modal.roleText, role === r.value && { color: '#ffffff' }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modal.pickerLabel}>Branch (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <TouchableOpacity
              style={[modal.chip, !branchId && { backgroundColor: primaryColor, borderColor: primaryColor }]}
              onPress={() => setBranchId('')}
            >
              <Text style={[modal.chipText, !branchId && { color: '#ffffff' }]}>None</Text>
            </TouchableOpacity>
            {(branches ?? []).map(b => (
              <TouchableOpacity
                key={b.id}
                style={[modal.chip, branchId === b.id && { backgroundColor: primaryColor, borderColor: primaryColor }]}
                onPress={() => setBranchId(b.id)}
              >
                <Text style={[modal.chipText, branchId === b.id && { color: '#ffffff' }]}>{b.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button title="Create Employee" onPress={handleAdd} loading={createEmployee.isPending} fullWidth size="lg" />
        </ScrollView>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#ffffff' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  body: { padding: 20 },
  pickerLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  roleBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb' },
  roleText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 16, gap: 10 },
  card: { marginBottom: 0 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 1 },
  email: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  roleText: { fontSize: 11, fontWeight: '600' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
});
