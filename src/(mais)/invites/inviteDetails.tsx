import Calendar from '@/components/Calendar';
import Header from '@/components/Header';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { listarConvidados, deletarConvite } from '@/api/app/convites';
import { useError } from '@/providers/ErrorProvider';
import { Wrapper } from '@/components/Wrapper';
import DynamicList from '@/components/DynamicList';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getStatusColor } from '@/utils/statusColors';

export default function DetalhesVisita() {
    const route = useRoute();
    // Agora espera o convite inteiro nos params
    const { convite } = route.params as { convite: any };
    const [isLoading, setIsLoading] = useState(true);
    const [visitantes, setVisitantes] = useState<any[]>([]);
    const navigation = useNavigation();
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const { setError } = useError();
    const confirm = useConfirmation();

    // THEME COLORS
    const background = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'background2');
    const sectionTitleColor = useThemeColor({}, 'text');
    const labelColor = useThemeColor({}, 'text2');
    const valueColor = useThemeColor({}, 'text');
    const cardTitleColor = useThemeColor({}, 'text');
    const dividerColor = useThemeColor({}, 'background1');
    const subLabelColor = useThemeColor({}, 'text2');

    useEffect(() => {
        const fetchVisitantes = async () => {
            setIsLoading(true);
            try {
                if (convite?.IDCONVITE) {
                    const convidados = await listarConvidados({ IDCONVITE: convite.IDCONVITE });
                    setVisitantes(convidados);
                } else {
                    setVisitantes([]);
                }
            } catch (e) {
                setVisitantes([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVisitantes();
    }, [convite]);

    const handleVisitanteClick = (item: any) => {
        const visitante = visitantes.find(v => v.IDCONVIDADO === item.id);
        if (visitante) {
            navigation.navigate('(invites)/visitant', {
                visitante: {
                    ...visitante,
                    DATA_VISITA: convite.DATA,
                    GERADO_EM: convite.DTEMISSAO
                }
            });
        }
    };

    // Compartilhar convite usando o LINK
    const handleShare = async () => {
        setIsButtonLoading(true);
        try {
            if (convite?.LINK) {
                await Share.share({
                    message: `Acesse seu convite: ${convite.LINK}`,
                    url: convite.LINK,
                    title: 'Convite para visita'
                });
            }
        } finally {
            setIsButtonLoading(false);
        }
    };

    // Função para invalidar convite
    const handleInvalidar = async () => {
        if (convite?.IDSTATUS !== 1) return;
        confirm.showConfirmation('Invalidar convite', async () => {
            setIsButtonLoading(true);
            try {
                const response = await deletarConvite({ IDCONVITE: convite.IDCONVITE });
                if (response[0]?.ERRO) {
                    setError(response[0]?.MSG_ERRO || 'Erro ao invalidar convite.', 'error');
                } else {
                    setError('Convite invalidado com sucesso!', 'success');
                    navigation.reset({
                        index: 1,
                        routes: [
                            { name: '(tabs)' as never },
                            { name: '(invites)/list' as never }
                        ]
                    });
                }
            } catch (e) {
                setError('Erro ao invalidar convite.', 'error');
            } finally {
                setIsButtonLoading(false);
            }
        }, {
            abovePasswordComponent: (
                <View style={{ padding: 16 }}>
                    <Text style={{ color: sectionTitleColor, fontSize: 16, fontWeight: '500', marginBottom: 16 }}>
                        Confirmação de invalidação do convite
                    </Text>
                    <Text style={{ color: cardTitleColor, fontSize: 19, fontWeight: '700', marginBottom: 16 }}>
                        Tem certeza que deseja invalidar este convite?
                    </Text>
                </View>
            )
        });
    };

    if (!convite && !isLoading) {
        return (
            <>
                <Header title='Detalhes do convite' />
                <View style={[styles.container, { backgroundColor: background }]}><Text>Erro ao carregar detalhes.</Text></View>
            </>
        );
    }

    const quantidade = Number(convite?.QUANTIDADE) || 0;
    let visitantesList: any[] = [];
    for (let i = 0; i < quantidade; i++) {
        const convidado = visitantes[i];
        if (convidado) {
            visitantesList.push({
                id: convidado.IDCONVIDADO || String(i + 1),
                title: convidado.NOME || `Visitante ${i + 1}`,
                subtitle: '-',
                icon: convidado.FOTO || 'interrogation',
                category: '',
                tags: [{ title: convidado.STATUS || 'Aguardando', color: getStatusColor(convidado.IDSTATUS) }],
                isImage: !!convidado.FOTO,
            });
        } else {
            visitantesList.push({
                id: String(i + 1),
                title: `Visitante ${i + 1}`,
                subtitle: '-',
                icon: 'interrogation',
                category: '',
                tags: [{ title: 'Aguardando', color: getStatusColor(6) }],
                isImage: false,
            });
        }
    }

    // Soma o valor de todos os visitantes
    const valorTotal = visitantes.reduce((acc, v) => {
        // Considera 0 se não houver valor
        const valor = typeof v.VALOR === 'number' ? v.VALOR : Number(v.VALOR) || 0;
        return acc + valor;
    }, 0);

    const showShareButton = convite?.STATUS !== 'Finalizado';
    const showInvalidarButton = convite?.IDSTATUS === 1;

    return (
        <>
            <Header title='Detalhes do convite' />
            <Wrapper
                style={[styles.container, { backgroundColor: background }]}
                primaryButtonLabel={showShareButton ? 'Compartilhar Convite' : undefined}
                onPrimaryPress={showShareButton ? handleShare : undefined}
                isLoading={isLoading || isButtonLoading}
                secondaryButtonLabel={showInvalidarButton ? 'Invalidar' : undefined}
                onSecondaryPress={showInvalidarButton ? handleInvalidar : undefined}
            >
                {/* INFORMAÇÕES */}
                <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>INFORMAÇÕES</Text>
                <View style={[styles.card, { backgroundColor: cardBackground }]}> 
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: labelColor }]}>Status</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{convite?.STATUS || '-'}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: labelColor }]}>Número de visitantes</Text>
                        <Text style={[styles.value, { color: valueColor }]}>{convite?.QUANTIDADE || '-'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: labelColor }]}>Gerado em</Text>
                        <Text style={[styles.value, { color: valueColor }]}>{convite?.DTEMISSAO || '-'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: labelColor }]}>Data da visita</Text>
                        <Text style={[styles.value, { color: valueColor }]}>{convite?.DATA || '-'}</Text>
                    </View>
                </View>

                {/* VALORES */}
                <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>VALORES</Text>
                <View style={[styles.card, { backgroundColor: cardBackground }]}> 
                    <Text style={[styles.cardTitle, { color: cardTitleColor }]}>Custos</Text>
                    <View style={[styles.divider, { backgroundColor: dividerColor }]} />
                    <View style={styles.row}>
                        <View>
                            <Text style={[styles.label, { color: labelColor }]}>Valor total</Text>
                            <Text style={[styles.subLabel, { color: subLabelColor }]}>{convite?.QUANTIDADE || 0} visitantes</Text>
                        </View>
                        <Text style={[styles.valorTotal, { color: valueColor }]}>R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                    </View>
                </View>

                {/* VISITANTES */}
                <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>VISITANTES</Text>
                <DynamicList data={visitantesList as any} onClickPrimaryButton={handleVisitanteClick}/>
            </Wrapper>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#E2E7F8', // replaced by theme
        padding: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        // color: '#1B2559', // replaced by theme
        marginBottom: 8,
        marginTop: 16,
    },
    card: {
        // backgroundColor: '#FFFFFF', // replaced by theme
        borderRadius: 16,
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        // color: '#7D7D7D', // replaced by theme
    },
    value: {
        fontSize: 14,
        // color: '#1B2559', // replaced by theme
        marginBottom: 8,
    },
    statusBadge: {
        // backgroundColor: '#49A7F6', // semantic color, set inline
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#FFFFFF', // keep white for contrast
        fontWeight: 'bold',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        // color: '#1B2559', // replaced by theme
        marginBottom: 8,
    },
    divider: {
        height: 1,
        // backgroundColor: '#E0E0E0', // replaced by theme
        marginBottom: 8,
    },
    subLabel: {
        fontSize: 12,
        // color: '#7D7D7D', // replaced by theme
    },
    valorTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        // color: '#1B2559', // replaced by theme
    },
});
