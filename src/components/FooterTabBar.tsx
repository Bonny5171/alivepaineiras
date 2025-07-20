import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNavigation } from '@react-navigation/native';
interface FooterTabBarProps {
  activeTab?: string;
}

const FooterTabBar: React.FC<FooterTabBarProps> = ({ activeTab }) => {
  const navigation = useNavigation();
  const inactiveColor = '#878da3';

  const background2Color = useThemeColor({}, 'background2');
  const brand = useThemeColor({}, 'brand');

  const tabs = [
    {
      name: 'index',
      title: 'Início',
      icon: 'grid-2',
      route: '(tabs)',
    },
    {
      name: 'registrations',
      title: 'Inscrições',
      icon: 'badge-check',
      route: '(tabs)/(registrations)/home',
    },
    {
      name: 'agenda',
      title: 'Agenda',
      icon: 'calendar-day',
      route: '(tabs)/calendar',
    },
    {
      name: 'ticket',
      title: 'Ticket',
      icon: 'car',
      route: '(tabs)/ticket',
    },
    {
      name: 'buscar',
      title: 'Mais',
      icon: 'plus',
      route: '(tabs)/search',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: background2Color }]}>
      <View style={[styles.tabBar, { backgroundColor: background2Color }]}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.name;
          const color = isActive ? brand : inactiveColor;
          const TabButton = TouchableOpacity;

          const handlePress = () => {
            const state = navigation.getState && navigation.getState();
            const routes = state?.routes || [];
            const currentRoute = routes[routes.length - 1]?.name;

            if (tab.name === 'index') {
              const prevRoute = routes[routes.length - 2]?.name;
              if (prevRoute === '(tabs)') {
                navigation.goBack();
              } else if (currentRoute !== '(tabs)') {
                navigation.reset({
                  index: 0,
                  routes: [{ name: '(tabs)' as never }],
                });
              }
              // Se já está em (tabs), não faz nada
            } else {
              if (currentRoute !== tab.route) {
                navigation.reset({
                  index: 1,
                  routes: [
                    { name: '(tabs)' as never },
                    { name: tab.route as never },
                  ],
                });
              }
              // Se já está na rota de destino, não faz nada
            }
          };

          return (
            <TabButton
              key={tab.name}
              style={styles.tabButton}
              onPress={handlePress}
            >
              <IconSymbol
                size={20}
                name={tab.icon}
                color={color}
                faStyle='solid'
                library='fontawesome'
              />
              <ThemedText style={[styles.tabLabel, { color }]}>
                {tab.title}
              </ThemedText>
            </TabButton>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: Platform.select({
      ios: 30,
      android: 10,
    }),
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 0,
  },
});

export default FooterTabBar;
