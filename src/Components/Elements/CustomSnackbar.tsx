import React, { PureComponent } from "react";
import { Snackbar, Text } from "react-native-paper";

type IProps = {};
type IState = {
    visible: boolean;
    message: string;
};

export default class CustomSnackbar extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            message: ''
        };
        this.close = this.close.bind(this);
    }
    close() {
        this.setState({ visible: false });
    }
    open(message: string) {
        this.setState({
            visible: true,
            message
        });
    }
    render(): React.ReactNode {
        return(<Snackbar
            visible={this.state.visible}
            duration={4000}
            onDismiss={this.close}
            action={{ label: 'OCULTAR', onPress: this.close }}
        >
            <Text>{this.state.message}</Text>
        </Snackbar>);
    }
}