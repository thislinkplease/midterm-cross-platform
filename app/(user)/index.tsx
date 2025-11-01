import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function UserIndex() {
  useEffect(() => {
    router.replace('/(user)/profile');
  }, []);

  return <View />;
}
