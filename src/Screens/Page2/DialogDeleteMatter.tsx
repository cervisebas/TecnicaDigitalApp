import React, { PureComponent } from "react";
import { Button, Dialog, Paragraph, Portal } from "react-native-paper";

type IProps2 = {
    onConfirm: ()=>any;
};
type IState2 = {
    visible: boolean;
};

export class DialogDeleteMatter extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            visible: false
        };
        this.close = this.close.bind(this);
        this.confirm = this.confirm.bind(this);
    }
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    confirm() {
        this.setState({ visible: false }, this.props.onConfirm);
    }
    render(): React.ReactNode {
        return(<Portal>
            <Dialog visible={this.state.visible} onDismiss={this.close}>
                <Dialog.Title>Espere por favor...</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>{"¿Estás seguro que quieres realizar esta acción?\n\nUna vez borrado la materia, se eliminarán tambien todos los datos que contiene. Esta acción es irreversible."}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={this.close}>Cancelar</Button>
                    <Button onPress={this.confirm}>Aceptar</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>);
    }
}