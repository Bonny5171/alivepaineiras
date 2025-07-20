import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Wrapper } from '@/components/Wrapper';
import { listarQuantidadeServicos } from '@/api/app/auth';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function _layout() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [contadores, setContadores] = useState({
    servicos: 0,
    dependentes: 0,
    convites: 0,
    locacoes: 0,
  });
  const [imagemContato, setImagemContato] = useState<string | null>(null);

  // Theme colors
  const background = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'background2');
  const titleColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'text2');
  const accent = useThemeColor({}, 'brand');
  const feedbackCardBg = useThemeColor({}, 'lightPink');
  const feedbackText = useThemeColor({}, 'text');

  const fetchQuantidade = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listarQuantidadeServicos();
      if (Array.isArray(response) && response.length > 0) {
        const servicos = response[0].SERVICO || [];
        setContadores({
          servicos: servicos.find((s: any) => s.IDSERVICO === 1)?.QUANTIDADE || 0,
          dependentes: servicos.find((s: any) => s.IDSERVICO === 2)?.QUANTIDADE || 0,
          convites: servicos.find((s: any) => s.IDSERVICO === 3)?.QUANTIDADE || 0,
          locacoes: servicos.find((s: any) => s.IDSERVICO === 4)?.QUANTIDADE || 0,
        });
        setImagemContato(response[0].IMAGEM_CONTATO || null);
      }
    } catch (e) {
      setContadores({ servicos: 0, dependentes: 0, convites: 0, locacoes: 0 });
      setImagemContato(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchQuantidade();
  }, [fetchQuantidade]);

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: background,
      flex: 1,
    },
    title: {
      color: titleColor,
      fontSize: 14,
      fontWeight: '500',
      marginVertical: 10,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    card: {
      width: '47%',
      backgroundColor: cardBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: titleColor,
    },
    cardSubtitle: {
      fontSize: 13,
      color: subtitleColor,
    },
    feedbackRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      gap: 12,
    },
    feedbackCard: {
      flex: 1,
      backgroundColor: feedbackCardBg,
      paddingVertical: 20,
      gap: 10,
      borderRadius: 12,
      alignItems: 'center',
    },
    feedbackText: {
      color: feedbackText,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <>
      <Header title="Secretaria Digital" bigTitle />
      <Wrapper style={styles.container} isLoading={isLoading}>
        <Text style={styles.title}>SERVIÇOS DO CLUBE</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} onPress={() => { (navigation as any).navigate('(services)/List'); }}>
            <IconSymbol library="fontawesome" name="list-alt" size={20} color={accent} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Serviços</Text>
              <Text style={styles.cardSubtitle}>{contadores.servicos} opções</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => { (navigation as any).navigate('(classificados)/List'); }}>
            <IconSymbol library="fontawesome" name="bullhorn" size={20} color={accent} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Classificados</Text>
              <Text style={styles.cardSubtitle}>152 publicações</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => { (navigation as any).navigate('(dependents)/List'); }}>
            <IconSymbol library="fontawesome" name="users" size={20} color={accent} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Dependentes</Text>
              <Text style={styles.cardSubtitle}>{contadores.dependentes} associados</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => { (navigation as any).navigate('(locacoes)/List'); }}>
            <IconSymbol library="fontawesome" name="calendar-clock" size={20} color={accent} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Locações</Text>
              <Text style={styles.cardSubtitle}>{contadores.locacoes} registros</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => { (navigation as any).navigate('(invites)/list'); }}>
            <IconSymbol library="fontawesome" name="ticket" size={20} color={accent} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Convites</Text>
              <Text style={styles.cardSubtitle}>{contadores.convites} registros</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>DEIXE A SUA OPINIÃO</Text>

        <View style={styles.feedbackRow}>
          <TouchableOpacity style={styles.feedbackCard} onPress={() => { (navigation as any).navigate('(contact)', { imagemContato }); }}>
            <IconSymbol library="fontawesome" name="phone" size={20} color={accent} />
            <Text style={styles.feedbackText}>Contato</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.feedbackCard} onPress={() => { (navigation as any).navigate('(manifest)/manifest'); }}>
            <IconSymbol library="fontawesome" name="comments" size={20} color={accent} />
            <Text style={styles.feedbackText}>Ouvidoria</Text>
          </TouchableOpacity>
        </View>
      </Wrapper>
    </>
  );
}
