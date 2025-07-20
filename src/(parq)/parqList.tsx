import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import DynamicList from '@/components/DynamicList'
import { Wrapper } from '@/components/Wrapper';
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';
import { listarAssociados, Associado } from '@/api/app/parq';
import { BottomSheet } from '@/components/BottomSheet';
import ParqRefazerAviso from './ParqRefazerAviso';

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

export default function parqList() {
    const navigation = useNavigation<any>();
    const [usuarios, setUsuarios] = useState<Associado[]>([]);
    const [loading, setLoading] = useState(true);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<Associado | null>(null);
    const [pendingItem, setPendingItem] = useState<any>(null);

    useEffect(() => {
        listarAssociados().then(data => {
            setUsuarios(data.filter(u => !u.ERRO));
        }).finally(() => setLoading(false));
    }, []);

    // Mapeia para ListItem
    const data = usuarios.map((u, idx) => {
        // Se não houver avatar, gera as iniciais do nome
        let altText = undefined;
        if (!u.AVATAR && u.NOME) {
            const parts = u.NOME.trim().split(' ');
            altText = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase();
        }
        // Define cor e título da tag conforme STATUS
        let tagColor = '#EA9610';
        if (u.STATUS === 'Assinado') tagColor = '#35E07C';
        else if (u.STATUS === 'Expirado') tagColor = '#FF3F3F';
        return {
            title: u.NOME,
            subtitle: u.DATA_PARQ, // Mostra DATA_PARQ como subtítulo
            icon: u.AVATAR,
            category: 'Associados',
            id: u.TITULO,
            tags: [{ title: u.STATUS||"Sem registro", color: tagColor }],
            key: String(idx),
            altText,
            showName: !!altText
        } as import('@/components/DynamicList').ListItem;
    });

    function handlePrimaryButton(item: any) {
        const usuario = usuarios.find(u => u.TITULO === item.id);
        if (!usuario) return;
        if (usuario.STATUS !== 'Expirado' && usuario.STATUS !== 'Sem registro') {
            setUsuarioSelecionado(usuario);
            setPendingItem(item);
            setBottomSheetVisible(true);
        } else {
            navigation.navigate('parqForm', { usuario: {
                ...usuario, ...item
            }});
        }
    }

    function handleConfirm() {
        if (usuarioSelecionado && pendingItem) {
            navigation.navigate('parqForm' as never, { usuario: usuarioSelecionado } as never);
        }
        setBottomSheetVisible(false);
        setUsuarioSelecionado(null);
        setPendingItem(null);
    }

    function handleCancel() {
        setBottomSheetVisible(false);
        setUsuarioSelecionado(null);
        setPendingItem(null);
    }

    return (
        <>
            <Header title='PAR-Q'/>
            <Wrapper style={{ padding: 16 }} isLoading={loading}>
                <DynamicList data={data} onClickPrimaryButton={handlePrimaryButton} />
            </Wrapper>
            <BottomSheet
                visible={bottomSheetVisible}
                onClose={handleCancel}
                onSecondaryPress={handleCancel}
                onPrimaryPress={handleConfirm}
                primaryButtonLabel="Sim, refazer"
                secondaryButtonLabel="Cancelar"
            >
                <ParqRefazerAviso />
            </BottomSheet>
        </>
    )
}