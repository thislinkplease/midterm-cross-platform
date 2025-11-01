import { Tabs, router } from 'expo-router';
import { Home, User } from 'lucide-react-native';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/utils/auth';

export default function TabLayout() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const email = session?.user?.email ?? '';
    if (!isAdmin(email)) {
      router.replace('/(user)');
    }
  }, [loading, session]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E40AF',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="edit-user" options={{ href: null }} />
    </Tabs>
  );
}