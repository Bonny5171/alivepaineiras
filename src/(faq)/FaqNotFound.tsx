import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { BottomSheet } from '@/components/BottomSheet';
import FaqNotFoundBottomSheetContent from './FaqNotFoundBottomSheetContent';

export default function FaqNotFound() {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  return (
    <>
      <View style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 24, padding: 32, marginTop: 24, backgroundColor: '#0F1C471A' }}>
        <IconSymbol name="face-pensive" library="fontawesome" color="#7B8192" size={56} style={{ marginBottom: 30 }} />
        <Text style={{ color: '#7B8192', fontSize: 17, textAlign: 'center', marginBottom: 30, fontWeight: '600', marginTop: 15 }}>
          Opa! Sua busca não surtiu resultados...
          Tente novamente com outras palavras.
        </Text>
        <TouchableOpacity onPress={() => setShowBottomSheet(true)}>
          <Text style={{ color: '#E84D9B', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
            Não encontrei o que preciso
          </Text>
        </TouchableOpacity>
      </View>
      <BottomSheet visible={showBottomSheet} onClose={() => setShowBottomSheet(false)} dismissible>
        <FaqNotFoundBottomSheetContent />
      </BottomSheet>
    </>
  );
}
