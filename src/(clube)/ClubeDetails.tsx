import Header from '@/components/Header';
import { Wrapper } from '@/components/Wrapper';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

// Recebe os dados do local via route.params
export default function ClubeDetails({ route }: any) {
    const { local } = route.params;

    const background = useThemeColor({}, 'background');
    const background2 = useThemeColor({}, 'background2');
    const shadow = useThemeColor({}, 'shadow');
    const text2 = useThemeColor({}, 'text2');
    const tertiaryText = useThemeColor({}, 'tertiaryText');

    return (
        <>
            <Header title={local.NOME} />
            <Wrapper style={[styles.container, { backgroundColor: background }]}>
                <View style={[styles.imageContainer, { backgroundColor: background2 }]}>
                    <Image
                        source={{ uri: local.IMAGEM }}
                        style={styles.image}
                    />
                </View>
                <View style={[styles.card, { backgroundColor: background2, shadowColor: shadow }]}>
                    <Text style={[styles.title, { color: text2 }]}>{local.NOME}</Text>
                    <Text style={[styles.description, { color: tertiaryText }]}>{local.DESCRICAO}</Text>
                    <View style={[styles.divider, { backgroundColor: background }]} />
                    <View style={styles.locationRow}>
                        <Text style={[styles.locationLabel, { color: tertiaryText }]}>Localização</Text>
                    </View>
                    <View style={{ marginTop: 4, marginLeft: 0, alignItems: 'flex-start' }}>
                        {local.LOCALIZACAO.split('\n').map((linha: string, idx: number) => (
                            <Text key={idx} style={[styles.locationValue, { color: text2 }]}>{linha}</Text>
                        ))}
                    </View>
                </View>
            </Wrapper>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    imageContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: 24,
    },
    card: {
        marginTop: 15,
        borderRadius: 24,
        padding: 24,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    locationValue: {
        fontSize: 16,
        fontWeight: '600',
    },
});