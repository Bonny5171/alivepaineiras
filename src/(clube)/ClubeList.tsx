import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LocalItem, GrupoItem } from '@/api/app/clube';
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ClubeListProps {
    route: {
        params: {
            grupo: GrupoItem;
            locais: LocalItem[];
        };
    };
}

export default function ClubeList({ route }: ClubeListProps) {
    const { grupo, locais } = route.params;
    const navigation = useNavigation();

    const background = useThemeColor({}, 'background');
    const tertiaryText = useThemeColor({}, 'tertiaryText');

    return (
        <>
            <Header title={grupo.NOME}/>
            <Wrapper style={[styles.container, { backgroundColor: background }]} >
                {locais.map((local, idx) => (
                    <TouchableOpacity
                        key={local.IDLOCAL}
                        style={styles.itemContainer}
                        activeOpacity={0.8}
                        onPress={() => (navigation as any).navigate('clubeDetails', { local })}
                    >
                        <Text style={[styles.title, { color: tertiaryText }]}>{local.NOME.toUpperCase()}</Text>
                        <Image
                            source={{ uri: local.IMAGEM }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        {idx < locais.length - 1 && <View style={styles.spacer} />}
                    </TouchableOpacity>
                ))}
            </Wrapper>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    itemContainer: {
        marginBottom: 0,
    },
    title: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 8,
        marginLeft: 4,
    },
    image: {
        width: '100%',
        height: 160,
        borderRadius: 20,
        marginBottom: 24,
    },
    spacer: {
        height: 0,
    },
});