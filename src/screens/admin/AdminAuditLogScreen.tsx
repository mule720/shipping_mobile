import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { ACTIVITY_LOGS_QUERY } from '../../api/queries';
import { useStore } from '../../store/useStore';

export function AdminAuditLogScreen() {
  const { primaryColor } = useStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: () => graphqlClient.query(ACTIVITY_LOGS_QUERY, {}),
  });

  const logs: any[] = (data as any)?.activityLogs ?? [];

  const actionColor = (a: string) => {
    if (a?.includes('delete') || a?.includes('remove')) return '#ef4444';
    if (a?.includes('create') || a?.includes('approve')) return '#10b981';
    if (a?.includes('update') || a?.includes('edit')) return '#f59e0b';
    return '#6b7280';
  };

  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={logs}
          keyExtractor={(_, i) => String(i)}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: actionColor(item.action) }]} />
              <View style={styles.logInfo}>
                <Text style={styles.action}>{item.action}</Text>
                <Text style={styles.user}>{item.user?.email ?? 'System'}</Text>
                <Text style={styles.details} numberOfLines={1}>{item.details}</Text>
              </View>
              <Text style={styles.time}>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  row: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, gap: 10, elevation: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  logInfo: { flex: 1 },
  action: { fontSize: 14, fontWeight: '600', color: '#111827', textTransform: 'capitalize' },
  user: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  details: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  time: { fontSize: 11, color: '#9ca3af' },
});
