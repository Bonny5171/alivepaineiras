import { extractFiltersFromAssociadoResponse } from "@/api/app/appTransformer";
import { Filter } from "@/api/app/appTypes";
import {
  ProximaAtividadeResponseItem,
  listarProximasAtividades,
  listarDependentes,
} from "@/api/app/atividades";
import AssociatesList from "@/components/AssociatesList";
import Header from "@/components/Header";
import { useAuth } from "@/providers";
import { useError } from "@/providers/ErrorProvider";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { getAuthContext } from '@/providers/AuthProvider';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

const CalendarScreen = () => {
  const { setError } = useError();
  const AuthContext = useAuth();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ Calendar: { TITULO?: string; NOME?: string } }, 'Calendar'>>();

  const backgroundColor = useThemeColor({}, 'background');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const brandColor = useThemeColor({}, 'brand');
  const background2Color = useThemeColor({}, 'background2');
  const borderColor = useThemeColor({}, 'border');
  const background1Color = useThemeColor({}, 'background1');
  const secondaryIconColor = useThemeColor({}, 'secondaryIcon');
  const text2Color = useThemeColor({}, 'text2');
  const tertiaryTextColor = useThemeColor({}, 'tertiaryText');
  const highlightBorderColor = useThemeColor({}, 'highlightBorder');
  const decorativeColor = useThemeColor({}, 'decorative');
  const neutralTextColor = useThemeColor({}, 'neutralText');
  const neutralBackgroundColor = useThemeColor({}, 'neutralBackground');

  // TITULO pode vir da rota ou do contexto
  const passedTitulo = route.params?.TITULO || AuthContext.user;
  const passedNome = route.params?.NOME || '';
  const isOwnProfile = !route.params?.TITULO;

  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isLoadingAssociated, setIsLoadingAssociated] = useState(true);
  const [associated, setAssociated] = useState<Filter[]>([]);
  const [selectedAssociated, setSelectedAssociated] = useState<Filter | null>({
    NOME: passedNome,
    TITULO: passedTitulo,
  });
  const [schedules, setSchedules] = useState<ProximaAtividadeResponseItem[]>([]);

  const fetchAssociates = async () => {
    setIsLoadingAssociated(true);
    try {
      const filtersResponse = await listarDependentes({
        TITULO: passedTitulo,
      });
      const extractedFilters = extractFiltersFromAssociadoResponse(filtersResponse);
      const todosOption: Filter = { NOME: "Todos", TITULO: '0' };
      setAssociated([todosOption, ...extractedFilters]);
      const defaultFilter = extractedFilters.find((filter) => filter.TITULO === passedTitulo) || null;
      setSelectedAssociated(defaultFilter);
    } catch (error) {
      setError("Falha ao carregar os associados", "error", 2000);
    } finally {
      setIsLoadingAssociated(false);
    }
  };

  const fetchSchedules = async (associate: Filter) => {
    if (!associate.TITULO) {
      setSchedules([]);
      return;
    }
    setIsLoadingSchedules(true);
    try {
      const tituloNumber = associate.TITULO;
      const response = await listarProximasAtividades({ TITULO: tituloNumber });
      if (response.some((item) => item.ERRO)) {
        const errorItem = response.find((item) => item.ERRO);
        //setError(errorItem?.MSG_ERRO || "Erro ao carregar atividades", "error", 2000);
        setSchedules([]);
      } else {
        const filteredSchedules = isOwnProfile
          ? response
          : response.filter((item) => item.TITULO === tituloNumber);
        setSchedules(filteredSchedules);
      }
    } catch (error) {
      setError("Falha ao carregar as atividades", "error", 2000);
      setSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const handleSelectAssociate = async (associate: Filter) => {
    setSelectedAssociated(associate);
    await fetchSchedules(associate);
  };

  useEffect(() => {
    if (isOwnProfile) {
      fetchAssociates();
    } else {
      // Se for perfil de outro, só busca as atividades desse TITULO
      setSelectedAssociated({ NOME: '', TITULO: passedTitulo });
      fetchSchedules({ NOME: '', TITULO: passedTitulo });
      setIsLoadingAssociated(false);
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Calendário" backRoute="/(tabs)/home" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isOwnProfile && <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>ASSOCIADOS</Text>}
        {isOwnProfile ? (
          isLoadingAssociated ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={brandColor} />
            </View>
          ) : (
            <AssociatesList
              associates={associated}
              onSelectAssociate={handleSelectAssociate}
              selectedAssociate={selectedAssociated}
              selectable={true}
            />
          )
        ) : null}
        <Scheduling
          data={schedules}
          isLoading={isLoadingSchedules}
          selectedAssociated={selectedAssociated}
          navigation={navigation}
          text2Color={text2Color}
          neutralBackgroundColor={neutralBackgroundColor}
          highlightBorderColor={highlightBorderColor}
          background1Color={background1Color}
          secondaryIconColor={secondaryIconColor}
          tertiaryTextColor={tertiaryTextColor}
          decorativeColor={decorativeColor}
          neutralTextColor={neutralTextColor}
          background2Color={background2Color}
          borderColor={borderColor}
          passedNome={passedNome}
        />
      </ScrollView>
    </View>
  );
};

const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(NaN);
  const [day, month, year] = dateStr.split("/").map(Number);
  if (!day || !month || !year) return new Date(NaN);
  return new Date(year, month - 1, day);
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "N/A";
  const activityDate = parseDate(dateStr);
  if (isNaN(activityDate.getTime())) return "N/A";

  const currentDate = new Date();
  const isToday = activityDate.toDateString() === currentDate.toDateString();
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(currentDate.getDate() + 1);
  const isTomorrow = activityDate.toDateString() === tomorrow.toDateString();

  const day = activityDate.getDate().toString().padStart(2, "0");
  const month = (activityDate.getMonth() + 1).toString().padStart(2, "0");
  const datePart = `${day}/${month}`;

  if (isToday) return `HOJE`;
  if (isTomorrow) return `AMANHÃ`;
  return `DIA ${datePart}`;
};

const groupByDate = (schedules: ProximaAtividadeResponseItem[]): { date: string; items: ProximaAtividadeResponseItem[] }[] => {
  const grouped: { [key: string]: ProximaAtividadeResponseItem[] } = {};

  schedules.forEach((item) => {
    const dateKey = item.DTATIVIDADE ? parseDate(item.DTATIVIDADE).toDateString() : "N/A";
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(item);
  });

  return Object.entries(grouped)
    .map(([dateKey, items]) => ({
      date: formatDate(items[0].DTATIVIDADE),
      items,
    }))
    .sort((a, b) => {
      const dateA = parseDate(a.items[0].DTATIVIDADE).getTime();
      const dateB = parseDate(b.items[0].DTATIVIDADE).getTime();
      return dateA - dateB;
    });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "400",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  activitiesContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: "400",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 17,
    fontWeight: "500",
  },
  activitySubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  profileImageContainer: {
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  initialsAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowContainer: {},
  arrowText: {
    fontSize: 30,
    fontWeight: "600",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 150,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
});

const Scheduling = (props: {
  isLoading: boolean;
  data: ProximaAtividadeResponseItem[];
  selectedAssociated: Filter | null;
  navigation: any;
  text2Color: string;
  neutralBackgroundColor: string;
  highlightBorderColor: string;
  background1Color: string;
  secondaryIconColor: string;
  tertiaryTextColor: string;
  decorativeColor: string;
  neutralTextColor: string;
  background2Color: string;
  borderColor: string;
  passedNome: string;
}) => {
  const { data, isLoading, navigation, text2Color, neutralBackgroundColor, highlightBorderColor, background1Color, secondaryIconColor, tertiaryTextColor, decorativeColor, neutralTextColor, background2Color, borderColor, passedNome } = props;
  const groupedSchedules = groupByDate(data);

  return (
    <View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={props.brandColor} />
        </View>
      ) : groupedSchedules.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateText, { color: neutralTextColor }]}>Nenhuma atividade encontrada</Text>
        </View>
      ) : (
        groupedSchedules.map((group, groupIndex) => (
          <React.Fragment key={group.items.IDATIVIDADE || groupIndex}>
            <Text style={[styles.dateHeader, { color: text2Color }]}>{group.date}</Text>
            <View key={group.date} style={[styles.activitiesContainer, { backgroundColor: background2Color }]}>
              {group.items.map((item, index) => (
                <TouchableOpacity
                  key={item.IDATIVIDADE || index}
                  style={[styles.activityItem, { backgroundColor: background2Color, borderBottomColor: borderColor }]}
                  onPress={() => {
                    navigation.navigate("calendarDetails", {
                      IDATIVIDADE: item.IDATIVIDADE,
                      NOME: item.ATIVIDADE,
                      HRINICIO: item.HRINICIO,
                      DTATIVIDADE: item.DTATIVIDADE,
                      DIAS: formatDate(item.DTATIVIDADE),
                      USERNAME: item.TITULO,
                      AVATAR: item.AVATAR,
                      CANCELADA: item.CANCELADA,
                      TIPO: item.TIPO,
                      LOCAL: item.LOCAL || "Local não disponível",
                    });
                  }}
                >
                  <View style={[styles.iconCircle, { backgroundColor: background1Color }]}>
                    <IconSymbol name={item.ICONE} size={15} color={secondaryIconColor} library="fontawesome" />
                  </View>
                  <View style={styles.activityTextContainer}>
                    <Text style={[styles.activityTitle, { color: text2Color }]}>{item.ATIVIDADE}</Text>
                    <Text style={[styles.activitySubtitle, { color: tertiaryTextColor }]}>{item.HRINICIO}</Text>
                  </View>
                  <View style={styles.profileImageContainer}>
                    {item.AVATAR ? (
                      <Image
                        style={[styles.profileImage, { borderColor: highlightBorderColor }]}
                        source={{
                          uri: `${item.AVATAR}`,
                          cache: 'reload',
                        }}
                      />
                    ) : (
                      <View style={[styles.initialsAvatar, { backgroundColor: neutralBackgroundColor }]}>
                        <Text style={{ fontSize: 18, color: text2Color, fontWeight: '500' }}>
                          {passedNome?.replace(/[^a-zA-Z\s]/g, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={[styles.arrowText, { color: decorativeColor }]}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </React.Fragment>
        ))
      )}
    </View>
  );
};

export default CalendarScreen;