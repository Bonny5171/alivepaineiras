import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { listarQuantidadeServicos } from '@/api/app/auth';

export default function FaqNotFoundBottomSheetContent() {
  const navigation = useNavigation();
  const [imagemContato, setImagemContato] = useState<string | null>(null);
  const fetchQuantidade = useCallback(async () => {
    try {
      const response = await listarQuantidadeServicos();
      if (Array.isArray(response) && response.length > 0) {
        setImagemContato(response[0].IMAGEM_CONTATO || null);
      } else {
        setImagemContato(null);
      }
    } catch (e) {
      setImagemContato(null);
    }
  }, []);

  useEffect(() => {
    fetchQuantidade();
  }, [fetchQuantidade]);

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 0 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 25, color: '#182447', textAlign: 'left', width: '100%', marginBottom: 12 }}>
        Não encontrou o que procurava?
      </Text>
      <Text style={{ color: '#7B8192', fontSize: 15, textAlign: 'left', width: '100%', marginBottom: 24 }}>
        Você pode entrar em contato diretamente com o clube para sanar sua dúvida, ou também manifestá-la pelo app. {"\n"}Ao manifestar uma dúvida pelo app, por meio da ouvidoria digital, lhe informaremos quando a resposta for devolvida. Se sua pergunta for recorrente, poderá ser adicionada também à Central de Ajuda.
      </Text>
      <View style={{ width: '100%', alignItems: 'center', marginBottom: 16 }}>
        <Pressable
          style={{ width: '100%', backgroundColor: '#E21884', borderRadius: 20, marginBottom: 16 }}
          onPress={() => (navigation as any).navigate('(manifest)/newText')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center', padding: 16 }}>
            Manifestar uma dúvida
          </Text>
        </Pressable>
        <Pressable onPress={() => (navigation as any).navigate('(contact)', { imagemContato })}>
          <Text style={{ color: '#E21884', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
            Entrar em contato com o clube
          </Text>
        </Pressable>
      </View>
      <View style={{ height: 4, width: 200, backgroundColor: '#202B4A', borderRadius: 2, marginTop: 24 }} />
    </ScrollView>
  );
}
