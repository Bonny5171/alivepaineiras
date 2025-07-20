import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { listarAssociados, Associado } from '@/api/app/consultas';
import { IconSymbol } from '@/components/ui/IconSymbol';
import CachedImage from '../components/CachedImage';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AssociadosListProps {
  titulo?: string;
  selectedAssociado: string;
  onSelect: (associado: string | Associado) => void;
  showTodos?: boolean;
  returnObject?: boolean;
}

export const AssociadosList: React.FC<AssociadosListProps> = ({
  titulo = 'ASSOCIADOS',
  selectedAssociado,
  onSelect,
  showTodos = true,
  returnObject = false,
}) => {
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [loading, setLoading] = useState(true);

  // Obter cores do tema
  const text = useThemeColor({}, 'text');
  const brand = useThemeColor({}, 'brand');
  const background1 = useThemeColor({}, 'background1');
  const text2 = useThemeColor({}, 'text2');
  const textFaded = useThemeColor({}, 'textFaded');
  const secondaryTextLight = useThemeColor({}, 'secondaryTextLight');

  useEffect(() => {
    listarAssociados()
      .then(data => setAssociados(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View>
      <Text style={[styles.title, { color: text }]}>{titulo}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {/* Ícone Todos */}
        {showTodos && (
          <TouchableOpacity onPress={() => onSelect('todos')} style={styles.associadoContainer}>
            <View style={[styles.borderContainer, { borderColor: selectedAssociado === 'todos' ? brand : 'transparent' }]}>
              <View style={[styles.avatarContainer, { backgroundColor: background1 }]}>
                <IconSymbol name="users" size={28} color={text2} />
              </View>
            </View>
            <Text style={[styles.associadoName, { color: textFaded }]}>Todos</Text>
          </TouchableOpacity>
        )}
        {loading ? (
          <ActivityIndicator style={styles.loading} color={brand} />
        ) : (
          associados.map((assoc) => (
            <TouchableOpacity
              key={assoc.IDPESSOA}
              onPress={() => onSelect(returnObject ? assoc : assoc.TITULO)}
              style={styles.associadoContainer}
            >
              <View style={[styles.borderContainer, { borderColor: (typeof selectedAssociado === 'object' ? selectedAssociado?.TITULO : selectedAssociado) === assoc.TITULO ? brand : 'transparent' }]}>
                <View style={[styles.avatarContainer, { backgroundColor: background1 }]}>
                  {assoc.AVATAR ? (
                    <CachedImage source={{ uri: assoc.AVATAR }} style={styles.avatarImage} />
                  ) : (
                    <Text style={[styles.initials, { color: text2 }]}>
                      {assoc.NOME.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </Text>
                  )}
                </View>
              </View>
              <Text
                style={[styles.associadoName, { color: assoc.AVATAR ? textFaded : secondaryTextLight }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {assoc.NOME.split(' ')[0] + (assoc.NOME.split(' ')[1] ? ' ' + assoc.NOME.split(' ')[1][0] + '.' : '')}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
    marginTop: 10,
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  scrollView: {
    marginBottom: 10,
    paddingLeft: 10,
  },
  associadoContainer: {
    alignItems: 'center',
    marginRight: 5,
  },
  borderContainer: {
    borderWidth: 3,
    borderRadius: 32,
    padding: 3,
  },
  avatarContainer: {
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 32,
  },
  initials: {
    fontSize: 20,
    fontWeight: '500',
  },
  associadoName: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  loading: {
    marginLeft: 10,
  },
});