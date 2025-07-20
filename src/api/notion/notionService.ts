import notionClient from './notionClient';
import { transformFaqData } from './notionTransformer';

const NOTION_TELAO = "4bd8ec2b8aa54b2197785ee2bdda9d91"; // ID do banco de dados Telão
const NOTION_CINEMA = "08357ad239fb4ebfaf0680eb7bccef27";
const NOTION_BANNERS = "6f69861e1f334ed4a562578c63177d67"; // ID do banco de dados Banners
const NOTION_SERVICES = "6c586efd29754837963c6341c430129f"
const NOTIONS_CLASSIFICADOS = "f09b76477e084e3eb926ed59ffeedcde"; // ID do banco de dados Classificados
const NOTIONS_CATEGORIAS = "d9a64af2f64345dbbab1a324f98871fd";
const NOTIONS_CLASSIFICADOS_TERMOS = "86ea26e86893438a8d7066a6128abc19";
const NOTIONS_FAQ = "5cb5d39a49884f5eb932d5aa5d3e8e07"; // ID do banco de dados FAQ

// Função para buscar dados do Telão
export const fetchTelaoData = async () => {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTION_TELAO,
    });
    return response.results;
  } catch (error) {
    console.error('Erro ao buscar dados do Telão:', error);
    return [];
  }
};

const formatDate = (date: any) => {
  return date.toISOString().split("T")[0]; // Pega só a parte da data (sem hora)
};

// Função para buscar dados dos Banners
export const fetchBannersData = async () => {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTION_BANNERS,
    });
    return response.results;
  } catch (error) {
    console.error("Erro ao buscar dados do Notion:", error);
    return [];
  }
};

// Função para buscar dados dos Cinema
export const fetchCinemaData = async () => {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTION_CINEMA,
    });
    return response.results;
  } catch (error) {
    console.error("Erro ao buscar dados do Notion:", error);
    return [];
  }
};

// Função para buscar dados dos Serviços
export const fetchServicesData = async () => {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTION_SERVICES,
    });
    return response.results;
  } catch (error) {
    console.error('Erro ao buscar dados dos Serviços:', error);
    return [];
  }
};

export const fetchAllClassificadosData = async () => {
  try {
    // Primeiro buscamos todas as categorias
    const categoriesResponse = await notionClient.databases.query({
      database_id: NOTIONS_CATEGORIAS, // ID do banco de dados de categorias
      page_size: 100,
    });

    // Criamos um mapa de categorias para consulta rápida
    const categoriesMap = new Map<string, string>();
    categoriesResponse.results.forEach((category: any) => {
      categoriesMap.set(
        category.id,
        category.properties?.Nome?.title?.[0]?.plain_text || 'Sem nome'
      );
    });

    // Agora buscamos os classificados
    let allResults: any = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response = await notionClient.databases.query({
        database_id: NOTIONS_CLASSIFICADOS,
        start_cursor: startCursor ?? undefined,
        page_size: 100,
      });

      // Mapeamos os resultados para incluir o nome da categoria
      const enrichedResults = response.results.map((item: any) => {
        const categoryId = item.properties?.Categoria?.relation?.[0]?.id;
        return {
          ...item,
          categoryName: categoryId ? categoriesMap.get(categoryId) : 'Sem categoria',
        };
      });

      allResults = [...allResults, ...enrichedResults];
      hasMore = response.has_more;
      startCursor = response.next_cursor ?? undefined;
    }

    return allResults;
  } catch (error) {
    console.error('Erro ao buscar dados dos Classificados:', error);
    return [];
  }
};

// Função para buscar todas as categorias
export const fetchCategoriasData = async () => {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTIONS_CATEGORIAS,
      page_size: 100,
    });
    return response.results;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

export interface ClassificadoInput {
  nome: string;
  descricao: string;
  anunciante: string;
  titular: string;
  whatsapp?: string;
  telefone?: string;
  instagram?: string;
  endereco?: string;
  horarios?: string;
  dias?: string;
  preco?: string;
  site?: string;
  galeria?: { name: string; url: string }[];
  visualizacoes?: number;
  status?: string;
  categoryName: string;
  capa?: { name: string; url: string }; // Adiciona campo para imagem de capa
}

