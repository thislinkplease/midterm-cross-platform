import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function UserCard({ item, onEdit, onDelete }: { item: any; onEdit: () => void; onDelete: () => void; }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.card}>
      {/* Hàng chính */}
      <Pressable style={styles.header} onPress={toggleExpand}>
        <Image
          source={{
            uri: item.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{item.username}</Text>
        {expanded ? (
          <ChevronUp size={20} color="#1E40AF" />
        ) : (
          <ChevronDown size={20} color="#1E40AF" />
        )}
      </Pressable>

      {/* Phần mở rộng */}
      {expanded && (
        <View style={styles.detailContainer}>
          <Text style={styles.detailText}>📧 {item.email}</Text>
          <Text style={styles.detailText}>🔒 {item.password}</Text>
          <View style={styles.actionRow}>
            <Pressable onPress={onEdit} style={[styles.actionBtn, { backgroundColor: '#1E40AF' }]}>
              <Pencil size={18} color="#fff" />
              <Text style={styles.btnText}>Edit</Text>
            </Pressable>
            <Pressable onPress={onDelete} style={[styles.actionBtn, { backgroundColor: '#DC2626' }]}>
              <Trash2 size={18} color="#fff" />
              <Text style={styles.btnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  detailContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
