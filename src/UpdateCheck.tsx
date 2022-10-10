import React, { PureComponent } from "react";
import { ToastAndroid, Linking, StyleSheet } from "react-native";
import { Button, Colors, Dialog, Paragraph, Portal, Text } from "react-native-paper";
import VersionCheck from "react-native-version-check";
import DeviceInfo from "react-native-device-info";

type IProps = {};
type IState = {
    visible: boolean;
    visible2: boolean;
    actualVersion: string;
    newVersion: string;
};

export default class UpdateCheck extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            visible2: false,
            actualVersion: VersionCheck.getCurrentVersion(),
            newVersion: ''
        };
        this._close = this._close.bind(this);
        this._close2 = this._close2.bind(this);
        this.goUpdate = this.goUpdate.bind(this);
    }
    _close() {
        this.setState({ visible: false });
    }
    _close2() {
        this.setState({ visible2: false });
    }
    goUpdate() {
        this.setState({ visible: false });
        VersionCheck.getPlayStoreUrl()
            .then((value)=>Linking.openURL(value))
            .catch(()=>ToastAndroid.show('Ocurrió un error al obtener el enlace de Google Play Store.', ToastAndroid.LONG));
    }
    checkUpdateNow() {
        VersionCheck.needUpdate({ forceUpdate: false })
            .then((result)=>{
                if (result.isNeeded) return this.setState({
                    visible: true,
                    newVersion: result.latestVersion,
                    actualVersion: result.currentVersion
                });
                DeviceInfo.getTotalMemory().then((getram)=>{
                    const RAM = ((getram / 1024) / 1024) / 1024;
                    if (RAM <= 1.2) this.setState({ visible2: true });
                });
            })
            .catch(()=>ToastAndroid.show('Ocurrió un error al comprobar las actualizaciones.', ToastAndroid.LONG));
    }
    render(): React.ReactNode {
        return(<Portal>
            <Dialog visible={this.state.visible} onDismiss={this._close}>
                <Dialog.Title>¡Actualización disponible!</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>
                        {"Se encontró una actualización disponible, actualiza ahora para obtener las nuevas novedades de la versión.\n"}
                        <Text>{"~ Versión actual: "}<Text style={styles.actual}>{`${this.state.actualVersion}\n`}</Text></Text>
                        <Text>{"~ Nueva versión: "}<Text style={styles.new}>{`${this.state.newVersion}`}</Text></Text>
                    </Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={this._close}>Más tarde</Button>
                    <Button onPress={this.goUpdate}>Actualizar</Button>
                </Dialog.Actions>
            </Dialog>
            <Dialog visible={this.state.visible2} onDismiss={this._close2}>
                <Dialog.Title>¡Dispositivo incompatible!</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>El dispositivo cuenta con hardware limitado, esto puedo provocar ciertos inconvenientes o presentar lentitud en ciertos sectores de la aplicación. Si decide proseguir tenga en cuenta lo que se mencionó.</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={this._close2}>Aceptar</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>);
    }
}

const styles = StyleSheet.create({
    actual: {
        color: Colors.red500
    },
    new: {
        color: Colors.blue500
    }
});