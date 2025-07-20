import { View, Text, TextInput } from 'react-native'
import React, { useEffect } from 'react'
import DynamicList from '@/components/DynamicList'
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { fetchFaqData } from '@/api/notion/notionService';
import FaqNotFound from './FaqNotFound';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ListItem = {
    title: string;
    subtitle?: string;
    icon?: string;
    iconLibrary?: 'material' | 'fontawesome';
    category: string;
    id: string;
    key?: string;
    tags?: [{ title: string, color: string }];
    onPress?: () => void; // Adicionando onPress como opcional
    altText?: string; // Novo: texto alternativo para avatar
    showName?: boolean; // Novo: se deve mostrar o altText
};

export default function faqList() {
    const navigation = useNavigation();
    const [faqData, setFaqData] = React.useState<ListItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    
    const background2 = useThemeColor({}, 'background2');

    useEffect(() => {
      fetchFaqData()
        .then((data) => setFaqData(data))
        .catch(() => setFaqData([]))
        .finally(() => setLoading(false));
    }, []);

    const filteredData = faqData.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <>
            <Header title='Central de Ajuda' bigTitle/>
            <Wrapper style={{ padding: 16 }} isLoading={loading}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: background2, borderRadius: 8, marginBottom: 12, paddingHorizontal: 12 }}>
                    <IconSymbol name='search' library='fontawesome' color='#7B8192' size={22} style={{ marginRight: 8 }} />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder='Buscar'
                        style={{ flex: 1, color: '#7B8192', height: 40 }}
                        autoCapitalize='none'
                        autoCorrect={false}
                        placeholderTextColor={'#7B8192'}
                    />
                </View>
                {loading ? (
                  <Text style={{textAlign: 'center', marginTop: 32}}>Carregando...</Text>
                ) : filteredData.length === 0 ? (
                  <FaqNotFound />
                ) : (
                  <DynamicList data={filteredData} onClickPrimaryButton={(item) => {
                      // @ts-ignore
                      navigation.navigate('faqDetails', {
                          title: item.title,
                          answer: item.subtitle || '',
                      });
                  }}/>
                )}
            </Wrapper>
        </>
    )
}