import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import DropDownPicker from 'react-native-dropdown-picker';

interface DropdownFormPickerProps {
  anuncioItems: { value: string; label: string }[];
  onChangeValue: (value: string) => void;
  selectedValue?: string;
}

const DropdownFormPicker: React.FC<DropdownFormPickerProps> = ({ anuncioItems, onChangeValue, selectedValue }) => {
  const colorScheme = useColorScheme();
  const [anuncioOpen, setAnuncioOpen] = useState(false);
  const [anuncioValue, setAnuncioValue] = useState('');

  const inputBackground = useThemeColor({}, 'inputBackground2');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const placeholderTextColor = useThemeColor({}, 'placeholderText');
  const brandColor = useThemeColor({}, 'brand');
  const iconAccent = useThemeColor({}, 'iconAccent');


  // Sincronizar anuncioValue com selectedValue e anuncioItems
  useEffect(() => {
    if (anuncioItems && anuncioItems.length > 0) {
      if (selectedValue && anuncioItems.some(item => item.value === selectedValue)) {
        setAnuncioValue(selectedValue);
      } else {
        setAnuncioValue(anuncioItems[0].value);
        onChangeValue(anuncioItems[0].value); // Notifica o componente pai
      }
    } else {
      setAnuncioValue('');
    }
  }, [anuncioItems, selectedValue, onChangeValue]);

  // Gerar uma key única para forçar remontagem
  const dropdownKey = anuncioItems ? JSON.stringify(anuncioItems.map(item => item.value)) + selectedValue : 'empty';

  return (
    <View>
      {Platform.OS === 'ios' ? (
        <View style={styles.pickerWrapper}>
          <Picker
            style={{
              backgroundColor: colorScheme === 'dark' ? inputBackground : '#f0f0f0',
              borderRadius: 8,
              color: colorScheme === 'dark' ? textColor : '#333',
            }}
            selectedValue={anuncioValue}
            onValueChange={(itemValue) => {
              setAnuncioValue(itemValue);
              onChangeValue(itemValue);
            }}
          >
            {anuncioItems && anuncioItems.length > 0 ? (
              anuncioItems.map(item => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))
            ) : (
              <Picker.Item label="Nenhuma categoria disponível" value="" />
            )}
          </Picker>
        </View>
      ) : (
        <DropDownPicker
          key={dropdownKey} // Força remontagem com base em anuncioItems e selectedValue
          open={anuncioOpen}
          value={anuncioValue}
          items={anuncioItems || []}
          setOpen={setAnuncioOpen}
          setValue={(callback) => {
            const newValue = typeof callback === 'function' ? callback(anuncioValue) : callback;
            setAnuncioValue(newValue);
            onChangeValue(newValue);
          }}
          setItems={() => {}} // Não usado, mas necessário para o DropDownPicker
          theme={colorScheme === 'dark' ? 'DARK' : 'LIGHT'}
          listMode="SCROLLVIEW"
          style={{
            backgroundColor: colorScheme === 'dark' ? inputBackground : '#0F1C471A',
            borderColor: colorScheme === 'dark' ? borderColor : '#ccc',
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 10,
            zIndex: 1000, // Adicionado para evitar sobreposição no Android
          }}
          textStyle={{
            fontSize: 16,
            color: colorScheme === 'dark' ? textColor : '#333',
          }}
          dropDownContainerStyle={{
            backgroundColor: colorScheme === 'dark' ? '#071030' : '#E2E7F8',
            borderColor: colorScheme === 'dark' ? borderColor : '#ccc',
            borderWidth: 1,
            borderRadius: 10,
            zIndex: 1000, // Adicionado para o dropdown no Android
            maxHeight: 300,
          }}
          selectedItemContainerStyle={{
            backgroundColor: colorScheme === 'dark' ? brandColor : '#DA1984',
          }}
          selectedItemLabelStyle={{
            color: colorScheme === 'dark' ? '#fff' : '#fff',
            fontWeight: 'bold',
          }}
          listItemLabelStyle={{
            color: colorScheme === 'dark' ? textColor : '#333',
            fontSize: 16,
          }}
          arrowIconStyle={{
            tintColor: colorScheme === 'dark' ? iconAccent : '#3F51B5',
          }}
          placeholder="Selecione uma opção"
          placeholderStyle={{
            color: colorScheme === 'dark' ? placeholderTextColor : '#999',
            fontSize: 16,
          }}
        />
      )}
    </View>
  );
};

export default DropdownFormPicker;

const styles = StyleSheet.create({
  pickerWrapper: {
    borderRadius: 8,
  },
});