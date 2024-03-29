import React, { PureComponent, ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";

type IProps = {
    title: string;
};
type IState = {};

export default class CustomCard2 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): ReactNode {
        return(<Card style={styles.card} elevation={3}>
            <Card.Actions style={styles.cardAction}>
                <Text style={styles.text}>{this.props.title}</Text>
                <Button icon={'eye-outline'}>Ver</Button>
            </Card.Actions>
        </Card>);
    }
}

const styles = StyleSheet.create({
    card: {
        margin: 8
    },
    cardAction: {
        justifyContent: 'flex-end'
    },
    text: {
        position: 'absolute',
        left: 16,
        fontSize: 18
    }
});