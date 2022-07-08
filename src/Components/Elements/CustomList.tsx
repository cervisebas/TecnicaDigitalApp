import React, { PureComponent, ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { List } from "react-native-paper";

type IProps = {
    title: string;
    id?: string | number;
    style?: StyleProp<ViewStyle>;
};
type IState = {};

export default class CustomList extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): ReactNode {
        return(<List.Accordion
            id={this.props.id}
            title={this.props.title}
            style={[this.props.style, {
                marginLeft: 8,
                marginRight: 8,
                marginBottom: 4,
                marginTop: 4,
                borderRadius: 8,
                overflow: 'hidden',
                elevation: 3,
                backgroundColor: '#FFFFFF'
            }]}
        >
            {this.props.children}
        </List.Accordion>);
    }
}