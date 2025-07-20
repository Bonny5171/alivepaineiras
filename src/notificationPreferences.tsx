import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import { listarNotificacao, gravarNotificacao } from '@/api/app/auth';
import { getAuthContext } from '@/providers/AuthProvider';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function NotificationPreferences() {
  const [notificationSettings, setNotificationSettings] = useState({
    exibirNotificacoes: false,
    atividades: false,
    convidados: false,
    dependentes: false,
    eventos: false,
    medicas: false,
    financeiras: false,
    ouvidoria: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const background = useThemeColor({}, 'background');
  const background2 = useThemeColor({}, 'background2');
  const text2 = useThemeColor({}, 'text2');
  const border = useThemeColor({}, 'border');

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(false);
      setError(null);
      try {
        const context = getAuthContext();
        
        const response = await listarNotificacao({
          TITULO: context.user,
          CHAVE: context.chave,
        });

        if (response.length > 0) {
          const settings = response[0];
          if (settings.ERRO) {
            setError(settings.MSG_ERRO || 'Erro ao carregar configurações de notificação');
          } else {
            setNotificationSettings({
              exibirNotificacoes: settings.HABILITAR_PUSH,
              atividades: settings.PUSH_ATIVIDADE,
              convidados: settings.PUSH_CONVIDADO,
              dependentes: settings.PUSH_DEPENDENTE,
              eventos: settings.PUSH_VAGAS,
              medicas: settings.PUSH_MEDICO,
              financeiras: settings.PUSH_FINANCEIRO,
              ouvidoria: settings.PUSH_OUVIDORIA,
            });
          }
        } else {
          setError('Nenhuma configuração de notificação encontrada');
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        setError('Falha ao carregar configurações de notificação');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []); // Array de dependências vazio para executar apenas uma vez

  const saveSettings = async (newSettings: typeof notificationSettings) => {
    setIsLoading(false);
    try {
      const context = getAuthContext();

      const response = await gravarNotificacao({
        TITULO: context.user,
        CHAVE: context.chave,
        PUSH_APP: true,
        HABILITAR_PUSH: newSettings.exibirNotificacoes,
        PUSH_ATIVIDADE: newSettings.atividades,
        PUSH_CONVIDADO: newSettings.convidados,
        PUSH_DEPENDENTE: newSettings.dependentes,
        PUSH_FINANCEIRO: newSettings.financeiras,
        PUSH_MEDICO: newSettings.medicas,
        PUSH_OUVIDORIA: newSettings.ouvidoria,
        PUSH_VAGAS: newSettings.eventos,
      });

      if (response.length > 0 && response[0].ERRO) {
        setError(response[0].MSG_ERRO || 'Erro ao salvar configurações de notificação');
      }
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
      setError('Falha ao salvar configurações de notificação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchChange = (key: keyof typeof notificationSettings) => async (value: boolean) => {
    setError(null);
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    await saveSettings(newSettings);
  };

  const notificationItems = [
    {
      title: 'Exibir Notificações no App',
      key: 'exibirNotificacoes',
    },
    {
      title: 'Informações de Atividades',
      key: 'atividades',
    },
    {
      title: 'Informações de Convidados',
      key: 'convidados',
    },
    {
      title: 'Informações de Dependentes',
      key: 'dependentes',
    },
    {
      title: 'Informações de Eventos',
      key: 'eventos',
    },
    {
      title: 'Informações Médicas',
      key: 'medicas',
    },
    {
      title: 'Informações Financeiras',
      key: 'financeiras',
    },
    {
      title: 'Informações na Ouvidoria',
      key: 'ouvidoria',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Header title="Notificações" backRoute="/profile" />
      <Wrapper isLoading={isLoading}>
        <View style={[styles.viewContainer, { backgroundColor: background2 }]}>
          {notificationItems.map((item) => (
            <View key={item.key} style={[styles.itemContainer, { borderBottomColor: border }]}>
              <View style={styles.itemContent}>
                <Text style={[styles.titleText, { color: text2 }]}>{item.title}</Text>
                <Switch
                  value={notificationSettings[item.key as keyof typeof notificationSettings]}
                  onValueChange={handleSwitchChange(item.key as keyof typeof notificationSettings)}
                  trackColor={{ false: '#6f7791', true: '#34C759' }}
                  thumbColor="#FFF"
                  disabled={isLoading}
                />
              </View>
            </View>
          ))}
          {error && <Text style={[styles.errorText, { color: '#6f7791' }]}>{error}</Text>}
        </View>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewContainer: {
    overflow: 'hidden',
    marginHorizontal: 20,
    borderRadius: 16,
  },
  itemContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 10,
    marginHorizontal: 20,
  },
});

export const unstable_settings = {
  initialRouteName: 'notificationPreferences',
  screenOptions: {
    headerShown: false,
  },
};