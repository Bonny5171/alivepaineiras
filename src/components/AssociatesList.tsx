import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Filter } from '@/api/app/appTypes';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './ui/IconSymbol';

interface Props {
  associates: Filter[];
  selectedAssociate?: Filter | null;
  customStyles?: StyleProp<ViewStyle>
  onSelectAssociate?: (associate: Filter) => void;
  selectable?: boolean;
  disabled?: boolean; // Adiciona prop para desabilitar seleção
}

export default function AssociatesList({ associates, selectedAssociate, customStyles, onSelectAssociate, selectable = false, disabled = false }: Props) {
   const textColor = useThemeColor({}, 'text');

  const handlePress = (associate: Filter) => {
    if (selectable && !disabled && onSelectAssociate) {
      console.log('Associado selecionado:', associate.TITULO);
      onSelectAssociate(associate);
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.associatesRow, customStyles]}>
      {associates.map((a, idx) => {
        const isSelected = selectedAssociate ? selectedAssociate.TITULO == a.TITULO : false;
        const ItemContainer = selectable && !disabled ? TouchableOpacity : View;

        // Extrair as iniciais do nome se não houver avatar
        const getInitials = () => {
          if (!a.NOME) return '';
          const nameParts = a.NOME.split(' ');
          if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[1][0]}`;
          }
          return nameParts[0][0];
        };

        return (
          <ItemContainer
            key={`associate-${idx}`}
            style={[
              styles.associateItem,
              (selectable && isSelected && !disabled) && { opacity: 1 },
              ((selectable && !isSelected) || disabled) && { opacity: 0.6 }
            ]}
            activeOpacity={0.7}
            onPress={() => handlePress(a)}
          >
            {a.AVATAR ? (
              <View style={[styles.avatarImageContainer, isSelected && selectable && !disabled && styles.selectedAvatarContainer]}>
                <Image source={{ uri: a.AVATAR }} style={styles.avatarImage} />
              </View>
            ) : a.NOME === 'Todos' ? (
              <View style={[styles.initialsAvatar, isSelected && selectable && !disabled && styles.selectedAvatarContainer]}>
                <IconSymbol name="users" color="#0F1C47" size={28} />
              </View>
            ) : (
              <View style={[styles.initialsAvatar, isSelected && selectable && !disabled && styles.selectedAvatarContainer]}>
                <Text>{getInitials()}</Text>
              </View>
            )}
            <Text
              style={[styles.associateName, { color: textColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {a.NOME}
            </Text>
          </ItemContainer>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  associatesRow: { flexDirection: 'row', marginBottom: 16 },
  associateItem: { alignItems: 'center', marginRight: 12, width: 56 },
  avatarImageContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  initialsAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  defaultAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', borderColor: '#D53F8C', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  defaultIcon: { fontSize: 24 },
  associateName: { fontSize: 12, marginTop: 4, color: '#333', flex: 1 },
  selectedAvatarContainer: { borderWidth: 3, borderColor: '#D53F8C', shadowColor: '#D53F8C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 },
  selectedName: { fontWeight: 'bold' },
});