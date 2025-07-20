// Defina os tipos TypeScript para a API do seu aplicativo aqui
export interface AppData {
  id: string;
  name: string;
}

export type Filter = {
  NOME: string;
  AVATAR?: string;
  TITULO: string;
};