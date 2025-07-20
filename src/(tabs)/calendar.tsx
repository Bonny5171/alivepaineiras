import FooterTabBar from '@/components/FooterTabBar'
import Header from '@/components/Header'
import { SectionTitle } from '@/components/SectionTitle'
import React from 'react'
import { View } from 'react-native'
import WebView from 'react-native-webview'

export default function agenda() {
  return (
    <View style={{ height: '100%', width: '100%'}}>
      <Header title='Menu'/>
      <SectionTitle text='Agenda' />
      <WebView
        style={{ flex: 1 }}
        source={{ uri: 'https://clubepaineiras.org.br/agenda/' }}
      />
      <FooterTabBar activeTab='agenda' />
    </View>
    
  )
}