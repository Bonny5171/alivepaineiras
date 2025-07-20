import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Wrapper } from '@/components/Wrapper';
import { ThemedText } from '@/components/ThemedText';
import Header from '@/components/Header'; // Importar o componente Header
import { useRoute } from '@react-navigation/native';

export default function NotificationDetails() {
  // Acessa os parâmetros passados
  const route = useRoute();
  const { notificacao } = route.params?.params;
  const notificacaoSelecionada = JSON.parse(notificacao as string);

  return (
    <View style={styles.container}>
      <Header title="Notificações" backRoute="/notification"/>
      <Wrapper
        primaryButtonLabel="Visualizar"
        onPrimaryPress={() => {}}
      >
      <View style={{ paddingHorizontal: 16 }}>
          <ThemedText style={{ fontSize: 23, fontWeight: 'bold' }}>
            {notificacaoSelecionada.ASSUNTO}
          </ThemedText>
          <ThemedText style={{ marginTop: 8, color: 'gray' }}>
            Data: {notificacaoSelecionada.DATA}
          </ThemedText>
          <ThemedText style={{ marginTop: 8 }}>
            {notificacaoSelecionada.DESCRICAO}
          </ThemedText>
        </View>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E7F8',
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#DA1984',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

// Configurar o header do navegador
export const unstable_settings = {
  initialRouteName: 'notificationDetails',
  screenOptions: {
    headerShown: true,
    headerTitle: 'Detalhes da Notificação',
    headerStyle: {
      backgroundColor: '#DA1984',
    },
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFF',
    },
    headerTintColor: '#FFF',
  },
};