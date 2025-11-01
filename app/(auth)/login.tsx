import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/utils/auth';
import { upsertAuthUserToTable } from '@/services/userService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    try {
      const username = email.split('@')[0];
      await upsertAuthUserToTable({ username, email, password });
    } catch (e: any) {
      console.warn('Upsert users failed after login:', e?.message || e);
    } finally {
      setLoading(false);
    }

    if (isAdmin(email)) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(user)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Welcome back you've{'\n'}been missed!</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot your password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Create new account</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 20,
    fontSize: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1E40AF',
  },
  forgotPassword: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#000000',
    fontSize: 14,
    marginBottom: 30,
  },
});
