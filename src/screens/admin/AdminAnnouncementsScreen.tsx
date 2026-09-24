import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { ALL_ANNOUNCEMENTS_QUERY, CREATE_ANNOUNCEMENT_MUTATION, TOGGLE_ANNOUNCEMENT_MUTATION, DELETE_ANNOUNCEMENT_MUTATION } from '../../api/queries';
import { useStore } from '../../store/useStore';

const TARGETS = ['all', 'company_admin', 'aggregator', 'customer'];

export function AdminAnnouncementsScreen() {
  const { primaryColor } = useStore();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminAnnouncements'],
    queryFn: () => graphqlClient.query(ALL_ANNOUNCEMENTS_QUERY, {}),
  });

  const createMutation = useMutation({
    mutationFn: () => graphqlClient.mutate(CREATE_ANNOUNCEMENT_MUTATION, { title, body, target }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminAnnouncements'] }); setShowCreate(false); setTitle(''); setBody(''); },
    onError: () => Alert.alert('Error', 'Failed to create'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => graphqlClient.mutate(TOGGLE_ANNOUNCEMENT_MUTATION, { announcementId: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminAnnouncements'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => graphqlClient.mutate(DELETE_ANNOUNCEMENT_MUTATION, { announcementId: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminAnnouncements'] }),
  });

  const announcements: any[] = (data as any)?.allAnnouncements ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.count}>{announcements.length} announcements</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: primaryColor }]} onPress={() => setShowCreate(true)}>
          <Ionicons name="add-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={announcements}
          keyExtractor={i => i.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text style={styles.annoTitle}>{item.title}</Text>
                  <Text style={styles.target}>→ {item.target}</Text>
                </View>
                <Switch
                  value={item.isActive}
                  onValueChange={() => toggleMutation.mutate(item.id)}
                  trackColor={{ false: '#e5e7eb', true: primaryColor + '60' }}
                  thumbColor={item.isActive ? primaryColor : '#9ca3af'}
                />
              </View>
              <Text style={styles.bodyText} numberOfLines={2}>{item.body}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this announcement?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                ])}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Announcement</Text>
            <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Message body" value={body} onChangeText={setBody} multiline />
            <Text style={styles.label}>Target audience</Text>
            <View style={styles.chipRow}>
              {TARGETS.map(t => (
                <TouchableOpacity key={t} style={[styles.chip, target === t && { backgroundColor: primaryColor }]} onPress={() => setTarget(t)}>
                  <Text style={[styles.chipText, target === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: primaryColor }]} onPress={() => createMutation.mutate()}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  count: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1 },
  annoTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  target: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  bodyText: { fontSize: 13, color: '#374151', marginTop: 8, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  date: { fontSize: 11, color: '#9ca3af' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  confirmBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
});
