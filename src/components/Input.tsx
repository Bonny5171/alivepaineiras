import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './ui/IconSymbol';

export interface InputProps extends TextInputProps {
  label?: string;
  password?: boolean;
  backgroundColorProp?: string;
  textColorProp?: string;
  leftComponent?: React.ReactNode; // Novo: componente à esquerda
}

export const InputComponent: React.FC<InputProps> = ({
  label,
  password = false,
  secureTextEntry,
  backgroundColorProp,
  textColorProp,
  leftComponent, // Novo: prop
  ...rest
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const backgroundColor = backgroundColorProp ? backgroundColorProp : useThemeColor({}, 'background2');
  const textColor = textColorProp ? textColorProp : useThemeColor({}, 'text');
  const textLabelColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: textLabelColor }]}>{label}</Text>}
      <View style={[styles.inputContainer, { backgroundColor }]}>  
        {leftComponent && (
          <View style={{ marginRight: 8 }}>{leftComponent}</View>
        )}
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholderTextColor={textColor}
          secureTextEntry={password && !isPasswordVisible}
          {...rest}
        />
        {password && (
          <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)}>
            <IconSymbol
              name={isPasswordVisible ? 'eye-slash' : 'eye'}
              size={22}
              color={"#5A69E2"}
              library='fontawesome'
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    paddingHorizontal: 12,
    color: '#0F1C4799',
    fontSize: 13,
    fontWeight: '400',
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
});
