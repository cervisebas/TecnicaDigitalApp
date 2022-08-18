import React, { PureComponent } from "react";
import { Linking } from "react-native";
import { Button, Dialog, Paragraph } from "react-native-paper";

type IProps = {};
type IState = {
    visible: boolean;
};

export default class QueryCall extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false
        };
        this._close = this._close.bind(this);
        this._continue = this._continue.bind(this);
    }
    open() {
        this.setState({ visible: true });
    }
    private _close() {
        this.setState({ visible: false });
    }
    private _continue() {
        this._close();
        Linking.openURL('tel:+5492236697986');
    }
    render(): React.ReactNode {
        return(<Dialog visible={this.state.visible} onDismiss={this._close}>
            <Dialog.Title>Espere un momento...</Dialog.Title>
            <Dialog.Content>
                <Paragraph>{"Por favor considere enviar un mensaje de texto por los otros medios.\nSi desea continuar y realizar una llamada tenga en cuenta que la probabilidad de recibir asistencia es muy baja."}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={this._close}>Cancelar</Button>
                <Button onPress={this._continue}>Continuar</Button>
            </Dialog.Actions>
        </Dialog>);
    }
}