import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import DynamicList, { ListItem } from '@/components/DynamicList';
import { ThemedText } from '@/components/ThemedText';
import { Wrapper } from '@/components/Wrapper';
import { listarFaturas } from '@/api/app/financeiro';
import { invoicesToItems, ListarFaturasItem } from '@/api/app/appTransformer';
import Header from '@/components/Header';
import FooterTabBar from '@/components/FooterTabBar';
import { useNavigation } from '@react-navigation/native';

export default function FaturasScreen() {
    const [originalData, setOriginalData] = useState<ListarFaturasItem[]>([]);
    const [itemList, setItemList] = useState<ListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const apiData = await listarFaturas();
                setOriginalData(apiData);
                setItemList(invoicesToItems(apiData));
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleClick = (item: ListItem) => {
        const faturaSelecionada = originalData.find(
            (fatura) => fatura.REFERENCIA === item.id
        );
        navigation.navigate('(financeiro)/itemList', {
            fatura: JSON.stringify(faturaSelecionada),
        });
    };

    return (
        <>
            <Header title="Faturas Paineiras" />
            <Wrapper isLoading={isLoading}>
                <View style={{ padding: 14 }}>
                    <DynamicList data={itemList} onClickPrimaryButton={handleClick} />
                </View>
                <FooterTabBar activeTab="faturas" />
            </Wrapper>
        </>
    );
}
