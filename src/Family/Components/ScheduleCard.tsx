import React, { PureComponent } from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Title } from "react-native-paper";
import { Family } from "../../Scripts/ApiTecnica";
import { DataSchedule } from "../../Scripts/ApiTecnica/types";

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
    render(): React.ReactNode {
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

const styles = StyleSheet.create({
    card: {
        marginLeft: 12,
        marginRight: 12,
        marginTop: 8,
        overflow: 'hidden',
        height: 66
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