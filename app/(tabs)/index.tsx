import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, RefreshControl, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import SearchBar from '@/components/SearchBar';
import UserCard from '@/components/UserCard';
import FAB from '@/components/FAB';

export default function HomeScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (search = '') => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', `%${search}%`);
    if (error) Alert.alert('Error', error.message);
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(query);
  }, [query]);

  const handleDelete = async (item) => {
    Alert.alert('Delete user', `Are you sure you want to delete "${item.username}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('users').delete().eq('email', item.email);
            if (error) throw error;
            fetchUsers(query);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F7FF' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 12 }}>
          <Text 
            style={{ 
              fontSize: 24, 
              fontWeight: '800',
              textAlign: 'center',
              paddingTop: 15,
              paddingBottom: 10,
              color: '#1E40AF'
            }}>Users List</Text>
          <SearchBar value={query} onChange={(t) => { setQuery(t); fetchUsers(t); }} />
        </View>

        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          data={users}
          keyExtractor={(item) => item.username}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchUsers(query)} />}
          renderItem={({ item }) => (
            <UserCard
              item={item}
              onEdit={() =>
                router.push({
                  pathname: '/(tabs)/edit-user',
                  params: { email: item.email },
                } as any)
              }
              onDelete={() => handleDelete(item)}
            />
          )}
          ListEmptyComponent={
            !loading && (
              <View style={{ alignItems: 'center', marginTop: 80 }}>
                <Text>No users found</Text>
              </View>
            )
          }
        />

        <FAB onPress={() => router.push({ pathname: '/(tabs)/edit-user' } as any)} />
      </SafeAreaView>
    </View>
  );
}
