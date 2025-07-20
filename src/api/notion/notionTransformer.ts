import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export const transformNotionPage = (page: PageObjectResponse) => {
  return {
    id: page.id,
    title: page.properties.Name?.title[0]?.plain_text || "Sem título",
  };
};

interface SimplifiedPage {
  id: string;
  createdTime: string;
  lastEditedTime: string;
  createdBy: string;
  lastEditedBy: string;
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  periodStart?: string;
  periodEnd?: string;
}

export function simplifyNotionBanners(pages: any[]): SimplifiedPage[] {
  return pages.map(page => {
      const properties = page.properties;

      return {
          id: page.id,
          createdTime: page.created_time,
          lastEditedTime: page.last_edited_time,
          createdBy: page.created_by.id,
          lastEditedBy: page.last_edited_by.id,
          title: properties.Nome.title[0]?.plain_text || '',
          description: properties.Descrição.rich_text[0]?.plain_text || '',
          link: properties.Link.url || '',
          imageUrl: properties.Imagem.files[0]?.file?.url || undefined,
          periodStart: properties['Período']?.date?.start || undefined,
          periodEnd: properties['Período']?.date?.end || undefined,
      };
  });
}

export interface TransformedService {
  Titulo: string;
  ID: string;
  Icon: string | null;
  ImageCover: string | null;
  WifiDisponivel: boolean;
  Descricao: string;
  WhatsApp: string | null;
  Instagram: string | null;
  Telefone: string | null;
  Horarios: string | null;
  Tipo: string | null;
  Localizacao: string | null;
  Site: string | null;
}

export const transformServiceData = (notionData: any[]): TransformedService[] => {
  return notionData.map(page => {
    const properties = page.properties;
    
    return {
      Titulo: properties.Título?.title?.[0]?.plain_text || '',
      ID: page.id,
      Icon: properties.Icon?.rich_text?.[0]?.plain_text || null, // Agora busca de um campo rich_text
      ImageCover: page.cover?.file?.url || null,
      WifiDisponivel: properties['Wifi Disponível']?.checkbox || false,
      Descricao: properties.Descrição?.rich_text?.[0]?.plain_text || '',
      WhatsApp: properties.WhatsApp?.phone_number || null,
      Instagram: properties.Instagram?.rich_text?.[0]?.plain_text || null,
      Telefone: properties.Telefone?.phone_number || null,
      Horarios: properties.Horários?.rich_text?.[0]?.plain_text || null,
      Tipo: properties.Tipo?.select?.name || null,
      Localizacao: properties.Localização?.rich_text?.[0]?.plain_text || null,
      Site: properties.Site?.url || null
    };
  });
};

export interface TransformedFaq {
  title: string;
  subtitle: string;
  category: string;
  id: string;
}

export const transformFaqData = (notionData: any[]): TransformedFaq[] => {
  return notionData.map(page => {
    const properties = page.properties;
    return {
      title: properties.Pergunta?.title?.[0]?.plain_text?.trim() || '',
      subtitle: properties.Resposta?.rich_text?.map((r: any) => r.plain_text).join('') || '',
      category: properties.Categoria?.select?.name || 'Sem categoria',
      id: page.id,
    };
  });
};