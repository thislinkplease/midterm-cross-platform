import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, Pressable, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';

export default function EditUserScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const editingEmail = Array.isArray(email) ? email[0] : email;

  const initialUserData = { username: '', email: '', password: '', image: '' };
  const [userData, setUserData] = useState(initialUserData);
  const [saving, setSaving] = useState(false);

  const defaultImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  useEffect(() => {
    if (!editingEmail) return;
    (async () => {
      const { data, error } = await supabase.from('users').select('*').eq('email', editingEmail).single();
      if (error) Alert.alert('Error', error.message);
      else if (data) setUserData(data);
    })();
  }, [editingEmail]);

  useFocusEffect(
  React.useCallback(() => {
    return () => {
      setUserData(initialUserData);
    };
  }, [])
);

  const pickImage = async () => {
    const MediaType = (ImagePicker as any).MediaType;
    const options: any = {
        quality: 0.8,
    };

    if (MediaType && MediaType.Image) {
        options.mediaTypes = [MediaType.Image];
    } else {
        options.mediaTypes = ImagePicker.MediaTypeOptions.Images;
    }

    const res = await ImagePicker.launchImageLibraryAsync(options);
    if (!res.canceled) setUserData({ ...userData, image: res.assets[0].uri });
  };

  const uploadIfNeeded = async () => {
  if (!userData.image || userData.image.startsWith('http')) {
    return userData.image || defaultImage;
  }

  try {
    const response = await fetch(userData.image);
    const arrayBuffer = await response.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);
    const ext = userData.image.split('.').pop() || 'jpg';
    const path = `avatars/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('user-images')
      .upload(path, fileBytes, {
        contentType: 'image/jpeg',
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('user-images').getPublicUrl(path);
    return data.publicUrl;
  } catch (err: any) {
    console.error('Upload failed:', err);
    Alert.alert('Upload Error', err.message);
    return defaultImage;
  }
};

  const handleSave = async () => {
    if (!userData.username || !userData.email || !userData.password) {
      Alert.alert('Error', 'Please fill in all fields!');
      return;
    }

    try {
      setSaving(true);
      const imageUrl = await uploadIfNeeded();

      if (editingEmail) {
        const { error } = await supabase
          .from('users')
          .update({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            image: imageUrl,
          })
          .eq('email', editingEmail);
        if (error) throw error;
      } else {
        const { error } = await supabase.functions.invoke('admin-create-user', {
          body: {
            email: userData.email,
            password: userData.password,
            username: userData.username,
            image: imageUrl || defaultImage,
          },
        });

        if (error) throw error;
      }

      Alert.alert('Success', 'User saved successfully!');
      router.back();
    } catch (e: any) {
      Alert.alert('Error saving', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: '#F2F7FF' }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text 
            style={{ 
              fontSize: 24, 
              fontWeight: '800',
              textAlign: 'center',
              paddingTop: 30,
              paddingBottom: 20,
              color: '#1E40AF'
            }}>
            {editingEmail ? 'Edit User' : 'Add User'}
          </Text>

          <Pressable onPress={pickImage} style={styles.imagePicker}>
            {userData.image ? (
              <Image source={{ uri: userData.image }} style={styles.image} />
            ) : (
              <Text style={{ color: '#64748b' }}>Choose Image</Text>
            )}
          </Pressable>

          <TextInput
            placeholder="Username"
            style={styles.input}
            value={userData.username}
            onChangeText={(t) => setUserData({ ...userData, username: t })}
          />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={userData.email}
            onChangeText={(t) => setUserData({ ...userData, email: t })}
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            value={userData.password}
            onChangeText={(t) => setUserData({ ...userData, password: t })}
            secureTextEntry
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            <Pressable
              style={[styles.btn, { backgroundColor: '#e2e8f0' }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.btnText, { color: '#0f172a' }]}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, { backgroundColor: '#1E40AF' }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.btnText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  imagePicker: {
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  image: { width: '100%', height: undefined, aspectRatio: 1 },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700' },
});
