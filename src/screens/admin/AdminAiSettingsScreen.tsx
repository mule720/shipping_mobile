import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { useStore } from '../../store/useStore';

const AI_CONFIG_QUERY = `
  query AiConfig {
    aiConfig {
      model
      photoEstimatorEnabled
      hasApiKey
    }
  }
`;

const SAVE_AI_CONFIG_MUTATION = `
  mutation SaveAiConfig($apiKey: String, $model: String, $photoEstimatorEnabled: Boolean) {
    saveAiConfig(apiKey: $apiKey, model: $model, photoEstimatorEnabled: $photoEstimatorEnabled) {
      model
      photoEstimatorEnabled
      hasApiKey
    }
  }
`;

const CLAUDE_MODELS = [
  { id: 'claude-opus-5', label: 'Claude Opus 5 — Best accuracy (recommended)' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 — Faster, balanced' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 — Fastest, lowest cost' },
];

export function AdminAiSettingsScreen() {
  const { primaryColor } = useStore();
  const qc = useQueryClient();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState('claude-opus-5');
  const [photoEnabled, setPhotoEnabled] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['aiConfig'],
    queryFn: () => graphqlClient.query(AI_CONFIG_QUERY, {}),
    onSuccess: (d: any) => {
      const cfg = d?.aiConfig;
      if (cfg?.model) setModel(cfg.model);
      if (cfg?.photoEstimatorEnabled !== undefined) setPhotoEnabled(cfg.photoEstimatorEnabled);
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => graphqlClient.mutate(SAVE_AI_CONFIG_MUTATION, {
      apiKey: apiKey || null,
      model,
      photoEstimatorEnabled: photoEnabled,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['aiConfig'] });
      setApiKey('');
      Alert.alert('Saved', 'AI settings updated successfully.');
    },
    onError: () => Alert.alert('Error', 'Failed to save AI settings'),
  });

  const cfg = (data as any)?.aiConfig;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Ionicons name="sparkles-outline" size={28} color={primaryColor} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AI Settings</Text>
          <Text style={styles.headerSub}>Configure Claude AI for photo estimation and smart features</Text>
        </View>
      </View>

      {/* API Key status */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Ionicons
            name={cfg?.hasApiKey ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color={cfg?.hasApiKey ? '#10b981' : '#f59e0b'}
          />
          <Text style={[styles.statusText, { color: cfg?.hasApiKey ? '#10b981' : '#f59e0b' }]}>
            {cfg?.hasApiKey ? 'API key configured' : 'No API key — AI features disabled'}
          </Text>
        </View>
      </View>

      {/* API Key input */}
      <Text style={styles.sectionTitle}>Anthropic API Key</Text>
      <View style={styles.keyRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder={cfg?.hasApiKey ? 'Enter new key to replace existing…' : 'sk-ant-…'}
          secureTextEntry={!showKey}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowKey(p => !p)}>
          <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>
        Get your key from console.anthropic.com. Leave blank to keep the existing key.
      </Text>

      {/* Model selection */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Claude Model</Text>
      {CLAUDE_MODELS.map(m => (
        <TouchableOpacity
          key={m.id}
          style={[styles.modelCard, model === m.id && { borderColor: primaryColor, backgroundColor: primaryColor + '08' }]}
          onPress={() => setModel(m.id)}
        >
          <View style={[styles.radioOuter, model === m.id && { borderColor: primaryColor }]}>
            {model === m.id && <View style={[styles.radioInner, { backgroundColor: primaryColor }]} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.modelId, model === m.id && { color: primaryColor }]}>{m.id}</Text>
            <Text style={styles.modelLabel}>{m.label.split('—')[1]?.trim()}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Photo estimator toggle */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Features</Text>
      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>Photo Package Estimator</Text>
          <Text style={styles.toggleSub}>Let staff take a photo to auto-estimate package weight & dimensions using AI vision</Text>
        </View>
        <Switch
          value={photoEnabled}
          onValueChange={setPhotoEnabled}
          trackColor={{ false: '#e5e7eb', true: primaryColor + '60' }}
          thumbColor={photoEnabled ? primaryColor : '#9ca3af'}
        />
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: primaryColor }]}
        onPress={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
      >
        {saveMutation.isPending
          ? <ActivityIndicator color="#fff" />
          : <><Ionicons name="save-outline" size={18} color="#fff" /><Text style={styles.saveBtnText}>Save Settings</Text></>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 17 },
  statusCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 16, elevation: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, backgroundColor: '#fff', color: '#111827' },
  eyeBtn: { padding: 10 },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 6 },
  modelCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: '#e5e7eb', elevation: 1 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  modelId: { fontSize: 13, fontWeight: '700', color: '#374151' },
  modelLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 1 },
  toggleTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  toggleSub: { fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 17 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 14, marginTop: 24, marginBottom: 8 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
