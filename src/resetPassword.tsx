import React, { useState } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { InputComponent } from '@/components/Input';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { resetar, updatePassword } from '@/api/app/auth';
import { ToastAndroid, Platform } from 'react-native';

interface ResetPasswordProps {
  visible: boolean;
  onClose: () => void;
}

export default function ResetPassword({ visible, onClose }: ResetPasswordProps) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'senha'>('email');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [membership, setMembership] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const navigation = useNavigation();

  const handlePrimaryAction = async () => {
    if (step === 'email') {
      if (!email.includes('@')) {
        setError('Digite um e-mail válido');
        return;
      }

      try {
        const response = await resetar({ EMAIL: email });

        if (response.length > 0 && response[0].ERRO) {
          setError(response[0].MSG_ERRO || 'Erro desconhecido.');
          setSuccessMessage(null);
        } else {
          const { TITULO, SENHA } = response[0];
          setMembership(TITULO.replace(/-/g, ''));
          setCurrentPassword(SENHA);
          setError(null);
          setSuccessMessage(null);
          setStep('senha');
        }
      } catch (err) {
        setError('Erro ao solicitar redefinição de senha.');
        console.error(err);
      }

    } else if (step === 'senha') {
      if (newPassword !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      if (newPassword.length < 6 || newPassword.length > 10) {
        setError('A senha deve ter entre 6 e 10 números');
        return;
      }

      try {
        const response = await updatePassword({
          TITULO: membership,
          SENHA_ATUAL: currentPassword,
          NOVA_SENHA: newPassword,
        });
        
        if (Array.isArray(response) && response[0]?.ERRO) {
          setError(response[0].MSG_ERRO || 'Erro ao atualizar a senha.');
          return;
        }
        
        if (Platform.OS === 'android') {
          ToastAndroid.show('Senha atualizada com sucesso!', ToastAndroid.LONG);
        } else {
          alert('Senha atualizada com sucesso!');
        }
        
        setError(null);
        navigation.goBack();
        onClose();

      } catch (err) {
        setError('Erro ao atualizar a senha.');
        console.error(err);
      }
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccessMessage(null);
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setMembership('');
    setCurrentPassword('');
    setStep('email');
    onClose();
  };

  return (
    <BottomSheet
      onClose={handleClose}
      onPrimaryPress={handlePrimaryAction}
      primaryButtonLabel={step === 'email' ? 'Próxima' : 'Solicitar nova senha'}
      visible={visible}
    >
      {step === 'email' ? (
        <>
          <ThemedText>NOVA SENHA</ThemedText>
          <ThemedText style={{ fontWeight: '800', marginBottom: 30 }}>
            Informe seu e-mail para gerar uma nova senha
          </ThemedText>
          <InputComponent
            label='EMAIL'
            value={email}
            onChangeText={setEmail}
            backgroundColorProp='#0F1C471A'
            autoCapitalize='none'
            keyboardType='email-address'
          />
          <ThemedText style={{ marginTop: -15, fontSize: 13, marginLeft: 15, marginBottom: 20 }}>
            Endereço que está associado ao seu cadastro
          </ThemedText>
        </>
      ) : (
        <>
          <ThemedText>CRIAR NOVA SENHA</ThemedText>
          <ThemedText style={{ fontWeight: '800', marginBottom: 30 }}>
            Escolha uma nova senha
          </ThemedText>
          <InputComponent
            label='NOVA SENHA'
            value={newPassword}
            onChangeText={setNewPassword}
            backgroundColorProp='#0F1C471A'
            maxLength={10}
            password
            keyboardType='numeric'
          />
          <ThemedText style={{ marginTop: -15, fontSize: 13, marginLeft: 15, marginBottom: 20 }}>
            De 6 a 10 números
          </ThemedText>
          <InputComponent
            label='CONFIRMAR SENHA'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            backgroundColorProp='#0F1C471A'
            maxLength={10}
            password
            keyboardType='numeric'
          />
          <ThemedText style={{ marginTop: -15, fontSize: 13, marginLeft: 15, marginBottom: 20 }}>
            De 6 a 10 números
          </ThemedText>
        </>
      )}

      {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
      {successMessage && <ThemedText style={{ color: 'green' }}>{successMessage}</ThemedText>}
    </BottomSheet>
  );
}
