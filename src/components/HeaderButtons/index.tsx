import React from 'react';
import IconButtonComponent from './IconButtonComponent';

interface IconButtonProps {
  buttons: Array<{
    label: string; // Texto junto com o ícone
    icon: string; // Nome do ícone
    onPress: () => void; // Função ao pressionar o botão
  }>;
}

const IconButton: React.FC<IconButtonProps> = ({ buttons }) => {
  return <IconButtonComponent buttons={buttons} />;
};

export default IconButton;