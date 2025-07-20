import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Wrapper } from '@/components/Wrapper'
import DynamicList from '@/components/DynamicList'
import { IconSymbol } from '@/components/ui/IconSymbol';
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';
import { listarConvites } from '@/api/app/convites';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getStatusColor } from '@/utils/statusColors';

export default function inviteList() {
    const navigation = useNavigation();
    const [convites, setConvites] = useState<any[]>([]);
    const [convitesRaw, setConvitesRaw] = useState<any[]>([]); // novo estado para manter os dados originais
    const [isLoading, setIsLoading] = useState(true);

    // THEME COLORS
    const cardBackground = useThemeColor({}, 'background2');
    const iconBg = useThemeColor({}, 'lightPink');
    const textColor = useThemeColor({}, 'text');
    const accent = useThemeColor({}, 'brand');
    const mutedText = useThemeColor({}, 'text2');

    // Corrige navegação para tipos desconhecidos
    const handleNavigateNew = () => {
        // @ts-ignore
        navigation.navigate('(invites)/new');
    };
    const handleNavigateDetails = (id: string) => {
        // Busca o objeto original pelo id
        const original = convitesRaw.find((item) => item.IDCONVITE === id);
        // @ts-ignore
        navigation.navigate('(invites)/details', { convite: original });
    };

    useEffect(() => {
        const fetchConvites = async () => {
            try {
                const data = await listarConvites();
                setConvitesRaw(data || []); // salva o array original
                // Filtra itens com ERRO: true
                const validConvites = (data || []).filter((item) => !item.ERRO);
                if (Array.isArray(data) && (validConvites.length === 0 || (data.length === 1 && data[0].IDERRO === 100))) {
                    setConvites([]);
                } else {
                    const mapped = validConvites.map((item) => ({
                        id: item.IDCONVITE,
                        rawId: item.IDCONVITE, // mantém o id original para navegação
                        title: item.DATA, // data do convite
                        subtitle: `${item.QUANTIDADE} Visitantes`,
                        icon: 'ticket',
                        category: 'Meus Convites',
                        tags: [{
                            title: (item as any).STATUS ? (item as any).STATUS : 'Desconhecido',
                            color: getStatusColor((item as any).IDSTATUS)
                        }],
                        onPress: () => handleNavigateDetails(item.IDCONVITE),
                    }));
                    setConvites(mapped);
                }
            } catch (e) {
                setConvites([]);
                setConvitesRaw([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConvites();
    }, []);

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
        },
    });

    return (
        <>
            <Header title="Convites" bigTitle />
            <Wrapper style={{ padding: 16 }} isLoading={isLoading}>
                <TouchableOpacity style={styles.button} onPress={handleNavigateNew} activeOpacity={0.8}>
                    <View style={styles.iconContainer}>
                        <IconSymbol name="plus" library='fontawesome' size={16} color={accent} />
                    </View>
                    <Text style={styles.text}>Novo convite</Text>
                </TouchableOpacity>
                {convites.length === 0 && !isLoading ? (
                    <Text style={styles.emptyText}>
                        Nenhum convite encontrado.
                    </Text>
                ) : (
                    <DynamicList data={convites} searchable onClickPrimaryButton={(item: any)=>{handleNavigateDetails(item.rawId ?? item.id)}}/>
                )}
            </Wrapper>
        </>
    )
}