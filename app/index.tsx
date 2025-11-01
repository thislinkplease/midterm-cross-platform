import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/utils/auth';

export default function IndexScreen() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!session) {
        router.replace('/(auth)/login');
        return;
      }
      const email = session.user?.email ?? '';
      if (isAdmin(email)) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(user)');
      }
    }
  }, [session, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1E40AF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
