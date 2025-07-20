import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Wrapper } from '@/components/Wrapper'
import DynamicList from '@/components/DynamicList'
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';
import { listarReserva } from '@/api/app/locacoes'
import { useThemeColor } from '@/hooks/useThemeColor';

export default function MyList() {
    const navigation = useNavigation();
    const [data, setData] = useState<any[]>([]);
    const [originalData, setOriginalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const mutedText = useThemeColor({}, 'text2');

    useEffect(() => {
        async function fetchReservas() {
            setLoading(true);
            try {
                const reservas = await listarReserva();
                
                const validReservas = (reservas || []).filter((item) => !item.ERRO);
                if (Array.isArray(reservas) && (validReservas.length === 0 || (reservas.length === 1 && reservas[0].IDERRO === 100))) {
                    setOriginalData([]);
                    setData([]);
                } else {
                    // Ordena pelo campo ORDEM (crescente)
                    const sorted = validReservas.slice().sort((a, b) => a.ORDEM - b.ORDEM);
                    const mapped = sorted.map(r => ({
                        id: r.ORDEM.toString(),
                        title: r.LOCAL,
                        subtitle: r.DATA,
                        icon: 'ticket',
                        category: '',
                        tags: [{ title: r.STATUS, color: r.STATUS === 'Confirmada' ? '#4caf50' : '#2196f3' }],
                    }));
                    setOriginalData(sorted);
                    setData(mapped);
                }
            } catch (e) {
                setData([]);
                setOriginalData([]);
            }
            setLoading(false);
        }
        fetchReservas();
    }, []);

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
            <Header title="Minhas reservas" />
            <Wrapper style={{ padding: 16 }} isLoading={loading}>
                {data.length === 0 && !loading ? (
                    <Text style={styles.emptyText}>
                        Nenhuma reserva encontrada.
                    </Text>
                ) : (
                    <DynamicList 
                        data={data} 
                        searchable 
                        onClickPrimaryButton={(item: any) => { 
                            const reservaOriginal = originalData.find(r => r.ORDEM.toString() == item.id);
                            // Merge: prioridade para campos de originalData, mas mantendo os de item
                            const reservaCompleta = { ...item, ...reservaOriginal };
                            console.log("Reserva selecionada:", reservaCompleta);
                            (navigation as any).navigate('(locacoes)/myLocacaoDetails', { reserva: reservaCompleta });
                        }}
                    />
                )}
            </Wrapper>
        </>
    )
}