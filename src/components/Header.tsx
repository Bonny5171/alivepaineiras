import React from 'react';
import { StatusBar, SafeAreaView, View, Platform, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useNavigation } from '@react-navigation/native';
import { IconSymbol } from './ui/IconSymbol';

const brand = '#DA1984';

interface HeaderProps {
  title: string;
  backRoute?: string;
  bigTitle?: boolean;
  transparent?: boolean; // nova prop
  arrowText?: string; // novo prop para customizar texto da seta
}

const Header: React.FC<HeaderProps> = ({ title, backRoute, bigTitle, transparent }) => {
  const navigation = useNavigation();

  const backgroundColor = transparent ? 'transparent' : brand;

  // Função para checar se a tela anterior é (tabs)
  let showMenu = false;
  if (bigTitle) {
    try {
      // @ts-ignore
      const state = navigation.getState && navigation.getState();
      const routes = state?.routes || [];
      const prevRoute = routes.length > 1 ? routes[routes.length - 2] : undefined;
      showMenu = prevRoute?.name === '(tabs)';
    } catch (e) {
      showMenu = false;
    }
  }

  return (
    <>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={'light-content'}
      />
      <SafeAreaView
        style={{
          backgroundColor,
          paddingTop: 0,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (backRoute) {
              navigation.goBack()
            } else {
              navigation.goBack()
            }
          }}
          style={{
            backgroundColor,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 15,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            marginTop: Platform.OS === 'ios' ? -20 : 30,
          }}
        >
          <View
            style={{ marginRight: 8 }}
          >
            <IconSymbol name="chevron-left" library='fontawesome' size={20} color="#fff" />
          </View>
          <ThemedText
            style={{
              fontSize: 20,
              fontWeight: '400',
              color: '#fff',
            }}
          >
            {bigTitle ? (showMenu ? 'Menu' : 'Voltar') : title}
          </ThemedText>
        </TouchableOpacity>
        {bigTitle && (
          <View style={{ alignItems: 'flex-start', marginTop: 0, marginBottom: 10, paddingLeft: 16 }}>
            <ThemedText
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                color: '#fff',
                textAlign: 'left',
              }}
            >
              {title}
            </ThemedText>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default Header;