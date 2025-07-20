import React, { useEffect, useState } from 'react';
import { listarConsultas, listarConsultasCanceladas } from '@/api/app/appointments';
import DynamicList, { ListItem } from '@/components/DynamicList';
import { transformarConsultasEmListItems } from '@/api/app/appTransformer';
import { Wrapper } from '@/components/Wrapper';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/Header';
import { View, ActivityIndicator, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ScheduledAppointments({ type = 'ativas', onClose, titulo }: { type?: 'ativas' | 'canceladas', onClose?: () => void, titulo?: string }) {
    const [consultas, setConsultas] = useState<ListItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filteredConsultas, setFilteredConsultas] = useState<any[]>([]);
    const navigation = useNavigation();

    const background2 = useThemeColor({}, 'background2');
    const text2 = useThemeColor({}, 'text2');
    const buttonAccent = useThemeColor({}, 'buttonAccent');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                let response;
                if (type === 'canceladas') {
                    response = await listarConsultasCanceladas(titulo);
                } else {
                    response = await listarConsultas(titulo);
                }
                // Filtra as consultas conforme o tipo
                let filtered = response;
                if (type === 'ativas') {
                    filtered = response.filter((item: any) => item.STATUS === 'Ativas');
                }
                setFilteredConsultas(filtered); // salva o filtered original
                setConsultas(transformarConsultasEmListItems(filtered));
            } catch (error) {
                console.error('Erro ao buscar consultas:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [type, titulo]);

    const handleNavigateToDetail = (id: number) => {
        if (onClose) onClose();
        const consultaObj = filteredConsultas.find((item) => String(item.IDCONSULTA) === String(id));
        console.log('Consulta selecionada:', consultaObj);
        // @ts-ignore
        navigation.navigate('(consulta)/appointmentDetails', { CONSULTA: consultaObj });
    };

    return (
        <Wrapper style={{ backgroundColor: background2 }}>
            <Text style={{ fontWeight: 600, fontSize: 19, marginBottom: 10, color: text2 }}>
                {type === 'ativas' ? 'Consultas Ativas' : 'Consultas Canceladas'}
            </Text>
            {isLoading ? (
                <ActivityIndicator style={{ marginVertical: 32 }} size="large" color={buttonAccent} />
            ) : (
                <DynamicList
                    raw
                    data={consultas}
                    onClickPrimaryButton={(res) => {
                        handleNavigateToDetail(parseInt(res.id));
                    }}
                />
            )}
        </Wrapper>
    );
}