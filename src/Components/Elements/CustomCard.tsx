import React, { PureComponent, ReactNode } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Button, Card, Chip, Colors, Text } from "react-native-paper";

type IProps = {
    title: string;
    date: string;
    state: boolean;
    annotations: number;
    openView?: ()=>any;
    openConfirm?: ()=>any;
};
type IState = {};

export default class CustomCard extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this._titleRight = this._titleRight.bind(this);
    }
    _titleRight(props: { size: number; }) {
        return(<Text {...props} style={styles.textDate}>{this.props.date}</Text>);
    }
    render(): ReactNode {
        return(<Card style={styles.card} elevation={3}>
            <Card.Title
                title={this.props.title}
                subtitle={(this.props.annotations !== 0)? (this.props.annotations == 1)? `1 anotación`: `${this.props.annotations} anotaciones`: undefined}
                subtitleStyle={styles.subtitle}
                right={this._titleRight} />
            <Card.Actions style={styles.cardAction}>
                <Button
                    icon={(this.props.state)? 'eye-outline': 'account-multiple-check-outline'}
                    onPress={(this.props.state)? (this.props.openView)&&this.props.openView: (this.props.openConfirm)&&this.props.openConfirm}
                >{(this.props.state)? 'Ver': 'Confirmar'}</Button>
                <CustomChip
                    title={(this.props.state)? 'Confirmado': 'Sin confirmar'}
                    color={(this.props.state)? Colors.blue500: Colors.red500}
                    style={styles.customChip}
                />
            </Card.Actions>
        </Card>);
    }
}

type IProps2 = { title: string; color: string; style?: StyleProp<ViewStyle>; };
class CustomChip extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<Chip mode={'outlined'} style={[ this.props.style, { borderColor: this.props.color }]}>
            <Text style={{ color: this.props.color }}>{this.props.title}</Text>
        </Chip>);
    }
}

const styles = StyleSheet.create({
    card: {
        height: 125,
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 8
    },
    customChip: {
        position: 'absolute',
        bottom: 12,
        right: 16
    },
    subtitle: {
        marginLeft: 8
    },
    textDate: {
        marginRight: 16
    },
    cardAction: {
        position: 'relative'
    }
});