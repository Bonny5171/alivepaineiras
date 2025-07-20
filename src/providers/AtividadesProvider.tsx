import React, { createContext, useContext, useState } from "react";

interface AtividadesContextType {
  atividades: any[];
  setAtividades: (atividades: any[]) => void;
}

const AtividadesContext = createContext<AtividadesContextType | null>(null);

export const AtividadesProvider = ({ children }: { children: React.ReactNode }) => {
  const [atividades, setAtividades] = useState<any[]>([]);

  return (
    <AtividadesContext.Provider value={{ atividades, setAtividades }}>
      {children}
    </AtividadesContext.Provider>
  );
};

export const useAtividades = () => {
  const context = useContext(AtividadesContext);
  if (!context) {
    throw new Error("useAtividades deve ser usado dentro de um AtividadesProvider");
  }
  return context;
};
