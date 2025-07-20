import { useThemeColor } from '@/hooks/useThemeColor';
import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableHighlight,
  Text,
} from 'react-native';
import { Loading } from './Loading';

export interface WrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  refreshing?: boolean;
  isButtonLoading?: boolean;
  onRefresh?: () => void;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  useScrollView?: boolean;
  rowButton?: boolean;
  style?: any;
  isPrimaryButtonDisabled?: boolean;
}

export interface WrapperRef {
  scrollToBottom: () => void;
}

export const Wrapper = forwardRef<WrapperRef, WrapperProps>(({
  children,
  isLoading = false,
  refreshing = false,
  isButtonLoading = false,
  onRefresh,
  onPrimaryPress,
  onSecondaryPress,
  primaryColor,
  secondaryColor,
  primaryButtonLabel = 'Cancelar',
  secondaryButtonLabel = 'Confirmar',
  useScrollView = true,
  rowButton = false,
  style = false,
  isPrimaryButtonDisabled = false,
}, ref) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const redTextColor = useThemeColor({}, 'redText');
  const lightPinkButton = useThemeColor({}, 'lightPinkButton');
  const brand = useThemeColor({}, 'brand');
  const scrollViewRef = useRef<ScrollView>(null);

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    },
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: backgroundColor,
    },
    scrollContent: {
      flexGrow: 1,
    },
    buttonContainer: {
      flexDirection: rowButton ? 'row' : 'column',
      gap: 8,
      paddingBottom: 30,
      paddingHorizontal: 25,
      paddingTop: 10,
    },
    button: {
      width: rowButton ? '50%' : '100%',
      padding: 12,
      borderRadius: 16,
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 1,
    },
    buttonText: {
      fontSize: 17,
      fontWeight: '600',
    },
  });

  const renderContent = () => {
    if (useScrollView) {
      return (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, style]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          nestedScrollEnabled
        >
          {children}
        </ScrollView>
      );
    } else {
      return <View style={[styles.scrollContent, style]}>{children}</View>;
    }
  };

  return (
    <>
      {isLoading ? (
        <View style={{ flex: 1 }}>
          <Loading
            isLoading={isLoading}
            message="Aguarde, estamos buscando a informação"
          />
        </View>
      ) : (
        <>
          <View style={[styles.container, { backgroundColor }]}>
            {renderContent()}
          </View>
          {(onPrimaryPress || onSecondaryPress) && (
            <View style={styles.buttonContainer}>
              {onSecondaryPress && (
                <TouchableHighlight
                  style={[
                    styles.button,
                    { backgroundColor: lightPinkButton },
                    isButtonLoading && styles.disabledButton,
                  ]}
                  underlayColor="#ccc"
                  onPress={isButtonLoading ? undefined : onSecondaryPress}
                  disabled={isButtonLoading}
                >
                  {isButtonLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={secondaryColor || redTextColor}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        { color: secondaryColor || redTextColor },
                      ]}
                    >
                      {secondaryButtonLabel}
                    </Text>
                  )}
                </TouchableHighlight>
              )}
              {onPrimaryPress && (
                <TouchableHighlight
                  style={[
                    styles.button,
                    { backgroundColor: primaryColor || brand },
                    (isButtonLoading || isPrimaryButtonDisabled) &&
                      styles.disabledButton,
                  ]}
                  underlayColor="#ccc"
                  onPress={
                    isButtonLoading || isPrimaryButtonDisabled
                      ? undefined
                      : onPrimaryPress
                  }
                  disabled={isButtonLoading || isPrimaryButtonDisabled}
                >
                  {isButtonLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={[styles.buttonText, { color: 'white' }]}>
                      {primaryButtonLabel}
                    </Text>
                  )}
                </TouchableHighlight>
              )}
            </View>
          )}
        </>
      )}
    </>
  );
});
