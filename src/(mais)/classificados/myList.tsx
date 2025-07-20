import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Wrapper } from '@/components/Wrapper'
import DynamicList from '@/components/DynamicList'
import Header from '@/components/Header'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { classificadosToItems } from '@/api/app/appTransformer'
import { useAuth } from '@/providers/AuthProvider'

// Defina o tipo correto para os parâmetros da rota
// Ajuste conforme o seu tipo de navegação, aqui é um exemplo genérico
interface MyListRouteParams {
  originalData?: any[];
}

export default function MyList() {
    const navigation = useNavigation()
    const route = useRoute<RouteProp<Record<string, MyListRouteParams>, string>>()
    const originalData: any[] = route.params?.originalData || []
    const [myAds, setMyAds] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth();

    useEffect(() => {
        if (originalData.length > 0) {
            // Filtra apenas os anúncios do usuário atual
            const filteredAds = originalData.filter((ad: any) => {
                const adUserId = ad.properties?.Titular?.rich_text?.[0]?.plain_text;
                return adUserId == user; // Usa o id do usuário autenticado
            });
            const transformedAds = classificadosToItems(filteredAds);
            setMyAds(transformedAds);
            setError(null);
            setLoading(false);
        } else {
            setLoading(false);
            setError('Nenhum dado recebido');
        }
    }, [originalData, user])

    if (loading) {
        return (
            <>
                <Header title="Meus anúncios" />
                <Wrapper style={{ padding: 16 }}>
                    <ActivityIndicator size="large" />
                </Wrapper>
            </>
        )
    }

    if (error) {
        return (
            <>
                <Header title="Meus anúncios" />
                <Wrapper style={{ padding: 16 }}>
                    <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
                </Wrapper>
            </>
        )
    }

    return (
        <>
            <Header title="Meus anúncios" />
            <Wrapper
                style={{ padding: 16 }}
                primaryButtonLabel='Criar novo anúncio'
                onPrimaryPress={() => navigation.navigate('(classificados)/form')}
            >
                <DynamicList
                    data={myAds}
                    searchable
                    onClickPrimaryButton={(item: any) => {
                        const originalItem = originalData.find((orig: any) => orig.id === item.id);
                        if (originalItem) {
                            navigation.navigate("(classificados)/Details", { item: originalItem });
                        }
                    }}
                />
            </Wrapper>
        </>
    )
}