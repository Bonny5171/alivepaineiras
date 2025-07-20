import Header from '@/components/Header';
import { Wrapper } from '@/components/Wrapper';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TicketForm() {
    const route = useRoute();
    // @ts-ignore
    const initialBarcode = route.params && 'barcode' in route.params ? String(route.params.barcode) : '';
    const [barcode, setBarcode] = useState<string>(initialBarcode);
    const navigation = useNavigation();

    const background = useThemeColor({}, 'background');
    const background2 = useThemeColor({}, 'background2');
    const text2 = useThemeColor({}, 'text2');

    return (
        <>
            <Header title='Código'/>
            <Wrapper
                style={[styles.container, { backgroundColor: background }]}
                primaryButtonLabel='Avançar'
                onPrimaryPress={() => {navigation.navigate('ticketConfirm', { barcode: String(barcode) })}}
            >
                <Text style={[styles.title, { color: text2 }]}>
                    Digite o número que se encontra abaixo do código de barras.
                </Text>
                <Text style={[styles.label, { color: '#6f7791' }]}>NÚMERO DO CÓDIGO DE BARRAS</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: background2, color: text2 }]}
                    value={barcode}
                    onChangeText={setBarcode}
                    keyboardType="numeric"
                    placeholder="2323111124"
                    placeholderTextColor="#6b6b6b"
                    maxLength={20}
                />
            </Wrapper>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '500',
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 8,
        marginLeft: 8,
    },
    input: {
        fontSize: 22,
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 16,
    },
});