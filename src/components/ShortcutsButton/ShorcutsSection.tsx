import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ShortcutAction {
  title: string;
  icon: string;
  color: string;
  onPress: () => void
}

interface ShortcutsSectionProps {
  shortcutActions: ShortcutAction[];
}

const ShortcutsButtonComponent: React.FC<ShortcutsSectionProps> = ({ shortcutActions }) => {
  const activeBackground = useThemeColor({}, 'activeBackground');
  const textColor = useThemeColor({}, 'text');
  const text2Color = useThemeColor({}, 'text2');
  const lightPinkColor = useThemeColor({}, 'lightPink');

  const styles = StyleSheet.create({
    section: {
      padding: 0,
      marginVertical: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '400',
      textTransform: 'uppercase',
      color: textColor,
      marginBottom: 8,
    },
    shortcutsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    shortcutCard: {
      backgroundColor: lightPinkColor,
      padding: 16,
      borderRadius: 16,
      width: '31%',
    },
    iconContainer: {
      marginBottom: 5,
      alignItems: 'center',
    },
    shortcutLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: text2Color,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.section}>
      {shortcutActions.length > 1 && <ThemedText style={styles.sectionTitle}>Menu de Opções</ThemedText>}
      <View style={styles.shortcutsWrapper}>
        {shortcutActions.map((item, index) => (
          <TouchableOpacity onPress={item.onPress} key={index} style={styles.shortcutCard}>
            <View style={styles.iconContainer}>
              <IconSymbol library="fontawesome" name={item.icon} size={32} color="#DA1984"
              />
            </View>
            <ThemedText style={styles.shortcutLabel}>{item.title}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ShortcutsButtonComponent;