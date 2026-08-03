import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { graphqlClient } from '../../api/client';
import { LOGIN_MUTATION, COMPANY_QUERY } from '../../api/queries';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { APP_NAME, PRIMARY_COLOR } from '../../constants/config';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your username/email/phone and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await graphqlClient.mutate(LOGIN_MUTATION, { username: email.trim(), password });
      const { success, token, message, user } = data.login;
      if (!success || !token) throw new Error(message || 'Login failed');
      // Fetch real company data using the companyId from the login user object
      let company = { id: user?.companyId || '', name: 'ShipFlow', primaryColor: '#4f46e5', secondaryColor: '#7c3aed', subscription: 'professional', isActive: true };
      if (user?.companyId) {
        try {
          const compData = await graphqlClient.query(COMPANY_QUERY, { id: user.companyId });
          if (compData?.company) {
            company = { ...company, ...compData.company, id: user.companyId };
          }
        } catch { /* keep fallback */ }
      }
      await login(token, token, user, company);
    } catch (e: any) {
      setError(e.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[PRIMARY_COLOR, '#7c3aed']}
        style={[styles.hero, { paddingTop: insets.top + 40 }]}
      >
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="cube" size={36} color={PRIMARY_COLOR} />
          </View>
        </View>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.tagline}>Logistics Management Platform</Text>
      </LinearGradient>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Sign in to your account</Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Input
          label="Username, Email or Phone"
          value={email}
          onChangeText={setEmail}
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="username / email / phone"
          leftIcon="person-outline"
          required
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholder="••••••••"
          leftIcon="lock-closed-outline"
          rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowPassword(v => !v)}
          required
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          fullWidth
          size="lg"
          style={styles.loginBtn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by </Text>
          <Text style={styles.footerBrand}>{APP_NAME}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoWrap: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  formContent: {
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ef4444',
  },
  loginBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  footerBrand: {
    fontSize: 13,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
});
