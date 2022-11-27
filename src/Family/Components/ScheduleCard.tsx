import { decode } from "base-64";
import moment from "moment";
import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, Title } from "react-native-paper";
import { Family } from "../../Scripts/ApiTecnica";
import { DataSchedule, Matter } from "../../Scripts/ApiTecnica/types";
import { isHourBetween } from "../../Scripts/Utils";

type IProps = {
    curse: string;
    openSchedule?: (data: DataSchedule)=>any;
};
type IState = {
    isLoading: boolean;
    isError: boolean;
    data: DataSchedule | undefined;
    button: string;
    icon: 'arrow-right' | 'alert-outline' | 'account-alert-outline';
};

export class ScheduleCard extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            isError: false,
            data: undefined,
            button: 'Cargando',
            icon: 'arrow-right'
        };
        this.openSchedule = this.openSchedule.bind(this);
    }
    componentDidMount(): void {
        this.loadData();
    }
    loadData() {
        Family.getSchedule(this.props.curse)
            .then((data)=>this.setState({ isLoading: false, data, button: 'Ver', icon: 'arrow-right' }))
            .catch((error)=>{
                if ((error.cause as string).toLowerCase().indexOf('no disponible') !== -1) return this.setState({ isLoading: false, isError: true, button: 'No Disponible', icon: 'account-alert-outline' });
                this.setState({ isLoading: false, isError: true, button: 'Error', icon: 'alert-outline' });
            })
    }
    openSchedule() {
        (this.props.openSchedule)&&this.props.openSchedule(this.state.data!);
    }
    getNext() {
        if (!this.state.data) return undefined;
        moment.locale('en');
        const dayNow = moment().format('dddd').toLowerCase();
        //const turnNow = (isHourBetween('00:00', '12:30', moment().format('HH:mm')))? 'morning': 'afternoon';
        moment.locale('es');
        if (dayNow == 'saturday' || dayNow == 'sunday') return undefined;
        var listMatters: {
            id: string;
            matter: string;
            hourStart: string;
            hourEnd: string;
        }[] = [];
        this.state.data.data.forEach((schedule, index)=>{
            if (schedule.matter == 'none') return;
            if (schedule.day !== dayNow) return;
            //const turnDay = (isHourBetween('07:00', '12:00', schedule.hour))? 'morning': 'afternoon';
            //if (turnNow != turnDay) return;
            const findIndex = listMatters.findIndex((v)=>v.id == (schedule.matter as Matter).id);
            if (findIndex == -1) {
                const listHour = schedule.hour.split(':');
                const hourEnd = `${parseInt(listHour[0]) + 1}:${listHour[1]}`;
                return listMatters.push({
                    id: (schedule.matter as Matter).id,
                    matter: decode((schedule.matter as Matter).name),
                    hourStart: schedule.hour,
                    hourEnd
                });
            }
            const listHour = schedule.hour.split(':');
            const hourEnd = `${parseInt(listHour[0]) + 1}:${listHour[1]}`;
            listMatters[findIndex].hourEnd = hourEnd;
        });
        return (listMatters.length == 0)? undefined: listMatters;
    }
    render(): React.ReactNode {
        const listMatters = this.getNext();
        if (listMatters) return(<Card style={styles.cardList} elevation={3} onPress={(!this.state.isLoading && !this.state.isError)? this.openSchedule: undefined}>
            <Card.Title title={'Mi horario:'} />
            <Card.Content style={{ flexDirection: 'column' }}>
                {listMatters.map((v)=><PointItemList
                    title={v.matter}
                    text={`${v.hourStart} ~ ${v.hourEnd}`}
                />)}
            </Card.Content>
            <Card.Actions style={{ justifyContent: 'flex-end' }}>
                <Button
                    icon={this.state.icon}
                    loading={this.state.isLoading}
                    disabled={this.state.isLoading || this.state.isError}
                    contentStyle={styles.buttonContent}
                >{this.state.button}</Button>
            </Card.Actions>
        </Card>);
        return(<Card style={styles.card} elevation={3} onPress={(!this.state.isLoading && !this.state.isError)? this.openSchedule: undefined}>
            <Card.Content style={styles.content}>
                <Title>Mi horario:</Title>
                <Button
                    icon={this.state.icon}
                    loading={this.state.isLoading}
                    disabled={this.state.isLoading || this.state.isError}
                    contentStyle={styles.buttonContent}
                    style={styles.button}
                >{this.state.button}</Button>
            </Card.Content>
        </Card>);
    }
}

type IProps2 = { title: string; text: string };
class PointItemList extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.pointItem}>
            <Text style={styles.pointItem_text1}>⦿</Text>
            <Text style={styles.pointItem_text2} numberOfLines={1}>{this.props.title}</Text>
            <Text style={styles.pointItem_text4}>:</Text>
            <Text style={styles.pointItem_text3}>{this.props.text}</Text>
        </View>);
    }
};

const styles = StyleSheet.create({
    pointItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    pointItem_text1: { marginLeft: 14 },
    pointItem_text2: { marginLeft: 6, fontWeight: 'bold', maxWidth: '60%' },
    pointItem_text3: { marginLeft: 2 },
    pointItem_text4: { fontWeight: 'bold' },
    card: {
        marginLeft: 12,
        marginRight: 12,
        marginTop: 8,
        overflow: 'hidden',
        height: 66
    },
    cardList: {
        marginLeft: 12,
        marginRight: 12,
        marginTop: 8
    },
    content: {
        position: 'relative',
        flexDirection: 'row',
        margin: 0,
        padding: 0,
        alignItems: 'center',
        height: 66
    },
    buttonContent: {
        flexDirection: 'row-reverse'
    },
    button: {
        position: 'absolute',
        right: 8
    }
});