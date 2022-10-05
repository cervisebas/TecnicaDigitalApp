import React, { PureComponent, ReactNode } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { List, overlay } from "react-native-paper";
import { ThemeContext } from "../ThemeProvider";

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
    static contextType = ThemeContext;
    getCountString() {
        return `${this.props.leght} ${
            (this.props.title.indexOf('Archivado') !== -1)?
                'en lista':
                (this.props.title.indexOf('Profesor') !== -1 || this.props.title.indexOf('Docente') !== -1)?
                    (this.props.leght == 1)? 'docente': 'docentes':
                    'estudiantes'
        }`;
    }
    componentDidMount(): void {
        this.setState({ count: this.getCountString() });
    }
    componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (this.props.leght !== prevProps.leght)
            this.setState({ count: this.getCountString() });
    }
    render(): ReactNode {
        const { isDark, theme } = this.context;
        return(<List.Accordion
            id={this.props.id}
            title={this.props.title}
            description={this.state.count}
            descriptionStyle={styles.description}
            style={[this.props.style, styles.list, { backgroundColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.background }]}
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