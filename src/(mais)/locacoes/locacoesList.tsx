import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Wrapper } from '@/components/Wrapper'
import DynamicList from '@/components/DynamicList'
import { IconSymbol } from '@/components/ui/IconSymbol';
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';
import { listarLocais, Local } from '@/api/app/locacoes';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LocacoesList() {
    const navigation = useNavigation();
    const [locais, setLocais] = useState<any[]>([]);
    const [originalLocais, setOriginalLocais] = useState<Local[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const cardBackground = useThemeColor({}, 'background2');
    const iconBg = useThemeColor({}, 'lightPink');
    const textColor = useThemeColor({}, 'text');
    const accent = useThemeColor({}, 'brand');
    const mutedText = useThemeColor({}, 'text2');

    useEffect(() => {
        async function fetchLocais() {
            setIsLoading(true);
            try {
                const data = await listarLocais();
                
                const validLocais = (data || []).filter((item) => !item.ERRO);
                if (Array.isArray(data) && (validLocais.length === 0 || (data.length === 1 && data[0].IDERRO === 100))) {
                    setOriginalLocais([]);
                    setLocais([]);
                } else {
                    setOriginalLocais(validLocais);
                    const mapped = validLocais.map((local: Local) => ({
                        id: String(local.IDLOCAL),
                        title: local.DESCRICAO,
                        subtitle: local.CAPACIDADE ? `${local.CAPACIDADE} Pessoas` : '',
                        subtitleIcon: 'users',
                        category: '',
                    }));
                    setLocais(mapped);
                }
            } catch (e) {
                setLocais([]);
                setOriginalLocais([]);
            }
            setIsLoading(false);
        }
        fetchLocais();
    }, [navigation]);

    const styles = StyleSheet.create({
        button: {
            backgroundColor: cardBackground,
            borderRadius: 20,
            paddingVertical: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
            marginBottom: 16,
        },
        iconContainer: {
            backgroundColor: iconBg,
            borderRadius: 12,
            padding: 8,
        },
        text: {
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            color: textColor,
        },
        chevron: {
            marginLeft: 'auto',
        },
        emptyText: {
            textAlign: 'center',
            color: mutedText,
            marginTop: 32,
            fontSize: 16,
        },
    });

    return (
        <>
            <Header title="Locações" bigTitle/>
            <Wrapper style={{ padding: 16 }} isLoading={isLoading}>
                <TouchableOpacity style={styles.button} onPress={() => { /* @ts-ignore */ navigation.navigate("(locacoes)/myList") }} activeOpacity={0.8}>
                    <View style={styles.iconContainer}>
                        <IconSymbol name="plus" library='fontawesome' size={16} color={accent} />
                    </View>
                    <Text style={styles.text}>Minhas reservas</Text>
                </TouchableOpacity>
                {locais.length === 0 && !isLoading ? (
                    <Text style={styles.emptyText}>
                        Nenhuma locação encontrada.
                    </Text>
                ) : (
                    <DynamicList
                        data={locais}
                        searchable
                        onClickPrimaryButton={(item) => {
                            const original = originalLocais.find(l => String(l.IDLOCAL) === item.id);
                            if (original) {
                                // Força acesso aos campos extras, mesmo se não tipados
                                const termosUso = (original as any).TERMOS_USO || '';
                                const linkArquivo = (original as any).LINK_ARQUIVO || '';
                                const textoLink = (original as any).TEXTO_LINK || '';
                                // @ts-ignore
                                navigation.navigate("(locacoes)/Details", {
                                    local: original,
                                    termosUso,
                                    linkArquivo,
                                    textoLink
                                });
                            }
                        }}
                    />
                )}
            </Wrapper>
        </>
    )
}