import { View, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import { useRoute } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface FaqDetailsProps {
  title: string;
  answer: string;
}

export default function FaqDetails(props: Partial<FaqDetailsProps>) {
  // Pega os parâmetros da navegação
  const route = useRoute();
  const { title, answer } = (route.params || {}) as FaqDetailsProps;
  const [answered, setAnswered] = useState(false);

  const background2 = useThemeColor({}, 'background2');
  const text2 = useThemeColor({}, 'text2');

  return (
    <>
      <Header title="Central de Ajuda" />
      <Wrapper>
        <View style={[styles.container, { backgroundColor: background2, shadowColor: text2 }]}>
          <ThemedText style={[styles.title, { color: text2 }]}>{title}</ThemedText>
          <ThemedText style={[styles.body, { color: '#6f7791' }]}>{answer}</ThemedText>
          <View style={[styles.divider, { backgroundColor: '#E7E9ED' }]} />
          {!answered ? (
            <>
              <ThemedText style={[styles.question, { color: '#6f7791' }]}>Isso lhe foi útil?</ThemedText>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setAnswered(true)}
                  accessible={true}
                  accessibilityLabel="Sim, a resposta foi útil"
                >
                  <ThemedText style={[styles.buttonYes, { color: '#DA1984' }]}>Sim</ThemedText>
                </TouchableOpacity>
                <View style={[styles.buttonDivider, { backgroundColor: '#E7E9ED' }]} />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setAnswered(true)}
                  accessible={true}
                  accessibilityLabel="Não, a resposta não foi útil"
                >
                  <ThemedText style={[styles.buttonNo, { color: '#6f7791' }]}>Não</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <ThemedText style={[styles.thankYou, { color: text2 }]}>
              <ThemedText style={{ fontWeight: 'bold' }}>Obrigado por sua resposta!</ThemedText>
            </ThemedText>
          )}
        </View>
      </Wrapper>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    margin: 16,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  question: {
    fontSize: 14,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonYes: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonNo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDivider: {
    width: 1,
    height: 32,
  },
  thankYou: {
    marginTop: 24,
    fontSize: 18,
    textAlign: 'center',
  },
});