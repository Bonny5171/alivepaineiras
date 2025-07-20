import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './ui/IconSymbol';

interface Props {
  avatar?: string;
  name?: string;
  isSelected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  customStyles?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export default function AssociateAvatar({ 
  avatar, 
  name, 
  isSelected = false, 
  selectable = false, 
  disabled = false, 
  customStyles, 
  style,
  onPress 
}: Props) {
  const textColor = useThemeColor({}, 'text');

  const handlePress = () => {
    if (selectable && !disabled && onPress) {
      onPress();
    }
  };

  // Extrair as iniciais do nome se não houver avatar
  const getInitials = () => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0][0];
  };

  const ItemContainer = selectable && !disabled ? TouchableOpacity : View;

  return (
    <ItemContainer
      style={[
        styles.associateItem,
        customStyles,
        (selectable && isSelected && !disabled) && { opacity: 1 },
        ((selectable && !isSelected) || disabled) && { opacity: 0.6 }
      ]}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      {avatar ? (
        <View style={[styles.avatarImageContainer, isSelected && selectable && !disabled && styles.selectedAvatarContainer]}>
          <Image source={{ uri: avatar }} style={[styles.avatarImage]} />
        </View>
      ) : name === 'Todos' ? (
        <View style={[styles.initialsAvatar, isSelected && selectable && !disabled && styles.selectedAvatarContainer]}>
          <IconSymbol name="users" color="#0F1C47" size={28} />
        </View>
      ) : (
        <View style={[styles.initialsAvatar, isSelected && selectable && !disabled && styles.selectedAvatarContainer]}>
          <Text>{getInitials()}</Text>
        </View>
      )}
      {name && (
        <></>
      )}
    </ItemContainer>
  );
}

const styles = StyleSheet.create({
  "associateItem": {
    "alignItems":"center",
    "width": 40
  },
  "avatarImageContainer": {
    "width": 40,
    "height": 40,
    "borderRadius": 28,
    "overflow": "hidden"
  },
  "avatarImage": {
    "width": 40,
    "height": 40,
    "borderRadius": 28
  },
  "initialsAvatar": {
    "width": 40,
    "height": 40,
    "borderRadius": 28,
    "backgroundColor": "#eee",
    "justifyContent": "center",
    "alignItems": "center"
  },
  "selectedAvatarContainer": {
    "borderWidth": 3,
    "borderColor": "#D53F8C",
    "shadowColor": "#D53F8C",
    "shadowOffset": { "width": 0, "height": 0 },
    "shadowOpacity": 0.5,
    "shadowRadius": 4,
    "elevation": 4
  }
});