import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface FileUploadBoxProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({ label, onPress, disabled }) => {
  const tertiaryText = useThemeColor({}, 'tertiaryText');
  const background1 = useThemeColor({}, 'background1');
  const accent = useThemeColor({}, 'accent');
  const border = useThemeColor({}, 'border');

  return (
    <View style={[styles.container, { backgroundColor: background1 }]}>
      <TouchableOpacity
        style={[styles.box, { borderColor: border }, disabled && styles.boxDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <IconSymbol color={tertiaryText} name="file" size={40} />
        <Text style={[styles.text, { color: accent }]}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  box: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
  },
});

export default FileUploadBox;