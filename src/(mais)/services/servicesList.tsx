import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import DynamicList, { ListItem } from '@/components/DynamicList'
import Header from '@/components/Header'
import { Wrapper } from '@/components/Wrapper'
import { useNavigation } from '@react-navigation/native'
import { fetchServicesData } from '@/api/notion/notionService'
import { transformServiceData } from '@/api/notion/notionTransformer' // Importe a função transformadora
import { Loading } from '@/components/Loading'
import { TransformedService } from '@/api/notion/notionTransformer'

const TABS = ["Internos do Clube", "Concessionários"];

export default function ServicesList() {
  const [services, setServices] = useState<TransformedService[]>([])
  const [filteredServices, setFilteredServices] = useState<TransformedService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const navigation = useNavigation()

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const rawData = await fetchServicesData() // Recebe os dados brutos do Notion
        const transformedData = transformServiceData(rawData) // Transforma os dados
        setServices(transformedData)
        filterServices(transformedData, activeTabIndex)
      } catch (error) {
        console.error("Erro ao buscar dados dos serviços:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filterServices = (servicesToFilter: TransformedService[], tabIndex: number) => {
    const tabType = tabIndex === 0 ? "Serviço" : "Concessionário";
    const filteredAndSorted = servicesToFilter
      .filter(service => service.Tipo === tabType)
      .sort((a, b) => a.Titulo.localeCompare(b.Titulo));
    setFilteredServices(filteredAndSorted);
  };

  const handleTabChange = (tabIndex: number) => {
    setActiveTabIndex(tabIndex)
    filterServices(services, tabIndex)
  }

  const handleServicePress = (id: string) => {
    const selectedService = services.find(service => service.ID === id)
    if (selectedService) {
      navigation.navigate('(services)', { service: selectedService })
    }
  }

  const mapServicesToListItems = (services: TransformedService[]): ListItem[] => {
    return services.map(service => ({
      title: service.Titulo,
      icon: service.Icon || 'help-circle',
      iconLibrary: 'fontawesome',
      category: service.Tipo || '',
      id: service.ID,
      imageUrl: service.ImageCover,
    }))
  }

  // Tab styles
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {TABS.map((tab, idx) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTabIndex === idx && styles.activeTab]}
          onPress={() => handleTabChange(idx)}
        >
          <Text style={[styles.tabText, activeTabIndex === idx && styles.activeTabText]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <Wrapper>
      <Header title='Serviços' bigTitle />
      <Loading isLoading={isLoading} />
      {!isLoading && (
        <View style={{ padding: 10 }}>
          {renderTabs()}
          <DynamicList 
            data={mapServicesToListItems(filteredServices)}
            searchable 
            onClickPrimaryButton={(item) => handleServicePress(item.id)}
            emptyText='Nenhum serviço encontrado'
          />
        </View>
      )}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F1C471A',
    borderRadius: 12,
    marginBottom: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#0F1C47',
  },
  tabText: {
    color: '#5A6382',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
})