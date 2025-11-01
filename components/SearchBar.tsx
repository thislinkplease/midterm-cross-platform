import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';


type Props = { value: string; onChange: (v: string) => void };
export default function SearchBar({ value, onChange }: Props) {
    return (
        <View style={styles.container}>
            <Ionicons name="search" size={20} />
            <TextInput
                placeholder="Search users..."
                style={styles.input}
                value={value}
                onChangeText={onChange}
                returnKeyType="search"
            />
        </View>
    );  
}


const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 14, paddingHorizontal: 12, height: 44, gap: 8 },
    input: { flex: 1 },
});