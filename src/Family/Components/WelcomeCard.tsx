import { decode } from "base-64";
import React, { PureComponent } from "react";
import { StyleSheet } from "react-native";
import { Card, Text, Title } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemeContext } from "../../Components/ThemeProvider";

type IProps = {
    namestudent: string;
    curse: string;
};
type IState = {
    icon: string;
};

export default class WelcomeCard extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            icon: 'account'
        };
    }
    static contextType = ThemeContext;
    componentDidMount(): void {
        const isTeacher = decode(this.props.curse).toLowerCase().indexOf('docente') != -1 || decode(this.props.curse).toLowerCase().indexOf('profesor') != -1;
        if (isTeacher) this.setState({ icon: 'account-details' });
    }
    render(): React.ReactNode {
        const { theme } = this.context;
        return(<Card style={styles.content} elevation={3}>
            <Card.Content style={styles.contentCard}>
                <Title>Bienvenido/a:</Title>
                <Icon name={this.state.icon} size={28} color={theme.colors.accent} style={styles.icon} />
                <Text style={styles.name}>{decode(this.props.namestudent)}</Text>
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
    contentCard: {
        position: 'relative'
    },
    icon: {
        position: 'absolute',
        top: 18,
        right: 12
    },
    name: {
        marginLeft: 14,
        marginTop: 4,
        fontSize: 18,
        fontWeight: '600'
    }
});