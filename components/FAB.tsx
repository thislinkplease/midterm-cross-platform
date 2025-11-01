import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';


type Props = { onPress: () => void };
export default function FAB({ onPress }: Props) {
    return (
        <Pressable style={styles.fab} onPress={onPress} android_ripple={{ color: '#ffffff55' }}>
            <MaterialIcons name="add" size={28} color="#fff" />
        </Pressable>
    );
}


const styles = StyleSheet.create({
    fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2d6cdf', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});