import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphqlClient } from '../../api/client';
import { useStore } from '../../store/useStore';

const BATCH_UPLOAD_MUTATION = `
  mutation BatchUploadShipments($companyId: UUID!, $csvData: String!) {
    batchUploadShipments(companyId: $companyId, csvData: $csvData) {
      created
      failed
      errors { row message }
    }
  }
`;

const CSV_HEADERS = 'sender_name,sender_phone,sender_address,recipient_name,recipient_phone,recipient_address,origin_city,destination_city,weight_kg,declared_value,payment_method';

const SAMPLE_ROW = 'John Banda,0977123456,Plot 5 Cairo Rd Lusaka,Jane Mwale,0966987654,House 12 Independence Ave Ndola,Lusaka,Ndola,2.5,500,cash_on_delivery';

export function BatchUploadScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor, company } = useStore();
  const qc = useQueryClient();
  const [csvData, setCsvData] = useState('');
  const [result, setResult] = useState<any>(null);

  const uploadMutation = useMutation({
    mutationFn: () => graphqlClient.mutate(BATCH_UPLOAD_MUTATION, {
      companyId: company?.id,
      csvData: csvData.trim(),
    }),
    onSuccess: (data: any) => {
      const r = data?.batchUploadShipments;
      setResult(r);
      qc.invalidateQueries({ queryKey: ['shipments'] });
    },
    onError: () => Alert.alert('Error', 'Batch upload failed. Check your CSV format.'),
  });

  const loadSample = () => {
    setCsvData(`${CSV_HEADERS}\n${SAMPLE_ROW}`);
    setResult(null);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Batch Upload</Text>
        <Text style={styles.headerSub}>Upload multiple shipments via CSV</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Format guide */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <Ionicons name="information-circle-outline" size={18} color="#3b82f6" />
            <Text style={styles.guideTitle}>CSV Format</Text>
          </View>
          <Text style={styles.guideText}>First row must be the header row. Required columns:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.headerCode}>{CSV_HEADERS}</Text>
          </ScrollView>
          <TouchableOpacity style={[styles.sampleBtn, { borderColor: primaryColor }]} onPress={loadSample}>
            <Ionicons name="download-outline" size={14} color={primaryColor} />
            <Text style={[styles.sampleBtnText, { color: primaryColor }]}>Load sample data</Text>
          </TouchableOpacity>
        </View>

        {/* CSV input */}
        <Text style={styles.label}>Paste CSV Data</Text>
        <TextInput
          style={styles.csvInput}
          value={csvData}
          onChangeText={v => { setCsvData(v); setResult(null); }}
          multiline
          placeholder={`${CSV_HEADERS}\n${SAMPLE_ROW}`}
          placeholderTextColor="#d1d5db"
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.inputMeta}>
          <Text style={styles.lineCount}>
            {csvData.trim() ? Math.max(0, csvData.trim().split('\n').length - 1) : 0} data rows
          </Text>
          {csvData.length > 0 && (
            <TouchableOpacity onPress={() => { setCsvData(''); setResult(null); }}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Upload button */}
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: primaryColor, opacity: !csvData.trim() ? 0.5 : 1 }]}
          onPress={() => uploadMutation.mutate()}
          disabled={!csvData.trim() || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
              <Text style={styles.uploadBtnText}>Upload Shipments</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Result */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultSummary}>
              <View style={[styles.resultPill, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#16a34a" />
                <Text style={[styles.resultPillText, { color: '#16a34a' }]}>{result.created} created</Text>
              </View>
              {result.failed > 0 && (
                <View style={[styles.resultPill, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                  <Text style={[styles.resultPillText, { color: '#dc2626' }]}>{result.failed} failed</Text>
                </View>
              )}
            </View>

            {result.errors?.length > 0 && (
              <>
                <Text style={styles.errorsTitle}>Errors:</Text>
                {result.errors.map((e: any, i: number) => (
                  <View key={i} style={styles.errorRow}>
                    <Text style={styles.errorRow_text}>Row {e.row}: {e.message}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  guideCard: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, marginBottom: 16, gap: 8 },
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideTitle: { fontSize: 14, fontWeight: '700', color: '#1d4ed8' },
  guideText: { fontSize: 12, color: '#374151' },
  headerCode: { fontSize: 11, fontFamily: 'monospace', color: '#1e40af', backgroundColor: '#dbeafe', padding: 8, borderRadius: 6 },
  sampleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 4 },
  sampleBtnText: { fontSize: 12, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  csvInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 11, fontFamily: 'monospace', minHeight: 200, color: '#111827', elevation: 1 },
  inputMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 16 },
  lineCount: { fontSize: 12, color: '#9ca3af' },
  clearText: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 14, marginBottom: 16 },
  uploadBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  resultCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 1 },
  resultSummary: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  resultPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  resultPillText: { fontSize: 13, fontWeight: '700' },
  errorsTitle: { fontSize: 13, fontWeight: '700', color: '#dc2626', marginBottom: 8 },
  errorRow: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 10, marginBottom: 6 },
  errorRow_text: { fontSize: 12, color: '#dc2626' },
});
