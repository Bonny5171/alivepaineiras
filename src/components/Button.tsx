import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Definindo os tipos das propriedades do componente
interface ButtonProps {
  onPress: () => void;
  label: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary'; // Variante do botão
  backgroundColor?: string; // Cor de fundo personalizada
  textColor?: string; // Cor do texto personalizada
  style?: ViewStyle; // Estilos personalizados para o contêiner
  textStyle?: TextStyle; // Estilos personalizados para o texto
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  label,
  isLoading = false,
  variant = 'primary', // Variante padrão
  backgroundColor,
  textColor,
  style,
  textStyle,
}) => {
  // Define as cores com base na variante (primary ou secondary)
  const buttonBackground = backgroundColor
    ? backgroundColor
    : variant === 'primary'
    ? '#007BFF' // Cor padrão para primary
    : 'transparent'; // Cor padrão para secondary

  const buttonTextColor = textColor
    ? textColor
    : variant === 'primary'
    ? '#FFFFFF' // Cor padrão do texto para primary
    : '#000000'; // Cor padrão do texto para secondary

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: buttonBackground }, style]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={buttonTextColor} />
      ) : (
        <Text style={[styles.buttonText, { color: buttonTextColor }, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Estilos
const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;