import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor'; // Ajuste o caminho conforme necessário
import { IconSymbol } from '../ui/IconSymbol';

interface HeaderButton {
  label: string;
  icon: string;
  onPress: () => void;
}

interface HeaderButtonsProps {
  buttons: HeaderButton[];
}

const IconButtonComponent: React.FC<HeaderButtonsProps> = ({ buttons }) => {
  const color = useThemeColor({ }, 'text');
  const activeBackground = useThemeColor({ }, 'activeBackground');
  const brand = useThemeColor({ }, 'brand');

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10, // Espaçamento entre os botões
    },
    button: {
      padding: 15,
      borderRadius: 10, // Bordas arredondadas
      backgroundColor: "#FFFFFF1A",
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {buttons.map((btn, index) => (
        <TouchableOpacity key={index} onPress={btn.onPress} style={styles.button}>
          <IconSymbol size={16} library="fontawesome" name={btn.icon} color={'white'} />
        </TouchableOpacity>
      ))}
    </View>
  );
  
};


export default IconButtonComponent;