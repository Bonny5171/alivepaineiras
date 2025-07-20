import React, { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { InputComponent } from './Input';
import { ThemedView } from './ThemedView';
import { Text, View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ConfirmActionProps {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmButtonLabel: string;
  onCancel: () => void;
  cancelButtonLabel: string;
  visible: boolean;
  onPasswordChange: (text: string) => void;
  isLoading?: boolean;
  beforePasswordComponent?: React.ReactNode;
  beforePasswordComponents?: React.ReactNode[];
  abovePasswordComponent?: React.ReactNode;
  canConfirm?: boolean;
  setCanConfirm?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ConfirmActionComponent({
  title,
  onClose,
  onConfirm,
  confirmButtonLabel,
  onCancel,
  cancelButtonLabel,
  visible,
  onPasswordChange,
  isLoading = false,
  beforePasswordComponent,
  beforePasswordComponents,
  abovePasswordComponent,
  canConfirm = true,
  setCanConfirm,
}: ConfirmActionProps) {
  const [step, setStep] = useState(0);

  const titleTextColor = useThemeColor({}, 'titleText');
  const redTextColor = useThemeColor({}, 'redText');
  const background1Color = useThemeColor({}, 'background1');

  useEffect(() => {
    if (visible) setStep(0);
  }, [visible]);

  const steps = beforePasswordComponents && beforePasswordComponents.length > 0
    ? beforePasswordComponents
    : beforePasswordComponent
      ? [beforePasswordComponent]
      : [];
  const totalSteps = steps.length;
  const isLastStep = step === totalSteps;

  return (
    <ThemedView>
      <BottomSheet
        onClose={onClose}
        onPrimaryPress={isLastStep ? onConfirm : () => setStep(s => s + 1)}
        primaryButtonLabel={isLastStep ? confirmButtonLabel : 'Continuar'}
        onSecondaryPress={onCancel}
        secondaryButtonLabel={cancelButtonLabel}
        visible={visible}
        isLoading={isLoading}
      >
        {/* Só mostra o título na etapa da senha, se NÃO houver abovePasswordComponent */}
        {isLastStep && !abovePasswordComponent && (
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: titleTextColor }]}>{title}</Text>
          </View>
        )}
        {/* Wizard: mostra só o componente da etapa atual */}
        {totalSteps > 0 && step < totalSteps && (
          React.isValidElement(steps[step])
            ? React.cloneElement(steps[step] as React.ReactElement<any>, { setCanConfirm })
            : steps[step]
        )}
        {/* Só mostra o componente acima da senha na última etapa */}
        {isLastStep && abovePasswordComponent}
        {/* Só mostra o campo de senha na última etapa */}
        {isLastStep && (
          <InputComponent
            onChangeText={onPasswordChange}
            label="SENHA"
            password={true}
            keyboardType='number-pad'
            backgroundColorProp={background1Color}
          />
        )}
        {/* Desabilita o botão Confirmar se não puder confirmar */}
        {isLastStep && !canConfirm && (
          <Text style={{ color: redTextColor, textAlign: 'center', marginTop: 8 }}>
            Preencha os requisitos para confirmar.
          </Text>
        )}
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});