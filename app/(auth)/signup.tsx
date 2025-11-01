import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/utils/auth';
import { upsertAuthUserToTable } from '@/services/userService';

const DEFAULT_IMAGE = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const { error: signupError } = await supabase.auth.signUp({ email, password });
    if (signupError) {
      setLoading(false);
      setError(signupError.message);
      return;
    }

    try {
      await upsertAuthUserToTable({ username, email, password, image: DEFAULT_IMAGE });
    } catch (e: any) {
      Alert.alert('Error', e.message);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Fill in your details to register</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Already have an account?</Text>
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
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
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
