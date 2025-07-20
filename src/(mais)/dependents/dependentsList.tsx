import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Wrapper } from '@/components/Wrapper'
import Header from '@/components/Header'
import DynamicList, { ListItem } from '@/components/DynamicList'
import { listarDependentes } from '@/api/app/atividades'
import { useAuth } from '@/providers'
import { useNavigation } from '@react-navigation/native'

export default function DependentsList() {
    const [data, setData] = useState<ListItem[]>([]);
    const [originalDependents, setOriginalDependents] = useState<any[]>([]);
    const AuthContext = useAuth();
    const tituloadAtual = AuthContext.user; // Pode vir do contexto do usuário
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        function getInitials(nome: string): string {
            if (!nome) return '';
            const partes = nome.trim().split(' ');
            if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
            return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
        }
        async function fetchDependents() {
            setLoading(true);
            setError(null);
            try {
                const dependentes = await listarDependentes({ TITULO: tituloadAtual });
                setOriginalDependents(dependentes);
                const mapped: ListItem[] = dependentes.filter(d => !d.ERRO).map((d, idx) => ({
                    id: d.IDPESSOA?.toString() || idx.toString(),
                    title: d.NOME,
                    subtitle: d.TITULO,
                    icon: d.AVATAR,
                    category: '',
                    tags: d.TITULO === tituloadAtual ? [{ title: 'Titular', color: '#2196f3' }] : undefined,
                    altText: getInitials(d.NOME),
                    showName: true,
                }));
                setData(mapped);
            } catch (e) {
                setError('Erro ao buscar dependentes');
                setData([]);
                setOriginalDependents([]);
            }
            setLoading(false);
        }
        fetchDependents();
    }, []);

    return (
        <>
            <Header title='Dependentes'  bigTitle/>
            <Wrapper style={{ padding: 16 }} isLoading={loading}>
                {error && <Text style={{ color: 'red', marginBottom: 16 }}>{error}</Text>}
                {!loading && !error && (
                    <DynamicList
                        data={data}
                        onClickPrimaryButton={item => {
                            const original = originalDependents.find(d => d.IDPESSOA?.toString() === item.id);
                            if (original) {
                                navigation.navigate("profile", { TITULO: original.TITULO });
                            }
                        }}
                    />
                )}
            </Wrapper>
        </>
    )
}
