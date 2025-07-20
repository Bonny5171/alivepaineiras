import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { listarTaxas, ListarTaxasResponse } from '@/api/app/financeiro';
import { converterParaListItem, ListarFaturasItem } from '@/api/app/appTransformer';
import DynamicList, { ListItem } from '@/components/DynamicList';
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';

export default function ItemList() {
  const navigation = useNavigation();
  const route = useRoute();
  const { fatura } = route.params;
  const [faturaInfo, setFaturaInfo] = useState<ListarFaturasItem | null>(null);
  const [originalData, setOriginalData] = useState<ListarTaxasResponse[]>([]);
  const [listData, setListData] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [titleHeader, setTitleHeader] = useState<string>('Faturas');

  useEffect(() => {
    const parsedFatura = JSON.parse(Array.isArray(fatura) ? fatura[0] : fatura);
    setFaturaInfo(parsedFatura);

    setTitleHeader('Faturas de ' + parsedFatura?.DESCRICAO);

    setIsLoading(true);
    listarTaxas(parsedFatura?.REFERENCIA)
      .then((response) => {
        setOriginalData(response);
        setListData(converterParaListItem(response));
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fatura]);

  const handleItemClick = (data: ListItem) => {
    const selectedItem = originalData.find((arr, index) => parseInt(data.id) === index);
    if (selectedItem) {
      navigation.navigate('(financeiro)/itemDetails', {
        item: JSON.stringify(selectedItem)
      });
    }
  };

  const handleFaturaClick = () => {
    navigation.navigate('(financeiro)/details', {
      fatura: JSON.stringify(faturaInfo)
    });
  };

  return (
    <>
      <Header title={"Detalhes da Fatura"} />
      <Wrapper
        onPrimaryPress={handleFaturaClick} // Adicionado botão primário
        primaryButtonLabel='Ver Boleto'
        style={{ padding: 16 }}
        isLoading={isLoading}> {/* Passa o estado de carregamento para o Wrapper */}
        <DynamicList
          data={listData}
          onClickPrimaryButton={(data) => handleItemClick(data)} // Passa a função de clique
        />
      </Wrapper>
    </>
  );
}