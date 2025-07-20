import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import DropDownPicker from 'react-native-dropdown-picker';
import { useColorScheme } from '@/hooks/useColorScheme';

const DropdownPicker = ({
  items,
  onChangeValue,
}) => {
  const colorScheme = useColorScheme();
  const [selected, setSelected] = useState(items?.[0]?.value ?? '');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(items?.[0]?.value ?? '');

  const inputBackground = useThemeColor({}, 'inputBackground2');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const placeholderTextColor = useThemeColor({}, 'placeholderText');
  const brandColor = useThemeColor({}, 'brand');
  const iconAccent = useThemeColor({}, 'iconAccent');

  return (
    <View>
      <ThemedText style={styles.label}>O que te chamou mais atenção?</ThemedText>

      {Platform.OS === 'ios' ? (
        <View style={styles.pickerWrapper}>
          <Picker
            style={{
              backgroundColor: colorScheme === 'dark' ? inputBackground : '#f0f0f0',
              borderRadius: 8,
              color: colorScheme === 'dark' ? textColor : '#333',
            }}
            selectedValue={selected}
            onValueChange={(itemValue) => {
              setSelected(itemValue);
              onChangeValue(itemValue); // agora envia o value
            }}
          >
            {items.map(item => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
      ) : (
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={(callback) => {
            const newValue = callback(value); // obtém o valor novo
            setValue(() => newValue);         // atualiza o estado local
            onChangeValue(items[newValue].value);         // dispara sua função externa
          }}
          setItems={(asd) => {
            console.log('asd >>', asd)
          }}

          theme={colorScheme === 'dark' ? 'DARK' : 'LIGHT'}

          // 🎨 Estilo geral do botão (fechado)
          style={{
            backgroundColor: colorScheme === 'dark' ? inputBackground : '#fff',
            borderColor: colorScheme === 'dark' ? borderColor : '#ccc',
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 10,
          }}

          // 🎯 Estilo do texto selecionado
          textStyle={{
            fontSize: 16,
            color: colorScheme === 'dark' ? textColor : '#333',
          }}

          // ⬇️ Estilo do container dos itens abertos
          dropDownContainerStyle={{
            backgroundColor: colorScheme === 'dark' ? '#071030' : '#fff',
            borderColor: colorScheme === 'dark' ? borderColor : '#ccc',
            borderWidth: 1,
            borderRadius: 10,
          }}

          // ✅ Estilo do item selecionado
          selectedItemContainerStyle={{
            backgroundColor: colorScheme === 'dark' ? brandColor : '#DA1984',
          }}
          selectedItemLabelStyle={{
            color: colorScheme === 'dark' ? '#fff' : '#fff',
            fontWeight: 'bold',
          }}

          // 🔁 Ícones
          listItemLabelStyle={{
            color: colorScheme === 'dark' ? textColor : '#333',
            fontSize: 16,
          }}

          arrowIconStyle={{
            tintColor: colorScheme === 'dark' ? iconAccent : '#3F51B5',
          }}

          // Opcional: placeholder
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

export default DropdownPicker;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerWrapper: {
    borderRadius: 8,
  },
});
