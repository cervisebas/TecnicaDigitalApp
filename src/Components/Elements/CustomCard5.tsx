import React, { PureComponent, ReactNode } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Button, Card, Chip, Colors, Text } from "react-native-paper";
import Theme from "../../Themes";

type IProps = {
    title: string;
    date: string;
    hour: string;
    openView?: ()=>any;
};
type IState = {};

export default class CustomCard5 extends PureComponent<IProps, IState> {
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
                right={this._titleRight} />
            <Card.Actions style={styles.cardAction}>
                <Button
                    icon={'book-open-outline'}
                    onPress={this.props.openView}
                >Abrir</Button>
                <CustomChip
                    title={(this.props.hour == '7:15')? 'Turno mañana': 'Turno tarde'}
                    color={Theme.colors.accent}
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
    textDate: {
        marginRight: 16
    },
    cardAction: {
        position: 'relative'
    }
});