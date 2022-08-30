import React, { PureComponent, ReactNode } from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";

type IProps = {
    title: string;
    onPress?: ()=>any;
};
type IState = {};

export default class CustomCard3 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): ReactNode {
        return(<Card style={styles.card} elevation={3} onPress={this.props.onPress}>
            <Card.Actions style={styles.cardAction}>
                <Text style={styles.text}>{this.props.title}</Text>
                <Button
                    icon={'arrow-right'}
                    contentStyle={styles.button}
                    children={'Ver'}
                />
            </Card.Actions>
        </Card>);
    }
}

const styles = StyleSheet.create({
    card: {
        marginTop: 8,
        marginLeft: 8,
        marginRight: 8,
        height: 54,
        flexDirection: 'column'
    },
    cardAction: {
        justifyContent: 'flex-end'
    },
    text: {
        position: 'absolute',
        left: 16,
        fontSize: 17
    },
    button: {
        flexDirection: 'row-reverse'
    }
});