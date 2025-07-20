import React, { useEffect, useState } from 'react';
import { listarHorarios } from '@/api/app/atividades';
import { Schedule, schedulesToItems } from '@/api/app/appTransformer';
import DynamicList, { ListItem } from '@/components/DynamicList';
import { Wrapper } from '@/components/Wrapper';
import { AtividadeFiltroResponseItem } from '@/api/app/atividades';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ScheduleSelectionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { activity, filter } = route.params;
    const selectedActivity = JSON.parse(activity as string) as AtividadeFiltroResponseItem;
    const selectedFilter = JSON.parse(filter as string);

    const [listData, setListData] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [originalSchedule, setOriginalSchedule] = useState<Schedule[]>([]);

    useEffect(() => {
        if (selectedActivity && selectedFilter) {
            fetchData();
        }
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const response = await listarHorarios({
            IDATIVIDADE: selectedActivity.IDENTIFICADOR,
            TITULO: selectedFilter.TITULO,
        });
        setOriginalSchedule(response);
        setListData(schedulesToItems(response));
        setLoading(false);
    };

    const handleSelectSchedule = (schedule: ListItem) => {
        navigation.navigate('(newActivity)/ConfirmationScreen', {
            activity: JSON.stringify(selectedActivity),
            filter: JSON.stringify(selectedFilter),
            schedule: JSON.stringify(originalSchedule.find((item) => item.TURMA.toString() == schedule.id)),
        });
    };

    return (
        <Wrapper isLoading={loading}>
            <DynamicList
                data={listData}
                onClickPrimaryButton={(item) => {
                    const selected = listData.find(schedule => schedule.id === item.id);
                    if (selected) {
                        handleSelectSchedule(selected);
                    }
                }}
            />
        </Wrapper>
    );
}