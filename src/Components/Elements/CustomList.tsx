import React, { PureComponent, ReactNode } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { List } from "react-native-paper";

type IProps = {
    title: string;
    leght: number;
    id?: string | number;
    style?: StyleProp<ViewStyle>;
};
type IState = {
    count: string;
};

export default class CustomList extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            count: 'Cargando...'
        };
    }
    componentDidMount(): void {
        this.setState({
            count: `${this.props.leght} ${
                (this.props.title.indexOf('Archivado') !== -1)?
                    'en lista':
                    (this.props.title.indexOf('Profesor') !== -1)?
                        'profesores':
                        'estudiantes'
                }`
        });
    }
    render(): ReactNode {
        return(<List.Accordion
            id={this.props.id}
            title={this.props.title}
            description={this.state.count}
            descriptionStyle={styles.description}
            style={[this.props.style, styles.list]}
        >
            {this.props.children}
        </List.Accordion>);
    }
}
const styles = StyleSheet.create({
    list: {
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 4,
        marginTop: 4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3
    },
    description: {
        marginLeft: 4
    }
});