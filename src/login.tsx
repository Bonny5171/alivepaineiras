import {
    View,
    Text,
    Platform,
    StatusBar,
    TouchableOpacity,
    KeyboardAvoidingView
  } from 'react-native';
  import React, { useState } from 'react';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useThemeColor } from '@/hooks/useThemeColor';
  import Logo from '@/assets/svg/logo';
  import { Wrapper } from '@/components/Wrapper';
  import ResetPassword from './resetPassword';
  import { InputComponent } from '@/components/Input';
  import { useAuth } from '@/providers';
  import { autenticar } from '@/api/app/auth';
  import { useError } from '@/providers/ErrorProvider';
  import { useNavigation } from '@react-navigation/native';
  import { useColorScheme } from '@/hooks/useColorScheme';
  // import { version } from '../package.json';

  export default function Intro() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const brand = useThemeColor({}, 'brand');
    const colorScheme = useColorScheme();
    const [isResetPasswordVisible, setIsResetPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
  
    const AuthContext = useAuth();
    const { setError } = useError();
  
    const handleLogin = async () => {
      if (!titulo) {
        setError('Preencha o número do título para continuar.');
        return;
      }
      if (!password) {
        setError('Preencha a senha para continuar.');
        return;
      }
  
      setIsLoading(false);
  
      try {
        const response = await autenticar({ TITULO: titulo, SENHA: password });
  
        if (response.data[0].ERRO) {
          setError(response.data[0].MSG_ERRO);
          return;
        }
  
        navigation.reset({
          index: 0,
          routes: [{ name: '(tabs)' }],
        });
      } catch (error) {
        console.error(error);
        setError(response.data[0].MSG_ERRO);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <Wrapper
        isLoading={isLoading}
        onRefresh={() => {}}
        refreshing={false}
        onPrimaryPress={handleLogin}
        primaryButtonLabel='Entrar'
        isPrimaryButtonDisabled={!titulo || !password}
        rowButton
        onSecondaryPress={() => setIsResetPasswordVisible(true)}
        secondaryButtonLabel='Nova Senha'
        secondaryColor={colorScheme === 'dark' ? '#fff' : brand}
      >
        <ResetPassword
          onClose={() => setIsResetPasswordVisible(false)}
          visible={isResetPasswordVisible}
        />
        <StatusBar backgroundColor={backgroundColor} />
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: 'center',
            gap: 30,
            paddingHorizontal: 25,
            backgroundColor,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <Logo width={60} />
            <View>
              <Text style={{ color: brand, fontSize: 20, fontWeight: '800' }}>
                Clube Paineiras
              </Text>
              <Text style={{ color: brand, fontSize: 20, fontWeight: '800' }}>
                do Morumby
              </Text>
            </View>
          </View>
  
          <View style={{ width: '100%' }}>
            <InputComponent
              onChangeText={setTitulo}
              label='TÍTULO'
              keyboardType='number-pad'
              maxLength={6}
            />
            <Text style={{ paddingLeft: 20, marginTop: -10, color: textColor, marginBottom: 20 }}>
              Número de 6 dígitos
            </Text>
            <InputComponent
              onChangeText={setPassword}
              label='SENHA'
              password={true}
              keyboardType='number-pad'
              maxLength={10}
              onSubmitEditing={handleLogin}
            />
            <Text style={{ paddingLeft: 20, marginTop: -10, color: textColor, marginBottom: 20 }}>
              Número de 6 a 10 dígitos
            </Text>
  
            <Text
              style={{
                color: textColor,
                textAlign: 'left',
                marginTop: 15,
                fontSize: 13,
                fontWeight: '600',
                lineHeight: 24
              }}
            >
              Este aplicativo é exclusivo para associados do Clube Paineiras do Morumby.
            </Text>
            <Text
              style={{
                color: textColor,
                textAlign: 'justify',
                fontSize: 13,
                marginTop: 12,
                lineHeight: 24
              }}
            >
              Se você é um associado e ainda não tem acesso ao app, por favor, entre em contato com a central de atendimento do clube para realizar seu cadastro.
            </Text>
          </View>
  
          {/* <Text style={{ color: textColor, marginTop: 0, fontSize: 11, }}>Versão {version}</Text> */}
        </SafeAreaView>
      </Wrapper>
      </KeyboardAvoidingView>
    );
  }
  