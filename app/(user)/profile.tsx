import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

type UserRow = {
  id?: string;
  username: string;
  email: string;
  image: string;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const [userData, setUserData] = useState<UserRow>({
    username: '',
    email: '',
    image: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Lấy session + prefill từ bảng `users` theo email auth
  useEffect(() => {
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const email = sess.session?.user?.email || '';
        if (!email) {
          setLoading(false);
          return;
        }

        // Lấy từ bảng users
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116: row not found
          throw error;
        }

        if (data) {
          setUserData({
            username: data.username || '',
            email: data.email || email,
            image: data.image || '',
          });
        } else {
          // Nếu chưa có row trong bảng users, khởi tạo từ auth
          setUserData({
            username: sess.session?.user?.user_metadata?.username || '',
            email,
            image: '',
          });
        }
      } catch (e: any) {
        Alert.alert('Error', e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const initials = useMemo(() => {
    const base = userData.username || userData.email || 'U';
    return base.trim().substring(0, 1).toUpperCase();
  }, [userData.username, userData.email]);

  const pickImage = async () => {
    try {
      const MediaType = (ImagePicker as any).MediaType;
      const options: any = { quality: 0.8 };
      if (MediaType && MediaType.Image) {
        options.mediaTypes = [MediaType.Image];
      } else {
        // fallback cho devices/SDK cũ
        options.mediaTypes = ImagePicker.MediaTypeOptions.Images;
      }
      const res = await ImagePicker.launchImageLibraryAsync(options);
      if (!res.canceled) {
        setUserData((s) => ({ ...s, image: res.assets[0].uri }));
      }
    } catch (e: any) {
      Alert.alert('Image Picker Error', e.message || String(e));
    }
  };

  const uploadIfNeeded = async () => {
    // Nếu chưa chọn ảnh mới or đã là URL thì trả lại như cũ (hoặc default)
    if (!userData.image || userData.image.startsWith('http')) {
      return userData.image || '';
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
      Alert.alert('Upload Error', err.message || String(err));
      return '';
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!userData.username || !userData.email) {
        Alert.alert('Attention', 'Please enter Username and Email.');
        return;
      }
      setSaving(true);
      const imageUrl = await uploadIfNeeded();

      // Lấy email hiện tại trong auth để so sánh
      const { data: sess } = await supabase.auth.getSession();
      const authEmail = sess.session?.user?.email;

      // Upsert vào bảng `users` dựa theo email
      const { error: upsertErr } = await supabase.from('users').upsert(
        {
          username: userData.username,
          email: userData.email,
          image: imageUrl || '',
        },
        { onConflict: 'email' }
      );
      if (upsertErr) throw upsertErr;

      // Nếu email thay đổi, cập nhật email trong Supabase Auth
      if (authEmail && userData.email && userData.email !== authEmail) {
        const { error } = await supabase.auth.updateUser({ email: userData.email });
        if (error) throw error;
        Alert.alert('Confirmation Sent', 'Please check your new email to confirm the change.');
      }

      // Cập nhật state với URL mới
      setUserData((s) => ({ ...s, image: imageUrl }));
      Alert.alert('Success', 'Profile has been saved.');
    } catch (e: any) {
      Alert.alert('Error', e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  // Đổi mật khẩu bằng Supabase Auth
  const handleChangePassword = async () => {
    try {
      if (!newPassword || newPassword.length < 6) {
        Alert.alert('Attention', 'New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPass) {
        Alert.alert('Attention', 'Password confirmation does not match.');
        return;
      }
      setChangingPass(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPass('');
      Alert.alert('Success', 'Password has been updated.');
    } catch (e: any) {
      Alert.alert('Change Password Error', e.message || String(e));
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading user...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Profile</Text>

        {/* Avatar nhỏ & tròn */}
        <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.85}>
          {userData.image ? (
            <Image source={{ uri: userData.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh]}>
              <Text style={styles.initial}>{initials}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.cardTitle}>Information</Text>
          <TextInput
            value={userData.username}
            onChangeText={(t) => setUserData((s) => ({ ...s, username: t }))}
            placeholder="yourname"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={userData.email}
            onChangeText={(t) => setUserData((s) => ({ ...s, email: t }))}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { marginTop: 10 }]}
            editable={false}
          />
          <TouchableOpacity
            style={[styles.primaryBtn, (saving || changingPass) && { opacity: 0.7 }]}
            onPress={handleSaveProfile}
            disabled={saving || changingPass}
          >
            {saving ? <ActivityIndicator /> : <Text style={styles.primaryText}>Save Profile</Text>}
          </TouchableOpacity>
        </View>

        {/* Change Password (Supabase Auth) */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="New Password"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry
            placeholder="Confirm New Password"
            autoCapitalize="none"
            style={[styles.input, { marginTop: 10 }]}
          />
          <TouchableOpacity
            style={[styles.secondaryBtn, changingPass && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={changingPass}
          >
            {changingPass ? <ActivityIndicator /> : <Text style={styles.secondaryText}>Update Password</Text>}
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={saving || changingPass}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#F2F7FF',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    paddingTop: 30,
    color: '#1E40AF',
    marginBottom: 20,
  },

  // Avatar tròn & nhỏ (nhỏ hơn edit-user)
  avatarWrap: { alignItems: 'center', marginBottom: 14 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFFFFF' },
  avatarPh: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: { fontSize: 34, fontWeight: '700', color: '#1E293B' },
  changeAvatar: { marginTop: 8, fontSize: 14, color: '#2563EB', fontWeight: '600' },

  field: { width: '100%', maxWidth: 420, marginBottom: 14 },
  label: { fontSize: 14, color: '#334155', marginBottom: 8, fontWeight: '600' },
  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  primaryBtn: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '700' },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#0F172A' },

  secondaryBtn: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryText: { color: '#FFFFFF', fontWeight: '700' },

  hint: { marginTop: 8, fontSize: 12, color: '#64748B' },

  logoutBtn: {
    width: '100%',
    maxWidth: 420,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
        