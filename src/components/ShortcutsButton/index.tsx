import React, { useEffect, useState, useRef } from 'react';
import ShortcutsButtonComponent from './ShorcutsSection';
import { listarServicos } from '@/api/app/appointments';
import { useNavigation } from '@react-navigation/native';
import { getLogout } from '@/providers/AuthProvider';

const ShortcutsButton: React.FC = () => {
  const navigation = useNavigation();
  const logout = getLogout();
  const baseShortcutActions = [
    {
      key: 300,
      title: 'Esportes',
      icon: 'face-smile',
      color: '#FF6B6B',
      onPress: () => {
        navigation.navigate('(tabs)/(sports)/home');
      },
    },
    {
      key: 10300,
      title: 'Cultural',
      icon: 'theater-masks',
      color: '#4ECDC4',
      onPress: () => {
        navigation.navigate('(tabs)/(cultural)/home');
      },
    },
    {
      key: 200,
      title: 'Saúde',
      icon: 'heart-pulse',
      color: '#32D74B',
      onPress: () => {
        navigation.navigate('(consulta)/index');
      },
    },
    {
      key: 1400,
      title: 'Secretaria',
      icon: 'user-tie',
      color: '#6B5B95',
      onPress: () => {
        navigation.navigate('(mais)');
      },
    },
    {
      key: 500,
      title: 'Financeiro',
      icon: 'wallet',
      color: '#6B5B95',
      onPress: () => {
        navigation.navigate('(financeiro)/home', { 
          screen: 'Home'
        });
      },
    },
    {
      key: 9998,
      title: 'Serviços',
      icon: 'tasks',
      color: '#6B5B95',
    },
    {
      key: 15100,
      title: 'Clube',
      icon: 'building',
      color: '#6B5B95',
      onPress: () => {
        navigation.navigate('clube', { 
          screen: 'Home'
        });
      },
    },
  ];

  const [shortcutActions, setShortcutActions] = useState(baseShortcutActions);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 5;
  const retryCountRef = useRef(0);

  const startRetry = () => {
    if (!retryIntervalRef.current) {
      retryIntervalRef.current = setInterval(() => {
        if (maxRetries && retryCountRef.current >= maxRetries) {
          console.warn('Máximo de tentativas atingido. Parando retries.');
          if (retryIntervalRef.current) {
            clearInterval(retryIntervalRef.current);
            retryIntervalRef.current = null;
          }
          logout();
          return;
        }
        retryCountRef.current += 1;
        console.log(`Tentativa ${retryCountRef.current} de buscar dados...`);
        fetchData();
      }, 5000);
    }
  };

  const fetchData = async () => {
    try {
      const servicosResponse = await listarServicos();
      if (servicosResponse.some(item => item.ERRO)) {
        console.error('Erro na resposta da API:', servicosResponse.find(item => item.ERRO)?.MSG_ERRO || 'Erro desconhecido');
        setShortcutActions(baseShortcutActions);
        startRetry();
        return;
      }
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
        retryCountRef.current = 0;
      }
      const filteredShortcuts = baseShortcutActions
        .map(action => {
          const matchedService = servicosResponse.find(servico => servico.IDGRUPO === action.key);
          if (matchedService) {
            return {
              ...action,
              icon: matchedService.ICONE || action.icon,
            };
          }
          return null;
        })
        .filter((action): action is NonNullable<typeof action> => action !== null)
        .sort((a, b) => {
          const servicoA = servicosResponse.find(servico => servico.IDGRUPO === a.key);
          const servicoB = servicosResponse.find(servico => servico.IDGRUPO === b.key);
          const ordemA = servicoA ? parseInt(servicoA.ORDEM, 10) : Infinity;
          const ordemB = servicoB ? parseInt(servicoB.ORDEM, 10) : Infinity;
          return ordemA - ordemB;
        });
      setShortcutActions(filteredShortcuts);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setShortcutActions(baseShortcutActions);
      startRetry();
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
    };
  }, []);

  return <ShortcutsButtonComponent shortcutActions={shortcutActions} />;
};

export default ShortcutsButton;