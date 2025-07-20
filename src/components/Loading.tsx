import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Animation from 'lottie-react-native';
import LogoAnimation from '@/assets/animations/logo.json';

export interface LoadingProps {
  isLoading: boolean;
  message?: string; // Mensagem que será exibida durante o carregamento
}

const size = 200; // Tamanho da animação

export const Loading: React.FC<LoadingProps> = ({ isLoading, message = "Aguarde, estamos buscando a informação" }) => {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: backgroundColor,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      color: textColor,
      textAlign: 'center',
    },
    animatedLogo: {
      width: size,
      height: size,
      alignSelf: 'center',
    },
  });

  if (!isLoading) return null;

  return (
    <View style={styles.container}>
      <Animation
        source={LogoAnimation}
        autoPlay
        loop
        style={styles.animatedLogo}
      />
      <ThemedText style={styles.loadingText}>{message}</ThemedText>
    </View>
  );
};
