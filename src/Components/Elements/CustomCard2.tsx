import React, { PureComponent, ReactNode } from "react";
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
        return(<Card style={{ margin: 8 }} elevation={3}>
            <Card.Actions style={{ justifyContent: 'flex-end' }}>
                <Text style={{ position: 'absolute', left: 16, fontSize: 18 }}>{this.props.title}</Text>
                <Button icon={'eye-outline'}>Ver</Button>
            </Card.Actions>
        </Card>);
    }
}