export const insertClassificado = async (input: ClassificadoInput) => {
  try {
    // Buscar a categoria pelo nome para obter o ID
    const categorias = await notionClient.databases.query({
      database_id: NOTIONS_CATEGORIAS,
      filter: {
        property: 'Nome',
        title: {
          equals: input.categoryName,
        },
      },
      page_size: 1,
    });

    if (!categorias.results.length) {
      throw new Error('Categoria não encontrada');
    }

    const categoriaId = categorias.results[0].id;

    // Monta o objeto de propriedades
    const properties: any = {
      Nome: {
        title: [{ text: { content: input.nome } }],
      },
      Descrição: {
        rich_text: [{ text: { content: input.descricao } }],
      },
      Anunciante: {
        rich_text: [{ text: { content: input.anunciante } }],
      },
      Titular: {
        rich_text: [{ text: { content: input.titular } }],
      },
      WhatsApp: input.whatsapp
        ? { phone_number: input.whatsapp }
        : undefined,
      Telefone: input.telefone
        ? { phone_number: input.telefone }
        : undefined,
      Instagram: input.instagram
        ? { rich_text: [{ text: { content: input.instagram } }] }
        : undefined,
      Endereço: input.endereco
        ? { rich_text: [{ text: { content: input.endereco } }] }
        : undefined,
      Horários: input.horarios
        ? { rich_text: [{ text: { content: input.horarios } }] }
        : undefined,
      Dias: input.dias
        ? { rich_text: [{ text: { content: input.dias } }] }
        : undefined,
      Preço: input.preco
        ? { rich_text: [{ text: { content: input.preco } }] }
        : undefined,
      Site: input.site
        ? { url: input.site }
        : undefined,
      Galeria: input.galeria
        ? {
            files: input.galeria.map((file) => ({
              name: file.name,
              type: 'external',
              external: { url: file.url },
            })),
          }
        : undefined,
      Visualizações: input.visualizacoes !== undefined
        ? { number: input.visualizacoes }
        : undefined,
      Status: input.status
        ? { status: { name: input.status } }
        : undefined,
      Categoria: {
        relation: [{ id: categoriaId }],
      },
    };

    // Remove propriedades undefined (Notion não aceita)
    Object.keys(properties).forEach(
      (key) => properties[key] === undefined && delete properties[key]
    );

    // Monta o objeto de criação da página
    const pagePayload: any = {
      parent: { database_id: NOTIONS_CLASSIFICADOS },
      properties,
    };

    // Se houver capa, adiciona ao payload
    if (input.capa) {
      pagePayload.cover = {
        type: 'external',
        external: { url: input.capa.url },
      };
    }

    const response = await notionClient.pages.create(pagePayload);

    return response;
  } catch (error) {
    console.error('Erro ao inserir classificado:', error);
    throw error;
  }
};

export const fetchClassificadosTermos = async () => {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTIONS_CLASSIFICADOS_TERMOS,
      page_size: 100,
    });
    return response.results;
  } catch (error) {
    console.error('Erro ao buscar termos dos Classificados:', error);
    return [];
  }
};

// Função para buscar dados do FAQ
export const fetchFaqData = async () => {
  try {
    const response = await notionClient.databases.query({
      database_id: NOTIONS_FAQ,
      page_size: 100,
    });
    const transformed = transformFaqData(response.results);
    return transformed;
  } catch (error) {
    console.error('Erro ao buscar dados do FAQ:', error);
    return [];
  }
};

export const updateClassificadoStatus = async (classificadoId: string, status: string) => {
  try {
    const response = await notionClient.pages.update({
      page_id: classificadoId,
      properties: {
        Status: {
          status: { name: status },
        },
      },
    });
    return response;
  } catch (error) {
    console.error('Erro ao atualizar status do classificado:', error);
    throw error;
  }
};

export const updateClassificado = async (classificadoId: string, input: Partial<ClassificadoInput>) => {
  try {
    // Buscar a categoria pelo nome para obter o ID, se for passado
    let categoriaId;
    if (input.categoryName) {
      const categorias = await notionClient.databases.query({
        database_id: NOTIONS_CATEGORIAS,
        filter: {
          property: 'Nome',
          title: {
            equals: input.categoryName,
          },
        },
        page_size: 1,
      });
      if (!categorias.results.length) {
        throw new Error('Categoria não encontrada');
      }
      categoriaId = categorias.results[0].id;
    }

    // Monta o objeto de propriedades
    const properties: any = {};
    if (input.nome) properties.Nome = { title: [{ text: { content: input.nome } }] };
    if (input.descricao) properties.Descrição = { rich_text: [{ text: { content: input.descricao } }] };
    if (input.anunciante) properties.Anunciante = { rich_text: [{ text: { content: input.anunciante } }] };
    if (input.titular) properties.Titular = { rich_text: [{ text: { content: input.titular } }] };
    if (input.whatsapp) properties.WhatsApp = { phone_number: input.whatsapp };
    if (input.telefone) properties.Telefone = { phone_number: input.telefone };
    if (input.instagram) properties.Instagram = { rich_text: [{ text: { content: input.instagram } }] };
    if (input.endereco) properties.Endereço = { rich_text: [{ text: { content: input.endereco } }] };
    if (input.horarios) properties.Horários = { rich_text: [{ text: { content: input.horarios } }] };
    if (input.dias) properties.Dias = { rich_text: [{ text: { content: input.dias } }] };
    if (input.preco) properties.Preço = { rich_text: [{ text: { content: input.preco } }] };
    if (input.site) properties.Site = { url: input.site };
    if (input.galeria) properties.Galeria = {
      files: input.galeria.map((file) => ({
        name: file.name,
        type: 'external',
        external: { url: file.url },
      })),
    };
    if (input.visualizacoes !== undefined) properties.Visualizações = { number: input.visualizacoes };
    if (input.status) properties.Status = { status: { name: input.status } };
    if (categoriaId) properties.Categoria = { relation: [{ id: categoriaId }] };

    // Remove propriedades undefined
    Object.keys(properties).forEach(
      (key) => properties[key] === undefined && delete properties[key]
    );

    // Monta o objeto de atualização da página
    const pagePayload: any = {
      page_id: classificadoId,
      properties,
    };

    // Se houver capa, adiciona ao payload
    if (input.capa) {
      pagePayload.cover = {
        type: 'external',
        external: { url: input.capa.url },
      };
    }

    const response = await notionClient.pages.update(pagePayload);
    return response;
  } catch (error) {
    console.error('Erro ao atualizar classificado:', error);
    throw error;
  }
};

