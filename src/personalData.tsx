import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Wrapper } from '@/components/Wrapper';
import { InputComponent } from '@/components/Input';
import { useRoute } from '@react-navigation/native';
import Header from '@/components/Header';
import { alterarCadastro } from '@/api/app/associados';
import { getAuthContext } from '@/providers/AuthProvider';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function PersonalData() {
  const route = useRoute();
  const { profile } = route.params;

  let selectedProfile = {
    NOME: '',
    EMAIL: '',
    TELEFONE: '',
    DTNASCTO: '',
  };

  try {
    if (typeof profile === 'string' && profile.trim() !== '' && profile !== 'undefined') {
      selectedProfile = JSON.parse(profile);
    } else {
      console.warn('Profile is not a valid string:', profile);
    }
  } catch (error) {
    console.error('Erro ao parsear profile:', error);
  }

  const [email, setEmail] = useState(selectedProfile.EMAIL || '');
  const [phone, setPhone] = useState(selectedProfile.TELEFONE || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const backgroundColor = useThemeColor({}, 'background');
  const background2Color = useThemeColor({}, 'background2');
  const disabledTextColor = useThemeColor({}, 'disabledText');
  const disabledBackgroundColor = useThemeColor({}, 'disabledBackground');
  const inputBackgroundColor = useThemeColor({}, 'inputBackground');
  const brandColor = useThemeColor({}, 'brand');
  const disabledBrandColor = useThemeColor({}, 'disabledBrand');
  const redTextColor = useThemeColor({}, 'redText');
  const successBackgroundColor = useThemeColor({}, 'successBackground');
  const reversedTextColor = useThemeColor({}, 'reversedText');

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return date.split(' ')[0].split('-').reverse().join('/');
  };

  useEffect(() => {
    const emailChanged = email !== (selectedProfile.EMAIL || '');
    const phoneChanged = phone.replace(/\D/g, '') !== (selectedProfile.TELEFONE || '').replace(/\D/g, '');
    setHasChanges(emailChanged || phoneChanged);
  }, [email, phone, selectedProfile]);

  const showSuccessToast = () => {
    setShowToast(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 2500);
    });
  };

  const validateInputs = () => {
    if (!email.includes('@') || !email.includes('.')) {
      setError('Digite um e-mail válido');
      return false;
    }
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10 || cleanedPhone.length > 11) {
      setError('Digite um telefone válido (10 ou 11 dígitos)');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError(null);

    if (!validateInputs()) {
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    const context = getAuthContext();

    try {
      const response = await alterarCadastro({
        TITULO: context.user,
        CHAVE: context.chave,
        EMAIL: email,
        CELULAR: cleanedPhone,
      });

      if (response.length > 0 && response[0].ERRO) {
        setError(response[0].MSG_ERRO || 'Erro ao salvar os dados.');
      } else {
        setError(null);
        showSuccessToast();
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setError('Ocorreu um erro ao salvar os dados. Verifique sua conexão.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Dados Pessoais" backRoute="/profile" />
      <Wrapper>
        <View style={{ paddingHorizontal: 16, paddingVertical: 32 }}>
          <InputComponent
            onChangeText={() => {}}
            label="Nome"
            value={selectedProfile.NOME}
            editable={false}
            textColorProp={disabledTextColor}
            backgroundColorProp={disabledBackgroundColor}
          />
          <InputComponent
            onChangeText={(text) => setEmail(text)}
            label="Email"
            value={email}
            editable={true}
            keyboardType="email-address"
            autoCapitalize="none"
            backgroundColorProp={inputBackgroundColor}
          />
          <InputComponent
            onChangeText={(text) => {
              const formatted = formatPhone(text);
              setPhone(formatted);
            }}
            label="Telefone"
            value={phone}
            editable={true}
            keyboardType="phone-pad"
            backgroundColorProp={inputBackgroundColor}
          />
          <InputComponent
            onChangeText={() => {}}
            label="Data de Nascimento"
            value={formatDate(selectedProfile.DTNASCTO)}
            editable={false}
            textColorProp={disabledTextColor}
            backgroundColorProp={disabledBackgroundColor}
          />
          {error && <Text style={[styles.errorText, { color: redTextColor }]}>{error}</Text>}
        </View>
      </Wrapper>
      <View style={[styles.botaoContainer, { backgroundColor: background2Color }]}>
        <TouchableOpacity
          disabled={!hasChanges}
          onPress={handleSave}
          style={[
            styles.botao,
            { backgroundColor: hasChanges ? brandColor : disabledBrandColor },
          ]}
        >
          <Text style={styles.textoBotao}>Salvar</Text>
        </TouchableOpacity>
      </View>

      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim, backgroundColor: successBackgroundColor }]}>
          <Text style={[styles.toastTitle, { color: reversedTextColor }]}>✅ Tudo certo!</Text>
          <Text style={[styles.toastMessage, { color: reversedTextColor }]}>Dados salvos com sucesso!</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  botaoContainer: {
    width: '100%',
    paddingTop: 6,
    paddingBottom: 35,
    paddingHorizontal: 16,
  },
  botao: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
    marginTop: 10,
    marginLeft: 15,
  },
  toast: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  toastMessage: {
    fontSize: 13,
    marginTop: 4,
  },
});

export const unstable_settings = {
  initialRouteName: 'personalData',
  screenOptions: {
    headerShown: false,
  },
};