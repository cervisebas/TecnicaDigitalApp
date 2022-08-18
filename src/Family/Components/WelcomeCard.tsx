import { decode } from "base-64";
import React, { PureComponent } from "react";
import { StyleSheet } from "react-native";
import { Card, Text, Title } from "react-native-paper";

type IProps = {
    namestudent: string;
};
type IState = {};

export default class WelcomeCard extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): React.ReactNode {
        return(<Card style={styles.content} elevation={3}>
            <Card.Content style={styles.content2}>
                <Title style={styles.title} numberOfLines={1}>
                    <Text style={styles.text}>Bienvenid@ </Text>
                    {decode(this.props.namestudent)}
                </Title>
            </Card.Content>
        </Card>);
    }
}
const styles = StyleSheet.create({
    content: {
        marginLeft: 12,
        marginRight: 12,
        marginTop: 12
    },
    content2: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        width: '95%',
        overflow: 'hidden'
    },
    text: {
        fontWeight: 'bold'
    }
});