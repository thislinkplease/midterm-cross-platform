import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';

export type UserRow = {
  username: string | null;
  email: string;
  password: string | null;
  image: string | null;
};

const BUCKET = 'user-images';

// Lấy MIME dựa theo đuôi file
function guessContentType(uri: string) {
  const u = uri.toLowerCase();
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.webp')) return 'image/webp';
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/jpeg';
}

/**
 * Upload ảnh trực tiếp từ file URI lên Supabase Storage.
 * Dùng REST endpoint + FileSystem.uploadAsync.
 * Trả về public URL.
 */
export async function uploadImageFromUri(uri: string, key: string): Promise<string> {
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase URL or Anon key (check env EXPO_PUBLIC_*)');
  }

  const { data: sess } = await supabase.auth.getSession();
  const accessToken = sess?.session?.access_token;
  if (!accessToken) throw new Error('Not authenticated');

  const contentType = guessContentType(uri);
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(BUCKET)}/${encodeURIComponent(
    key,
  )}`;

  // Upload 
  const res = await FileSystem.uploadAsync(endpoint, uri, {
    httpMethod: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    uploadType: ((FileSystem as any).FileSystemUploadType?.BINARY_CONTENT ?? 'binary'),
  });

  if (res.status !== 200 && res.status !== 201) {
    // Supabase trả JSON lỗi trong res.body
    throw new Error(`Upload failed (${res.status}): ${res.body}`);
  }

  // Lấy public URL cho object vừa up
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/** Admin: lấy toàn bộ user */
export async function getAllUsers(): Promise<UserRow[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('username', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return (data ?? []) as UserRow[];
}

/** Lấy 1 user theo email */
export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if (error) throw error;
  return (data as UserRow) ?? null;
}

/** Upsert bản ghi users ngay sau khi đăng ký/đăng nhập (mirror từ Auth) */
export async function upsertAuthUserToTable(row: Partial<UserRow> & { email: string }) {
  const { data: existing } = await supabase
    .from('users')
    .select('username,email,image,password')
    .eq('email', row.email)
    .maybeSingle();

  const payload: UserRow = {
    username: row.username ?? existing?.username ?? null,
    email: row.email,
    password: (row.password !== undefined ? row.password : existing?.password ?? null) as string | null,
    image: (row.image ?? existing?.image ?? null) as string | null,
  };

  const { error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'email' });

  if (error) throw error;
}

/** User tự cập nhật thông tin của chính mình */
export async function updateSelfProfile(patch: Partial<UserRow>) {
  const { data: sess } = await supabase.auth.getSession();
  const email = sess?.session?.user?.email;
  if (!email) throw new Error('Not authenticated');

  const { error } = await supabase.from('users').update(patch).eq('email', email);
  if (error) throw error;
}

/** Admin xóa user theo email */
export async function deleteUserByEmail_Admin(email: string) {
  const { error } = await supabase.from('users').delete().eq('email', email);
  if (error) throw error;
}

/** Admin cập nhật user theo email */
export async function updateUser_Admin(email: string, patch: Partial<UserRow>) {
  const { error } = await supabase.from('users').update(patch).eq('email', email);
  if (error) throw error;
}
