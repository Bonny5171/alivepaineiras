import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
// import * as Device from 'expo-device';
import DeviceInfo from 'react-native-device-info';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosResponse } from 'axios';
import Config from 'react-native-config';

// Defina a base do URL e o caminho do serviço
const baseURL = 'https://clubepaineiras.com.br/AliveTeste';
const servicePath = 'Alive.App/Acesso.asmx';

// Defina a interface para a resposta da API de Logoff
interface LogoffResponseItem {
  ERRO: boolean;
  IDERRO: number;
  MSG_ERRO: string;
}

// A resposta é um array de objetos do tipo LogoffResponseItem
type LogoffResponse = LogoffResponseItem[];

export interface AuthContextType {
  user: any;
  setTitulo: (user: any) => void;
  chave: string;
  setChave: (chave: string) => void;
  userkey: string; // Adicionado userkey
  setUserkey: (userkey: string) => void; // Adicionado setter
  nome: string;
  setNome: (chave: string) => void;
  ip: string;
  device: string;
  appVersion: string;
  osVersion: string;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
let globalAuthContext: AuthContextType | null = null; // Variável global
let globalLogout: (() => void) | null = null; // Variável global para logout

// Função para fazer o Logoff
export const logoff = async (chave: string): Promise<AxiosResponse<LogoffResponse>> => {
  const url = `${baseURL}/${servicePath}/Logoff`;

  // Faz a requisição GET para o endpoint de Logoff
  const response = await axios.get(url, {
    params: {
      CHAVE: chave, // CHAVE obtida do contexto
    },
  });

  return response;
};

export const getAuthContext = () => {
  if (!globalAuthContext) {
    throw new Error("AuthContext ainda não foi inicializado.");
  }
  return globalAuthContext;
};

export const getLogout = () => {
  if (!globalLogout) {
    throw new Error("Logout function ainda não foi inicializada.");
  }
  return globalLogout;
};

let modelName = DeviceInfo.getModel();

export const AuthProvider = ({ children, navigation }: { children: React.ReactNode, navigation: any }) => {
  const [user, setTitulo] = useState<any>(null);
  const [nome, setNome] = useState<any>(null);
  const [chave, setChave] = useState<any>(null);
  const [userkey, setUserkey] = useState<string>(""); // Novo estado para userkey
  const [ip, setIp] = useState<string>("");
  // const [device, setDevice] = useState<string>(Device.modelName || "Desconhecido");
  const [device, setDevice] = useState<string>(modelName || "Desconhecido");
  const [appVersion, setAppVersion] = useState<string>(Config.EXPO_PUBLIC_APP_VERSION || "Desconhecido");
  const [osVersion, setOsVersion] = useState<string>(Platform.Version.toString());

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get("https://checkip.amazonaws.com/");
        setIp(response.data.trim());
      } catch (error) {
        console.error("Erro ao buscar o IP:", error);
      }
    };

    fetchIp();

    // Recupera chave, user e userkey do AsyncStorage ao iniciar
    const loadAuthData = async () => {
      try {
        const savedChave = await AsyncStorage.getItem('chave');
        const savedUser = await AsyncStorage.getItem('user');
        const savedUserkey = await AsyncStorage.getItem('userkey');
        if (savedChave && savedUser) {
          setChave(savedChave);
          setTitulo(JSON.parse(savedUser));
          if (savedUserkey) setUserkey(savedUserkey);
          // Se já estiver autenticado, vai direto para a home
          navigation.current?.reset({
            index: 0,
            routes: [{ name: '(tabs)' }],
          });
        }
      } catch (e) {
        console.error('Erro ao carregar dados de autenticação:', e);
      }
    };
    loadAuthData();
  }, []);

  // Salva chave, user e userkey sempre que mudam
  useEffect(() => {
    const saveAuthData = async () => {
      try {
        if (chave && user) {
          await AsyncStorage.setItem('chave', chave);
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
        if (userkey) {
          await AsyncStorage.setItem('userkey', userkey);
        }
      } catch (e) {
        console.error('Erro ao salvar dados de autenticação:', e);
      }
    };
    saveAuthData();
  }, [chave, user, userkey]);

  const logout = async () => {
    setTitulo(undefined);
    setChave("");
    setUserkey(""); // Limpa userkey
    await AsyncStorage.removeItem('chave');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('userkey');
    logoff(chave);
    navigation.current?.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
  };

  globalLogout = logout; // Armazena a função logout globalmente

  const contextValue = {
    user,
    setTitulo,
    nome,
    setNome,
    chave,
    setChave,
    userkey, // Inclui userkey no contexto
    setUserkey, // Inclui setter no contexto
    ip,
    device,
    appVersion,
    osVersion,
    logout,
  };

  globalAuthContext = contextValue; // Armazena globalmente

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};