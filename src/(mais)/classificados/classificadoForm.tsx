import { fetchAllClassificadosData, fetchCategoriasData, insertClassificado, updateClassificado } from '@/api/notion/notionService';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView, PermissionsAndroid, Platform  } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useError } from '@/providers/ErrorProvider';
import { useNavigation } from '@react-navigation/native';
// import * as ImagePicker from 'expo-image-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { gravarImagemNotion } from '@/api/app/ouvidoria';
// import * as FileSystem from 'expo-file-system';
import RNFS from 'react-native-fs';
import { useConfirmation } from '@/providers/ConfirmProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BottomSheet } from '@/components/BottomSheet';
import { fetchTermoClassificados } from '@/api/app/ouvidoria';
import DropdownFormPicker from '@/components/DropdownFormPicker';

export default function AnuncioForm({ route }: any) {
    const { user, nome } = useAuth();
    const { setError } = useError();
    const confirm = useConfirmation();
    const navigation = useNavigation();
    const [categorias, setCategorias] = useState<{ id: string, nome: string }[]>([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
    const [titulo, setTitulo] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [associado, setAssociado] = useState(nome || '');
    const [endereco, setEndereco] = useState('');
    const [dias, setDias] = useState('');
    const [horarioInicio, setHorarioInicio] = useState('');
    const [horarioFim, setHorarioFim] = useState('');
    const [telefone, setTelefone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [instagram, setInstagram] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagemCapa, setImagemCapa] = useState<string | null>(null);
    const [galeria, setGaleria] = useState<string[]>([]);
    const [uploadingCapa, setUploadingCapa] = useState(false);
    const [uploadingGaleria, setUploadingGaleria] = useState(false);
    const [aceito, setAceito] = useState(false);
    const [modalRegulations, setModalRegulations] = useState({ isOpen: false, action: () => { } });
    const [agreeWithRegulation, setAgreeWithRegulation] = useState(false);
    const [termoUso, setTermoUso] = useState('');

    const background = useThemeColor({}, 'background');
    const background1 = useThemeColor({}, 'background1');
    const background2 = useThemeColor({}, 'background2');
    const tertiaryText = useThemeColor({}, 'tertiaryText');
    const text2 = useThemeColor({}, 'text2');
    const disabledTextDark = useThemeColor({}, 'disabledTextDark');
    const backgroundFaded = useThemeColor({}, 'backgroundFaded');
    const buttonAccent = useThemeColor({}, 'buttonAccent');
    const error = useThemeColor({}, 'error');
    const contrastText = useThemeColor({}, 'contrastText');
    const highlight = useThemeColor({}, 'highlight');
    const neutralText = useThemeColor({}, 'neutralText');
    const brand = useThemeColor({}, 'brand');

    const isEdit = route?.params?.isEdit;
    const item = route?.params?.item;

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchCategoriasData();
            const cats = (data || []).map((cat: any) => ({
                id: cat.id,
                nome: cat.properties?.Nome?.title?.[0]?.plain_text || 'Sem nome'
            }));
            setCategorias(cats);

            // Busca termo de uso
            try {
                const termo = await fetchTermoClassificados();
                setTermoUso(termo);
            } catch (e) {
                setTermoUso('');
            }

            if (isEdit && item) {
                // Preenche os campos com os dados do anúncio
                setTitulo(item.properties.Nome.title[0]?.text.content || '');
                setResponsavel(item.properties.Anunciante.rich_text[0]?.text.content || '');
                setAssociado(item.properties.Titular.rich_text[0]?.text.content || '');
                setEndereco(item.properties.Endereço.rich_text[0]?.text.content || '');
                setDias(item.properties.Dias.rich_text[0]?.text.content || '');
                const horarios = item.properties.Horários.rich_text[0]?.text.content || '';
                if (horarios.includes(' - ')) {
                    const [inicio, fim] = horarios.split(' - ');
                    setHorarioInicio(inicio);
                    setHorarioFim(fim);
                } else {
                    setHorarioInicio(horarios);
                    setHorarioFim('');
                }
                setTelefone(item.properties.Telefone.phone_number || '');
                setWhatsapp(item.properties.WhatsApp.phone_number || '');
                setInstagram(item.properties.Instagram.rich_text[0]?.text.content || '');
                setDescricao(item.properties.Descrição.rich_text[0]?.text.content || '');
                setPreco(item.properties.Preço.rich_text[0]?.text.content || '');
                setImagemCapa(item.cover?.external?.url || null);
                // Galeria: pega todas as imagens exceto a capa
                const galeriaImgs = (item.properties.Galeria.files || [])
                    .map((f: any) => f?.external?.url || f?.file?.url)
                    .filter((url: string) => url && url !== item.cover?.external?.url);
                setGaleria(galeriaImgs);
                // Categoria selecionada
                const catId = cats.find(c => c.nome === item.categoryName)?.id;
                setCategoriaSelecionada(catId || '');
            }
        };
        fetchData();
    }, []);

    const solicitarPermissaoGaleria = async () => {
        if (Platform.OS !== 'android') return true;

        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
            title: 'Permissão para acessar fotos',
            message: 'Precisamos de acesso à sua galeria para selecionar imagens.',
            buttonPositive: 'OK',
            }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    };

    // const handleSelecionarImagemCapa = async () => {
    //     const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //     if (!permissao.granted) {
    //         setError('Permissão necessária para acessar as fotos.', 'error');
    //         return;
    //     }
    //     const resultado = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         aspect: [4, 3],
    //         quality: 0.8,
    //     });
    //     if (!resultado.canceled) {
    //         setImagemCapa(resultado.assets[0].uri);
    //     }
    // };
    const handleSelecionarImagemCapa = async () => {
        const permissao = await solicitarPermissaoGaleria();
        if (!permissao) {
            setError('Permissão necessária para acessar as fotos.', 'error');
            return;
        }

        const resultado = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        });

        if (!resultado.didCancel && resultado.assets && resultado.assets.length > 0) {
            setImagemCapa(resultado.assets[0].uri);
        }
        };
    const removerImagemCapa = () => setImagemCapa(null);

    // const handleSelecionarGaleria = async () => {
    //     if (galeria.length >= 6) {
    //         setError('Você pode selecionar até 6 imagens.', 'error');
    //         return;
    //     }
    //     const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //     if (!permissao.granted) {
    //         setError('Permissão necessária para acessar as fotos.', 'error');
    //         return;
    //     }
    //     const resultado = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         aspect: [4, 3],
    //         quality: 0.8,
    //         selectionLimit: 6 - galeria.length,
    //     });
    //     if (!resultado.canceled) {
    //         const novas = resultado.assets.map(a => a.uri).slice(0, 6 - galeria.length);
    //         setGaleria([...galeria, ...novas]);
    //     }
    // };
    const handleSelecionarGaleria = async () => {
        if (galeria.length >= 6) {
            setError('Você pode selecionar até 6 imagens.', 'error');
            return;
        }

        const permissao = await solicitarPermissaoGaleria();
        if (!permissao) {
            setError('Permissão necessária para acessar as fotos.', 'error');
            return;
        }

        const resultado = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 6 - galeria.length, // funciona no Android 13+
        });

        if (!resultado.didCancel && resultado.assets) {
            const novas = resultado.assets.map((a: Asset) => a.uri).slice(0, 6 - galeria.length);
            setGaleria([...galeria, ...novas]);
        }
    };

    const removerImagemGaleria = (uri: string) => setGaleria(galeria.filter(img => img !== uri));

    const handleSubmit = async () => {
        if (!titulo || !responsavel || !categoriaSelecionada) {
            setError('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        setModalRegulations({
            isOpen: true,
            action: async () => {
                setModalRegulations({ isOpen: false, action: () => { } });
                setAceito(false);
                confirm.showConfirmation(
                    isEdit ? 'Confirmar edição' : 'Confirmação',
                    async () => {
                        setIsSubmitting(true);
                        try {
                            // Gera um prefixo único para este envio
                            const uniquePrefix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

                            // Upload da imagem de capa (se houver)
                            let capaObj = null;
                            if (imagemCapa && !imagemCapa.startsWith('http')) {
                                setUploadingCapa(true);
                                // const base64 = await FileSystem.readAsStringAsync(imagemCapa, { encoding: FileSystem.EncodingType.Base64 });
                                const base64 = await RNFS.readFile(imagemCapa, 'base64');
                                const res = await gravarImagemNotion({ IDIMAGEM: `capa_${uniquePrefix}`, IMAGEM: base64 });
                                if (res.ERRO) throw new Error(res.MSG_ERRO || 'Erro ao enviar imagem de capa');
                                capaObj = { name: 'Capa', url: res.LINK };
                                setUploadingCapa(false);
                            } else if (imagemCapa) {
                                capaObj = { name: 'Capa', url: imagemCapa };
                            }

                            // Upload das imagens da galeria
                            let galeriaArr: { name: string; url: string }[] = [];
                            for (let i = 0; i < galeria.length; i++) {
                                const imgUri = galeria[i];
                                if (imgUri && !imgUri.startsWith('http')) {
                                    setUploadingGaleria(true);
                                    const base64 = await FileSystem.readAsStringAsync(imgUri, { encoding: FileSystem.EncodingType.Base64 });
                                    const res = await gravarImagemNotion({ IDIMAGEM: `galeria_${uniquePrefix}_${i}`, IMAGEM: base64 });
                                    if (res.ERRO) throw new Error(res.MSG_ERRO || `Erro ao enviar imagem da galeria ${i + 1}`);
                                    galeriaArr.push({ name: `Galeria ${i + 1}`, url: res.LINK });
                                } else if (imgUri) {
                                    galeriaArr.push({ name: `Galeria ${i + 1}`, url: imgUri });
                                }
                            }
                            setUploadingGaleria(false);

                            // Monta galeria final (capa + galeria)
                            let galeriaFinal = galeriaArr;
                            if (capaObj) {
                                galeriaFinal = [capaObj, ...galeriaArr];
                            }

                            const payload = {
                                nome: titulo,
                                descricao,
                                anunciante: responsavel,
                                titular: user,
                                whatsapp,
                                telefone,
                                instagram,
                                endereco,
                                horarios: horarioInicio && horarioFim ? `${horarioInicio} - ${horarioFim}` : '',
                                dias,
                                preco,
                                galeria: galeriaFinal.length > 0 ? galeriaFinal : undefined,
                                capa: capaObj || undefined,
                                categoryName: categorias.find(c => c.id === categoriaSelecionada)?.nome || '',
                            };

                            if (isEdit && item) {
                                await updateClassificado(item.id, payload);
                                setError('Anúncio editado com sucesso!', 'success');
                            } else {
                                await insertClassificado(payload);
                                setError('Anúncio enviado para avaliação!', 'success');
                            }
                            navigation.reset({
                                index: 0,
                                routes: [
                                    { name: '(tabs)' },
                                    { name: '(classificados)/List' },
                                ] as any // Corrige erro de tipagem
                            });
                        } catch (e: any) {
                            setError(e?.message || 'Erro ao enviar anúncio.', 'error');
                        } finally {
                            setIsSubmitting(false);
                            setUploadingCapa(false);
                            setUploadingGaleria(false);
                        }
                    },
                    {
                        beforePasswordComponents: [],
                        canConfirm: true
                    }
                );
            }
        });
    };

    // Função para aplicar máscara de horário HH:MM
    function maskTime(value: string) {
        let v = value.replace(/\D/g, '');
        if (v.length > 4) v = v.slice(0, 4);
        if (v.length > 2) v = v.replace(/(\d{2})(\d{1,2})/, '$1:$2');
        return v;
    }

    // Função para aplicar máscara de telefone/whatsapp (99) 99999-9999 ou (99) 9999-9999
    function maskPhone(value: string) {
        let v = value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 10) {
            // Celular com 9 dígitos
            v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (v.length > 6) {
            // Telefone fixo
            v = v.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
        } else if (v.length > 2) {
            v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else {
            v = v.replace(/(\d*)/, '$1');
        }
        return v;
    }

    // Função para aplicar máscara de preço: R$ 1,00
    function maskMoney(value: string) {
        // Remove tudo que não for número
        let v = value.replace(/\D/g, '');
        if (!v) return '';
        // Converte para centavos
        v = (parseInt(v, 10)).toString();
        while (v.length < 3) v = '0' + v;
        const reais = v.slice(0, v.length - 2);
        const centavos = v.slice(-2);
        // Formata com separador de milhar
        const reaisFormatado = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `R$ ${reaisFormatado},${centavos}`;
    }

    return (
        <>
            <Header title="Novo Anúncio" />
            <Wrapper
                style={[styles.container, { backgroundColor: background }]}
                primaryButtonLabel="Enviar Para Avaliação"
                onPrimaryPress={handleSubmit}
                isPrimaryButtonDisabled={isSubmitting}
            >
                <ScrollView>
                    <Text style={[styles.label, { color: tertiaryText }]}>ASSOCIADO</Text>
                    <TextInput
                        style={[styles.input, { color: disabledTextDark }]}
                        value={associado}
                        editable={false}
                        placeholderTextColor={neutralText}
                    />

                    <Text style={[styles.infoText, { color: text2 }]}>
                        Aqui você deve inserir as informações do seu serviço ou produto, a fim de expor todas as informações necessárias para a venda do mesmo.
                    </Text>

                    <Text style={[styles.label, { color: tertiaryText }]}>GRUPO</Text>
                    <DropdownFormPicker
                        anuncioItems={categorias.map((cat) => ({ value: cat.id, label: cat.nome }))}
                        onChangeValue={(val: string) => {
                            console.log('AnuncioForm - Categoria selecionada:', val);
                            setCategoriaSelecionada(val);
                        }}
                        selectedValue={categoriaSelecionada}
                    />

                    <Text style={[styles.label, { color: tertiaryText }]}>TÍTULO DO ANÚNCIO</Text>
                    <TextInput
                        style={[styles.input, { color: text2, backgroundColor: background1 }]}
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Título"
                        placeholderTextColor={neutralText}
                    />

                    <Text style={[styles.label, { color: tertiaryText }]}>ANUNCIANTE</Text>
                    <TextInput
                        style={[styles.input, { color: text2, backgroundColor: background1 }]}
                        value={responsavel}
                        onChangeText={setResponsavel}
                        placeholder="Nome do anunciante"
                        placeholderTextColor={neutralText}
                    />

                    <Text style={[styles.label, { color: tertiaryText }]}>ENDEREÇO</Text>
                    <TextInput
                        style={[styles.input, { color: text2, backgroundColor: background1 }]}
                        value={endereco}
                        onChangeText={setEndereco}
                        placeholder="Endereço"
                        placeholderTextColor={neutralText}
                    />

                    <Text style={[styles.label, { color: tertiaryText }]}>DIAS DE FUNCIONAMENTO</Text>
                    <TextInput
                        style={[styles.textArea, { color: text2, backgroundColor: backgroundFaded }]}
                        multiline
                        numberOfLines={10}
                        value={dias}
                        onChangeText={setDias}
                        placeholder="Dias de funcionamento"
                        placeholderTextColor={neutralText}
                    />

                    <Text style={[styles.label, { color: tertiaryText }]}>HORÁRIO DE FUNCIONAMENTO</Text>
                    <View style={styles.inlineInputs}>
                        <TextInput
                            style={[styles.input, styles.halfInput, { color: text2, backgroundColor: background1 }]}
                            placeholder="Horário de início"
                            value={horarioInicio}
                            onChangeText={text => setHorarioInicio(maskTime(text))}
                            placeholderTextColor={neutralText}
                        />
                        <TextInput
                            style={[styles.input, styles.halfInput, { color: text2, backgroundColor: background1 }]}
                            placeholder="Horário de fim"
                            value={horarioFim}
                            onChangeText={text => setHorarioFim(maskTime(text))}
                            placeholderTextColor={neutralText}
                        />
                    </View>

                    <Text style={[styles.label, { color: tertiaryText }]}>TELEFONE</Text>
                    <TextInput
                        style={[styles.input, { color: text2, backgroundColor: background1 }]}
                        value={telefone}
                        onChangeText={text => setTelefone(maskPhone(text))}
                        placeholder="Telefone"
                        placeholderTextColor={neutralText}
                    />

                    <Text style={[styles.label, { color: tertiaryText }]}>WHATSAPP</Text>
                    <TextInput
                        style={[styles.input, { color: text2, backgroundColor: background1 }]}
                        value={whatsapp}
                        onChangeText={text => setWhatsapp(maskPhone(text))}
                        placeholder="WhatsApp"
                        placeholderTextColor={neutralText}
                    />

                    <Text style={[styles.label, { color: tertiaryText }]}>LINK DO INSTAGRAM</Text>
                    <TextInput
                        style={[styles.input, { color: text2, backgroundColor: background1 }]}
                        placeholder="instagram.com/seu_usuário/"
                        value={instagram}
                        onChangeText={setInstagram}
                        placeholderTextColor={neutralText}
                    />
                    <Text style={[styles.infoText, { color: text2 }]}>Se quiser divulgar o perfil do Instagram, insira o link como: instagram.com/seu_usuário/</Text>

                    <Text style={[styles.label, { color: tertiaryText }]}>DESCRIÇÃO DO SERVIÇO OU PRODUTO</Text>
                    <TextInput
                        style={[styles.textArea, { color: text2, backgroundColor: backgroundFaded }]}
                        multiline
                        numberOfLines={4}
                        value={descricao}
                        onChangeText={setDescricao}
                        placeholder="Descrição"
                        placeholderTextColor={neutralText}
                    />

                    <Text style={[styles.label, { color: tertiaryText }]}>PREÇO DO SERVIÇO OU PRODUTO</Text>
                    <TextInput
                        style={[styles.input, { color: text2, backgroundColor: background1 }]}
                        placeholder="Ex.: a partir de R$100,00"
                        value={preco}
                        onChangeText={text => setPreco(maskMoney(text))}
                        keyboardType="numeric"
                        placeholderTextColor={neutralText}
                    />
                    <Text style={[styles.infoText, { color: text2 }]}>Aqui, você pode informar o preço ideal ou aproximado do seu serviço ou produto. Ex.: a partir de R$100,00.</Text>

                    <Text style={[styles.label, { color: tertiaryText }]}>ADICIONAR UMA IMAGEM DE CAPA</Text>
                    {imagemCapa ? (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: imagemCapa }} style={styles.image} />
                            {uploadingCapa ? (
                                <ActivityIndicator size="small" color={text2} style={styles.uploadIndicator} />
                            ) : (
                                <TouchableOpacity style={[styles.removeImageButton, { backgroundColor: error }]} onPress={removerImagemCapa}>
                                    <Text style={[styles.removeImageText, { color: contrastText }]}>Remover</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity style={[styles.button, { backgroundColor: backgroundFaded }]} onPress={handleSelecionarImagemCapa} disabled={uploadingCapa}>
                            <IconSymbol library="fontawesome" name="image" size={40} color={tertiaryText} />
                            <Text style={[styles.buttonText, { color: buttonAccent }]}>Adicionar Foto</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={[styles.label, { color: tertiaryText }]}>ADICIONE IMAGENS PARA A GALERIA</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                        {galeria.map((img, idx) => (
                            <View key={img} style={{ marginRight: 8, marginBottom: 8, position: 'relative' }}>
                                <Image source={{ uri: img }} style={styles.galleryImage} />
                                <TouchableOpacity style={[styles.removeGalleryButton, { backgroundColor: error }]} onPress={() => removerImagemGaleria(img)}>
                                    <Text style={[styles.removeImageText, { color: contrastText }]}>X</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                    {galeria.length < 6 && (
                        <TouchableOpacity style={[styles.button, { backgroundColor: backgroundFaded }]} onPress={handleSelecionarGaleria} disabled={uploadingGaleria}>
                            <IconSymbol library="fontawesome" name="image" size={40} color={tertiaryText} />
                            <Text style={[styles.buttonText, { color: buttonAccent }]}>Adicionar Fotos</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={[styles.infoText, { color: text2 }]}>Selecione até 6 imagens.</Text>
                </ScrollView>
            </Wrapper>
            <BottomSheet
                visible={modalRegulations.isOpen}
                onClose={() => setModalRegulations({ isOpen: false, action: () => { } })}
                primaryButtonLabel={'Continuar'}
                onPrimaryPress={() => {
                    if (!agreeWithRegulation) {
                        setError('Você precisa aceitar os termos e condições', 'error', 1000);
                        return;
                    }
                    setAgreeWithRegulation(false);
                    modalRegulations.action();
                }}
            >
                <Text style={[styles.termosTitle, { color: text2 }]}>Termos de uso</Text>
                <ScrollView style={{ marginBottom: 12, maxHeight: 200 }}>
                    <Text style={[styles.termosText, { color: text2 }]}>{termoUso || 'Carregando termos...'}</Text>
                </ScrollView>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={() => setAgreeWithRegulation((prev) => !prev)}
                        style={[styles.checkbox, { borderColor: text2 }, agreeWithRegulation && { backgroundColor: brand }]}
                    >
                        {agreeWithRegulation && <Text style={{ color: contrastText }}>✓</Text>}
                    </TouchableOpacity>
                    <Text style={[styles.checkboxText, { color: text2 }]}>Eu li e concordo com os termos e condições</Text>
                </View>
            </BottomSheet>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 20,
    },
    input: {
        borderRadius: 8,
        padding: 10,
        paddingVertical: 12,
        marginTop: 8,
    },
    textArea: {
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
        textAlignVertical: 'top',
        height: 150,
    },
    infoText: {
        fontSize: 12,
        marginTop: 10,
    },
    inlineInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    button: {
        borderRadius: 8,
        padding: 60,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 5,
        marginBottom: 10,
    },
    removeImageButton: {
        padding: 8,
        borderRadius: 5,
    },
    removeImageText: {
        fontWeight: 'bold',
    },
    uploadIndicator: {
        marginVertical: 10,
    },
    galleryImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
    },
    removeGalleryButton: {
        position: 'absolute',
        top: 2,
        right: 2,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    termosTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    termosText: {
        marginBottom: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderRadius: 4,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxInner: {
        width: 14,
        height: 14,
        borderRadius: 2,
    },
    checkboxText: {
        fontSize: 14,
    },
});