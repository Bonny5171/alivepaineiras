import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import LoginComponent from './Login';
import { useAuth } from '@/providers';
import { autenticar } from '@/api/app/auth';
import { useError } from '@/providers/ErrorProvider';

interface LoginIndexProps {
  visible: boolean; // Prop para controlar a visibilidade do componente
  onClose: () => void; // Função para fechar o componente
  onSecondaryPress: () => void; // Função para o botão secundário
}

const Login: React.FC<LoginIndexProps> = ({ visible, onClose, onSecondaryPress }) => {
  const navigation = useNavigation();
  const [titulo, setTitulo] = useState('');
  const [password, setPassword] = useState(''); // Estado para a senha
  const [isLoading, setIsLoading] = useState(false); // Estado para o isLoading

  const AuthContext = useAuth();
  const { setError } = useError();

  // Função para lidar com o login
  const handleLogin = async () => {
    setIsLoading(false); // Inicia o loading
    try {
      // Autenticar o usuário
      const response = await autenticar({
        TITULO: titulo,
        SENHA: password
      });

      if (response.data[0].ERRO) {
        setError(response.data[0].MSG_ERRO);
        throw new Error(response.data[0].MSG_ERRO);
      }

      navigation.navigate('(tabs)');
    } catch (error) {
      console.error(error);
      // Exibir mensagem de erro para o usuário (pode ser um toast ou alerta)
    } finally {
      setIsLoading(false); // Finaliza o loading
    }
  };

  return (
    <LoginComponent
      visible={visible}
      onClose={onClose}
      onPrimaryPress={handleLogin} // Ação ao clicar em "Entrar"
      primaryButtonLabel="Entrar"
      onSecondaryPress={onSecondaryPress} // Ação ao clicar em "Criar nova senha"
      secondaryButtonLabel="Nova Senha"
      onTitleChange={setTitulo} // Atualiza o estado do email
      onPasswordChange={setPassword} // Atualiza o estado da senha
      isLoading={isLoading} // Passa o estado isLoading para o componente
    />
  );
};

export default Login;
