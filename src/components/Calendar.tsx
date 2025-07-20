// components/Calendar.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

type DiaStatus = 'default' | 'disponivel' | 'indisponivel' | 'selecionado';

interface CalendarProps {
  diasDisponiveis?: string[];
  diasIndisponiveis?: string[];
  multiplaSelecao?: boolean;
  onDiaSelecionado?: (data: string | string[] | null) => void;
  mesInicial?: Date;
  diasSelecionados?: string[]; // NOVO: permite controlar seleção pelo pai
  blocked?: boolean; // NOVO: se true, só permite selecionar diasDisponiveis
  disablePastDays?: boolean; // NOVO: desabilita dias anteriores a hoje
  onlyExplicitAvailable?: boolean; // NOVO: só deixa disponível o que está em diasDisponiveis
}

const Calendar: React.FC<CalendarProps> = ({
  diasDisponiveis = [],
  diasIndisponiveis = [],
  multiplaSelecao = false,
  onDiaSelecionado,
  mesInicial = new Date(),
  diasSelecionados: diasSelecionadosProp,
  blocked = false,
  disablePastDays = false,
  onlyExplicitAvailable = false, // NOVO
}) => {
  const [mesAtual, setMesAtual] = useState(mesInicial);
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]);

  // THEME COLORS
  const background = useThemeColor({}, 'background');
  const activeBackground = useThemeColor({}, 'activeBackground'); // igual à lista
  const border = useThemeColor({}, 'background2');
  const textColor = useThemeColor({}, 'text');
  const accent = useThemeColor({}, 'brand');
  const availableBg = useThemeColor({}, 'lightPink');
  const unavailableBg = useThemeColor({}, 'unavailableBg');
  const selectedBg = useThemeColor({}, 'brand');
  const selectedText = useThemeColor({}, 'reversedText');
  const legendText = useThemeColor({}, 'text2');

  const styles = StyleSheet.create({
    container: {
      backgroundColor: activeBackground || background || '#fff', // Usa o mesmo fundo dos itens da lista
      borderRadius: 14,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    navButton: {
      fontSize: 24,
      fontWeight: 'bold',
      color: textColor,
      paddingHorizontal: 16,
    },
    mesTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: textColor,
    },
    diasSemana: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    },
    diaSemanaTexto: {
      color: textColor,
      fontWeight: 'bold',
      width: 40,
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dia: {
      width: 40,
      height: 40,
      margin: 4,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    diaTexto: {
      color: textColor,
    },
    diaTextoSelecionado: {
      color: selectedText,
      fontWeight: 'bold',
    },
    default: {
      backgroundColor: activeBackground || background,
      borderWidth: 1,
      borderColor: border,
    },
    disponivel: {
      backgroundColor: availableBg,
    },
    indisponivel: {
      backgroundColor: unavailableBg,
      opacity: 0.5,
    },
    selecionado: {
      backgroundColor: selectedBg,
    },
    legend: {
      flexDirection: 'row',
      marginTop: 16,
      justifyContent: 'space-around',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendColor: {
      width: 16,
      height: 16,
      borderRadius: 4,
      marginRight: 4,
    },
    legendText: {},
  });

  // Utilitário para criar datas locais a partir de string YYYY-MM-DD
  function parseLocalDate(dateStr: string): Date {
    // Espera formato 'YYYY-MM-DD'
    const [ano, mes, dia] = dateStr.split('-').map(Number);
    return new Date(ano, mes - 1, dia); // mês começa em 0
  }

  // Atualiza seleção se prop mudar
  useEffect(() => {
    if (diasSelecionadosProp) {
      // Converte datas YYYY-MM-DD para números do mês atual (usando local)
      const selecionados = diasSelecionadosProp
        .map(dataStr => {
          const data = parseLocalDate(dataStr);
          if (
            data.getFullYear() === mesAtual.getFullYear() &&
            data.getMonth() === mesAtual.getMonth()
          ) {
            return data.getDate();
          }
          return null;
        })
        .filter((d): d is number => d !== null);
      setDiasSelecionados(selecionados);
    }
  }, [diasSelecionadosProp, mesAtual]);

  // Função auxiliar para extrair os dias disponíveis/indisponíveis do mês/ano atual
  const getDiasDoMes = (datas: string[]) => {
    return datas
      .map(dataStr => {
        const data = parseLocalDate(dataStr);
        if (
          data.getFullYear() === mesAtual.getFullYear() &&
          data.getMonth() === mesAtual.getMonth()
        ) {
          return data.getDate();
        }
        return null;
      })
      .filter((d): d is number => d !== null);
  };

  const diasDisponiveisMes = getDiasDoMes(diasDisponiveis);
  const diasIndisponiveisMes = getDiasDoMes(diasIndisponiveis);

  const avancarMes = () => {
    const novoMes = new Date(mesAtual);
    novoMes.setMonth(novoMes.getMonth() + 1);
    setMesAtual(novoMes);
    setDiasSelecionados([]);
  };

  const retrocederMes = () => {
    const novoMes = new Date(mesAtual);
    novoMes.setMonth(novoMes.getMonth() - 1);
    setMesAtual(novoMes);
    setDiasSelecionados([]);
  };

  const handleDiaPress = (dia: number) => {
    // Se blocked, só permite selecionar diasDisponiveis
    if (blocked && !diasDisponiveisMes.includes(dia)) return;
    let novosDiasSelecionados: number[];
    if (multiplaSelecao) {
      if (diasSelecionados.includes(dia)) {
        novosDiasSelecionados = diasSelecionados.filter(d => d !== dia);
      } else {
        novosDiasSelecionados = [...diasSelecionados, dia];
      }
    } else {
      novosDiasSelecionados = diasSelecionados.includes(dia) ? [] : [dia];
    }
    setDiasSelecionados(novosDiasSelecionados);
    if (onDiaSelecionado) {
      const mes = mesAtual.getMonth() + 1;
      const ano = mesAtual.getFullYear();
      const formatDate = (d: number) => `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (multiplaSelecao) {
        onDiaSelecionado(
          novosDiasSelecionados.length > 0 ? novosDiasSelecionados.map(formatDate) : null
        );
      } else if (novosDiasSelecionados.length > 0) {
        onDiaSelecionado(formatDate(novosDiasSelecionados[0]));
      } else {
        onDiaSelecionado(null);
      }
    }
  };

  const today = new Date();
  const isPastDay = (day: number) => {
    if (!disablePastDays) return false;
    const date = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), day);
    // Zera horas para comparar só a data
    date.setHours(0,0,0,0);
    const todayZero = new Date(today);
    todayZero.setHours(0,0,0,0);
    return date < todayZero;
  };

  const renderDias = () => {
    const dias = [];
    const diasNoMes = new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth() + 1,
      0
    ).getDate();

    // Descobre o dia da semana do primeiro dia do mês (0 = domingo, 6 = sábado)
    const primeiroDiaSemana = new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth(),
      1
    ).getDay();

    // Adiciona espaços vazios antes do primeiro dia do mês
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(
        <View key={`empty-${i}`} style={[styles.dia, { backgroundColor: 'transparent' }]} />
      );
    }

    for (let i = 1; i <= diasNoMes; i++) {
      let status: DiaStatus = 'default';
      if (diasDisponiveisMes.includes(i)) status = 'disponivel';
      if (diasIndisponiveisMes.includes(i)) status = 'indisponivel';
      if (diasSelecionados.includes(i)) status = 'selecionado';
      if (isPastDay(i)) status = 'indisponivel';
      // NOVO: se onlyExplicitAvailable, tudo que não está em diasDisponiveis fica indisponível
      if (onlyExplicitAvailable && !diasDisponiveisMes.includes(i)) status = 'indisponivel';

      dias.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.dia,
            styles[status],
            status === 'selecionado' && { borderWidth: 2, borderColor: accent },
          ]}
          disabled={status === 'indisponivel'}
          onPress={() => handleDiaPress(i)}
        >
          <Text style={[styles.diaTexto, status === 'selecionado' && styles.diaTextoSelecionado]}>{i}</Text>
        </TouchableOpacity>
      );
    }
    return dias;
  };

  // Troca para pt-BR para garantir mês em português
  const nomeMes = mesAtual.toLocaleString('pt-BR', { month: 'long' });
  const ano = mesAtual.getFullYear();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={retrocederMes}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.mesTitle}>
          {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} {ano}
        </Text>
        <TouchableOpacity onPress={avancarMes}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.diasSemana}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, index) => (
          <Text key={index} style={styles.diaSemanaTexto}>
            {dia}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>{renderDias()}</View>
      {(diasDisponiveis.length > 0 || diasIndisponiveis.length > 0 || onlyExplicitAvailable || disablePastDays) && (
        <View style={styles.legend}>
          {diasDisponiveis.length > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: availableBg }]} />
              <Text style={[styles.legendText, { color: legendText }]}>Disponível</Text>
            </View>
          )}
          {(diasIndisponiveis.length > 0 || onlyExplicitAvailable || disablePastDays) && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: unavailableBg, opacity: 0.5 }]} />
              <Text style={[styles.legendText, { color: legendText }]}>Indisponível</Text>
            </View>
          )}
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: selectedBg }]} />
            <Text style={[styles.legendText, { color: legendText }]}>Selecionado</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Calendar;