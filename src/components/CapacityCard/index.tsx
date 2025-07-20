import React, { useEffect, useState, useRef } from 'react';
import CapacityCardComponent from './CapacityCardComponent';
import { exibirPublico, ExibirPublicoResponse } from '@/api/app/agenda';
import { getLogout } from '@/providers/AuthProvider';

const CapacityCard: React.FC = () => {
  const [publico, setPublico] = useState<ExibirPublicoResponse[]>([]);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 5;
  const retryCountRef = useRef(0);
  const logout = getLogout();

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
      const response = await exibirPublico();

      if (response.some(item => item.ERRO)) {
        console.error('Erro na resposta da API:', response.find(item => item.ERRO)?.MSG_ERRO || 'Erro desconhecido');
        setPublico([]);
        startRetry();
        return;
      }

      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
        retryCountRef.current = 0;
      }

      setPublico(response);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setPublico([]);
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

  return (
    <>
      {publico[0]?.EXIBIR_PUBLICO && <CapacityCardComponent
        currentCapacity={publico[0]?.PUBLICO}
        currentCapacityParking={publico[0]?.ESTACIONAMENTO}
        currentCapacityAcademy={publico[0]?.ACADEMIA}
        operatingHours={publico[0]?.TITULO}
      />}
    </>
  );
};

export default CapacityCard;