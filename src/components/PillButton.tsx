import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { unicodeToChar } from '@/api/app/appTransformer';
import { ThemedText } from './ThemedText';

interface PillButtonProps {
  icon?: string; // Ícone (Unicode ou nome do ícone)
  iconLibrary?: 'material' | 'fontawesome'; // Biblioteca do ícone (opcional)
  title: string; // Título do botão
  onPress?: () => void; // Função de callback ao pressionar
  style?: ViewStyle; // Estilo personalizado para o container do botão
  textStyle?: TextStyle; // Estilo personalizado para o texto
}

const PillButton: React.FC<PillButtonProps> = ({
  icon,
  iconLibrary,
  title,
  onPress,
  style,
  textStyle,
}) => {
  const activeBackground = useThemeColor({}, 'activeBackground'); // Obtém a cor de fundo dinamicamente

  return (
    <TouchableOpacity
      style={[styles.pillButton, { backgroundColor: activeBackground }, style]} // Mescla estilos
      onPress={onPress}
    >
      {icon && (
        <>
          {!icon.startsWith("U+") ? (
            <View style={styles.iconContainer}>
              <IconSymbol
                color="white"
                name={icon}
                size={20}
                library={iconLibrary}
              />
            </View>
          ) : (
            <View style={styles.icon}>
              <Text style={{fontSize:19}}>{unicodeToChar(icon)}</Text>
            </View>
          )}
        </>
      )}
      <ThemedText style={[styles.title, textStyle]}>{title}</ThemedText> {/* Mescla estilos de texto */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20, // Bordas arredondadas para o efeito "pill"
  },
  iconContainer: {
    marginRight: 8, // Espaçamento entre o ícone e o texto
  },
  icon: {
    marginRight: 8, // Espaçamento entre o ícone Unicode e o texto
  },
  title: {
    fontSize: 16,
  },
});

export default PillButton;