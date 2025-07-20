import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ParqRefazerAviso() {
  const text2 = useThemeColor({}, 'text2');
  const neutralText = useThemeColor({}, 'neutralText');

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: text2 }]}>
        PAR-Q, dentro da validade. Quer preencher novamente?
      </Text>
      <Text style={[styles.subtitle, { color: neutralText }]}>
        Se continuar, o PAR-Q anterior será substituído.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});