import React from 'react';
import { BottomSheet } from '../BottomSheet';
import { InputComponent } from '../Input';
import { ThemedView } from '../ThemedView';

// Definindo a interface para os props
interface LoginProps {
  onClose: () => void;
  onPrimaryPress: () => void;
  primaryButtonLabel: string;
  onSecondaryPress: () => void;
  secondaryButtonLabel: string;
  visible: boolean;
  onTitleChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  isLoading?: boolean;
}

// Usando os props no componente
export default function LoginComponent({
  onClose,
  onPrimaryPress,
  primaryButtonLabel,
  onSecondaryPress,
  secondaryButtonLabel,
  visible,
  onTitleChange,
  onPasswordChange,
  isLoading = false, // Valor padrão para isLoading
}: LoginProps) {
  return (
    <ThemedView>
      <BottomSheet
        onClose={onClose}
        onPrimaryPress={onPrimaryPress}
        primaryButtonLabel={primaryButtonLabel}
        onSecondaryPress={onSecondaryPress}
        secondaryButtonLabel={secondaryButtonLabel}
        visible={visible}
        isLoading={isLoading}
      >
        <InputComponent
          onChangeText={onTitleChange}
          label='TITULO'
          keyboardType='number-pad'
        />
        <InputComponent
          onChangeText={onPasswordChange}
          label='SENHA'
          password={true}
          keyboardType='number-pad'
        />
      </BottomSheet>
    </ThemedView>
  );
}