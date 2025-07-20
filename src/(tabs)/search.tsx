import { View, Text } from 'react-native'
import React from 'react'
import { Wrapper } from '@/components/Wrapper'
import DynamicList, { ListItem } from '@/components/DynamicList';
import { ThemedText } from '@/components/ThemedText';
import Header from '@/components/Header';
import FooterTabBar from '@/components/FooterTabBar';
import { useNavigation } from '@react-navigation/native';
import { getRouteByIdServico } from '@/constants/serviceRoutes';
import { listarServicos, ServicoItem } from '@/api/app/appointments';

export default function buscar() {
  const navigation = useNavigation();
  // IDs de grupos e serviços conforme tabela fornecida
  const gruposServicos = {
    financeiro: {
      grupo: 500,
      servicos: [501, 502, 503, 504, 505, 506, 507],
    },
    esportes: {
      grupo: 300,
      servicos: [301, 302, 303, 304, 305, 10301, 10302, 10303, 10304, 10305],
    },
    cultural: {
      grupo: 10300,
      servicos: [303, 10301, 10302, 10303, 10304, 10305], // Cultural depende desses serviços
    },
    saude: {
      grupo: 200,
      servicos: [201],
    },
    convidados: {
      grupo: 200,
      servicos: [205],
    },
    dependentes: {
      grupo: 200,
      servicos: [202],
    },
    'validar-estacionamento': {
      grupo: 800,
      servicos: [801],
    },
    ticket: {
      grupo: 800,
      servicos: [801],
    },
    secretaria: {
      grupo: 200,
      servicos: [204],
    },
    servicos: {
      grupo: 1400,
      servicos: [1401],
    },
    classificados: {
      grupo: 1900,
      servicos: [1901],
    },
    'programacao-telao': {
      grupo: 2300,
      servicos: [2301],
    },
    cinema: {
      grupo: 200,
      servicos: [102],
    },
    locacoes: {
      grupo: 1600,
      servicos: [1601],
    },
    'compra-de-ingressos': {
      grupo: 15100,
      servicos: [15102],
    },
    clube: {
      grupo: 15100, // Corrigido para o grupo retornado pela API
      servicos: [15101], // Corrigido para o serviço retornado pela API
    },
    ouvidoria: {
      grupo: 200,
      servicos: [204],
    },
    'central-de-ajuda': {
      grupo: 900,
      servicos: [901],
    },
  };

  const [allowedMenuIds, setAllowedMenuIds] = React.useState<string[]>([]);
  const [allowedGrupos, setAllowedGrupos] = React.useState<number[]>([]);
  const [allowedServicos, setAllowedServicos] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    listarServicos().then((servicos: ServicoItem[]) => {
      // Pega todos os grupos e serviços permitidos
      const grupos = new Set<number>();
      const servicosIds = new Set<number>();
      servicos.forEach(s => {
        if (s.IDGRUPO) grupos.add(Number(s.IDGRUPO));
        if (s.IDSERVICO) servicosIds.add(Number(s.IDSERVICO));
      });
      setAllowedGrupos(Array.from(grupos));
      setAllowedServicos(Array.from(servicosIds));
      setLoading(false);
    });
  }, []);

  const menuItems: ListItem[] = [
    // ATIVIDADES
    {
      title: 'Esportes',
      icon: 'volleyball',
      iconLibrary: 'fontawesome',
      category: 'Atividades',
      id: 'esportes',
      // @ts-ignore
      onPress: () => navigation.navigate('(tabs)/(sports)/home'),
    },
    {
      title: 'Cultural',
      icon: 'masks-theater',
      iconLibrary: 'fontawesome',
      category: 'Atividades',
      id: 'cultural',
      // @ts-ignore
      onPress: () => navigation.navigate('(tabs)/(cultural)/home'),
    },
    {
      title: 'Saúde',
      icon: 'heart-pulse',
      iconLibrary: 'fontawesome',
      category: 'Atividades',
      id: 'saude',
      // @ts-ignore
      onPress: () => navigation.navigate('(consulta)/index', { screen: 'Home' }),
    },

    // ASSOCIADO
    {
      title: 'Financeiro',
      icon: 'dollar-sign',
      iconLibrary: 'fontawesome',
      category: 'Associado',
      id: 'financeiro',
      // @ts-ignore
      onPress: () => navigation.navigate('(financeiro)/home', { screen: 'Home' }),
    },
    {
      title: 'Convidados',
      icon: 'user-plus',
      iconLibrary: 'fontawesome',
      category: 'Associado',
      id: 'convidados',
      // @ts-ignore
      onPress: () => navigation.navigate('(invites)/list'),
    },
    {
      title: 'Dependentes',
      icon: 'users',
      iconLibrary: 'fontawesome',
      category: 'Associado',
      id: 'dependentes',
      // @ts-ignore
      onPress: () => navigation.navigate('(dependents)/List'),
    },
    {
      title: 'Validar ticket',
      icon: 'car',
      iconLibrary: 'fontawesome',
      category: 'Associado',
      id: 'validar-estacionamento',
      // @ts-ignore
      onPress: () => navigation.navigate('(tabs)/ticket'),
    },

    // CLUBE
    {
      title: 'Secretaria',
      icon: 'user-tie',
      iconLibrary: 'fontawesome',
      category: 'Clube',
      id: 'secretaria',
      // @ts-ignore
      onPress: () => navigation.navigate('(mais)'),
    },
    {
      title: 'Serviços',
      icon: 'clock',
      iconLibrary: 'fontawesome',
      category: 'Clube',
      id: 'servicos',
      // @ts-ignore
      onPress: () => navigation.navigate('(services)/List'),
    },
    {
      title: 'Classificados',
      icon: 'newspaper',
      iconLibrary: 'fontawesome',
      category: 'Clube',
      id: 'classificados',
      // @ts-ignore
      onPress: () => navigation.navigate('(classificados)/List'),
    },
    {
      title: 'Programação do telão',
      icon: 'tv',
      iconLibrary: 'fontawesome',
      category: 'Clube',
      id: 'programacao-telao',
      // @ts-ignore
      onPress: () => navigation.navigate('screenSchedule'),
    },
    {
      title: 'Cinema',
      icon: 'film',
      iconLibrary: 'fontawesome',
      category: 'Clube',
      id: 'cinema',
      // @ts-ignore
      onPress: () => navigation.navigate('movieSchedule'),
    },
    {
      title: 'Locações',
      icon: 'calendar-check',
      iconLibrary: 'fontawesome',
      category: 'Clube',
      id: 'locacoes',
      // @ts-ignore
      onPress: () => navigation.navigate('(locacoes)/List'),
    },
    {
      title: 'Compra de ingressos',
      icon: 'globe',
      iconLibrary: 'fontawesome',
      category: 'Clube',
      id: 'compra-de-ingressos',
      // Abre o link no navegador externo
      onPress: () => {
        // @ts-ignore
        import('expo-linking').then(Linking => {
          Linking.openURL('https://clubepaineiras.showare.com.br/?sw_sc=Internet');
        });
      },
    },
    {
      title: 'Clube',
      icon: 'buildings',
      category: 'Clube',
      id: 'clube',
      // Abre o link no navegador externo
      onPress: () => {
        // @ts-ignore
        navigation.navigate('clube')
      },
    },

    // CONTATO
    {
      title: 'Ouvidoria',
      icon: 'bullhorn',
      iconLibrary: 'fontawesome',
      category: 'Contato',
      id: 'ouvidoria',
      // @ts-ignore
      onPress: () => navigation.navigate('(manifest)/manifest'),
    },
    {
      title: 'Central de ajuda',
      icon: 'question-circle',
      iconLibrary: 'fontawesome',
      category: 'Contato',
      id: 'central-de-ajuda',
      onPress: () => {
        // @ts-ignore
        navigation.navigate('faqList');
      }
    },
  ];
  // Novo filtro de menuItems
  const hiddenMenuItems: ListItem[] = [];
  const filteredMenuItems = menuItems.filter(item => {
    // Central de ajuda sempre visível
    if (item.id === 'central-de-ajuda') return true;
    const ref = gruposServicos[item.id as keyof typeof gruposServicos];
    if (!ref) return true; // Se não houver referência, não filtra
    // Se não veio o grupo, oculta
    if (!allowedGrupos.includes(ref.grupo)) {
      hiddenMenuItems.push(item);
      return false;
    }
    // Para "cultural", só mostra se vier pelo menos um dos serviços 1030x
    if (item.id === 'cultural') {
      const show = ref.servicos.some(sid => allowedServicos.includes(sid));
      if (!show) hiddenMenuItems.push(item);
      return show;
    }
    // Para outros, se não vier nenhum dos serviços, oculta
    const show = ref.servicos.some(sid => allowedServicos.includes(sid));
    if (!show) hiddenMenuItems.push(item);
    return show;
  });

  React.useEffect(() => {
    if (!loading) {
      if (hiddenMenuItems.length > 0) {
        // eslint-disable-next-line no-console
        console.log('Itens ocultados:', hiddenMenuItems.map(i => i.title));
      }
    }
  }, [loading]);

  const handleItemClick = (clickedItem: { id: string } | ListItem) => {
    // Encontra o item completo na array menuItems
    const fullItem = menuItems.find(item => item.id === clickedItem.id);

    if (fullItem?.onPress) {
      fullItem.onPress(); // Executa o onPress do item completo
    }
    // Não mostra mensagem de navegação não configurada durante loading
  };

  return (
    <>
      <Wrapper isLoading={loading}>
        <Header title='Mais opções' bigTitle />
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }}>
          <DynamicList
            searchable
            data={filteredMenuItems}
            onClickPrimaryButton={handleItemClick}
          />
        </View>
      </Wrapper>
      <FooterTabBar activeTab='buscar' />
    </>
  );
}