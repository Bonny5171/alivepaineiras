import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header';
import { Wrapper } from '@/components/Wrapper';
import DynamicList from '@/components/DynamicList';
import { useNavigation } from '@react-navigation/native';
import { listarOcorrencias, Ocorrencia } from '@/api/app/ouvidoria';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ManifestList() {
    const navigation = useNavigation();
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [loading, setLoading] = useState(true);

    const mutedText = useThemeColor({}, 'text2');

    useEffect(() => {
        const fetchOcorrencias = async () => {
            try {
                const data = await listarOcorrencias();

                const validOcorrencias = (data || []).filter((item) => !item.ERRO);
                if (Array.isArray(data) && (validOcorrencias.length === 0 || (data.length === 1 && data[0].IDERRO === 100))) {
                    setOcorrencias([]);
                } else {
                    setOcorrencias(validOcorrencias);
                }
            } catch (error) {
                console.error('Erro ao buscar ocorrências:', error);
                setOcorrencias([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOcorrencias();
    }, []);

    const getIconByType = (tipo: string) => {
        switch (tipo) {
            case 'Elogio':
                return 'smile';
            case 'Sugestão':
                return 'lightbulb';
            case 'Reclamação':
                return 'exclamation-circle';
            case 'Áudio':
                return 'microphone';
            default:
                return 'question-circle';
        }
    };

    const getStatusColor = (status: string) => {
        if (status.includes('Aguardando')) return '#ff9800';
        if (status.includes('Não adotada')) return '#9e9e9e';
        if (status.includes('Respondida')) return '#4caf50';
        return '#9e9e9e';
    };

    const formattedData = ocorrencias.map(ocorrencia => ({
        id: ocorrencia.IDOCORRENCIA.toString(),
        title: ocorrencia.TIPO,
        subtitle: ocorrencia.DATA,
        icon: getIconByType(ocorrencia.TIPO),
        category: '',
        tags: [{ 
            title: ocorrencia.STATUS, 
            color: getStatusColor(ocorrencia.STATUS) 
        }]
    }));

    const handleItemClick = (clickedItem: { id: string }) => {
        // Encontra a ocorrência completa no array original pelo ID
        const ocorrenciaCompleta = ocorrencias.find(
            oc => oc.IDOCORRENCIA.toString() === clickedItem.id
        );

        if (!ocorrenciaCompleta) return;

        // Navega para a tela de detalhes com base no tipo de ocorrência
        if (ocorrenciaCompleta.TIPO === 'Áudio') {
            navigation.navigate("(manifest)/audioManifestDetails", { 
                item: ocorrenciaCompleta 
            });
        } else {
            navigation.navigate("(manifest)/textManifestDetails", { 
                item: ocorrenciaCompleta 
            });
        }
    };

    const styles = StyleSheet.create({
        emptyText: {
            textAlign: 'center',
            color: mutedText,
            marginTop: 32,
            fontSize: 16,
        },
    });

    return (
        <>
            <Header title="Manifestações" />
            <Wrapper style={{ padding: 16 }} isLoading={loading}>
                {ocorrencias.length === 0 && !loading ? (
                    <Text style={styles.emptyText}>
                        Nenhuma manifestação encontrada.
                    </Text>
                ) : (
                    <DynamicList
                        data={formattedData}
                        onClickPrimaryButton={handleItemClick}
                    />
                )}
            </Wrapper>
        </>
    );
}