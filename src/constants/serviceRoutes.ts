// constants/serviceRoutes.ts
// Mapeia IDSERVICO (ou outro id) para o id do menu/search e o caminho de navegação

export interface ServiceRoute {
  idServico: number; // IDSERVICO da API
  menuId: string;    // id do menu/search
  route: string;     // caminho de navegação do app
  params?: any;      // params opcionais para navegação
}

export const serviceRoutes: ServiceRoute[] = [
  {
    idServico: 201,
    menuId: 'saude',
    route: '(consulta)/index',
    params: { screen: 'Home' },
  },
  {
    idServico: 204,
    menuId: 'ouvidoria',
    route: '(manifest)/manifest',
  },
  {
    idServico: 206,
    menuId: 'secretaria',
    route: '(mais)',
  },
  {
    idServico: 209,
    menuId: 'validar-estacionamento',
    route: '(tabs)/ticket',
  },
  {
    idServico: 301,
    menuId: 'esportes',
    route: '(tabs)/(sports)/home',
  },
  // Adicionados conforme search.tsx
  {
    idServico: 303,
    menuId: 'cultural',
    route: '(tabs)/(cultural)/home',
  },
  {
    idServico: 501,
    menuId: 'financeiro',
    route: '(financeiro)/home',
    params: { screen: 'Home' },
  },
  {
    idServico: 504,
    menuId: 'financeiro',
    route: '(financeiro)/faturas',
    params: { screen: 'Home' },
  },
  {
    idServico: 205,
    menuId: 'convidados',
    route: '(invites)/list',
  },
  {
    idServico: 202,
    menuId: 'dependentes',
    route: '(dependents)/List',
  },
  {
    idServico: 1401,
    menuId: 'servicos',
    route: '(services)/List',
  },
  {
    idServico: 1901,
    menuId: 'classificados',
    route: '(classificados)/List',
  },
  {
    idServico: 2301,
    menuId: 'programacao-telao',
    route: 'screenSchedule',
  },
  {
    idServico: 102,
    menuId: 'cinema',
    route: 'movieSchedule',
  },
  {
    idServico: 1601,
    menuId: 'locacoes',
    route: '(locacoes)/List',
  },
  {
    idServico: 1201,
    menuId: 'compra-de-ingressos',
    route: '', // Abre link externo
  },
  {
    idServico: 15101,
    menuId: 'clube',
    route: 'clube', // Abre tela clube
  },
  {
    idServico: 901,
    menuId: 'central-de-ajuda',
    route: '', // Não definido
  },
];

// Função utilitária para buscar rota pelo IDSERVICO
export function getRouteByIdServico(idServico: number | string): ServiceRoute | undefined {
  // Permite comparar string ou number
  return serviceRoutes.find(r => r.idServico.toString() === idServico.toString());
}

// Função utilitária para buscar rota pelo menuId
export function getRouteByMenuId(menuId: string): ServiceRoute | undefined {
  return serviceRoutes.find(r => r.menuId === menuId);
}
