import React, { useEffect, useState } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dismissible?: boolean;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  isLoading?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  dismissible = true,
  onPrimaryPress,
  onSecondaryPress,
  primaryButtonLabel = 'Confirmar',
  secondaryButtonLabel = 'Cancelar',
  isLoading = false,
}) => {
  const activeBackground = useThemeColor({}, 'activeBackground');
  const buttonBackground = useThemeColor({}, 'buttonBackground');
  const brand = useThemeColor({}, 'brand');
  const textColor = useThemeColor({}, 'text');
  
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(1);
        setIsKeyboardVisible(true);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      width: '100%',
      padding: 25,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 25, // Ajusta o padding quando o teclado está visível
    },
    content: {
      paddingBottom: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 17,
      fontWeight: 'bold',
    },
  });

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={dismissible ? onClose : undefined}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={dismissible ? onClose : undefined}
        />
        <View style={[styles.container, { backgroundColor: activeBackground }]}>
          <View style={styles.content}>{children}</View>

          <View style={styles.buttonContainer}>
            {onSecondaryPress && (
              <TouchableOpacity
                style={[styles.button]}
                onPress={onSecondaryPress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={textColor} />
                ) : (
                  <Text style={[styles.buttonText, { color: textColor }]}>
                    {secondaryButtonLabel}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {onPrimaryPress && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryButtonLabel === 'Sim, refazer' ? '#DA1984' : brand }]}
                onPress={onPrimaryPress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={textColor} />
                ) : (
                  <Text style={[styles.buttonText, { color: 'white' }]}>
                    {primaryButtonLabel}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};