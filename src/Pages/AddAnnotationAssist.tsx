import { encode } from "base-64";
import React, { Component } from "react";
import { View, Keyboard, TouchableWithoutFeedback, StyleSheet, DeviceEventEmitter, ToastAndroid } from "react-native";
import { Appbar, Button, TextInput } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { Annotation } from "../Scripts/ApiTecnica";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
    idGroup: string;
    close: ()=>any;
};
type IState = {
    isLoading: boolean;

    // Form
    formAnnotation: string;
};

export default class AddAnnotationAssist extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: false,
            formAnnotation: ''
        };
        this.onClose = this.onClose.bind(this);
        this.sendData = this.sendData.bind(this);
        this.goClose = this.goClose.bind(this);
    }
    onClose() {
        this.setState({
            isLoading: false,
            formAnnotation: ''
        });
    }
    sendData() {
        Keyboard.dismiss();
        this.setState({ isLoading: true }, ()=>
            Annotation.set(this.props.idGroup, encode(this.state.formAnnotation))
                .then(()=>{
                    this.props.close();
                    ToastAndroid.show('Anotación añadida con éxito.', ToastAndroid.SHORT);
                    DeviceEventEmitter.emit('p1-reload', 1);
                })
                .catch((error)=>{
                    DeviceEventEmitter.emit('show-dialog-add-annotation', error.cause);
                    this.props.close();
                })
        );
    }
    goClose() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.props.close();
    }
    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} style={{ marginLeft: 12, marginRight: 12 }} onClose={this.onClose} onRequestClose={this.goClose} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={{ backgroundColor: Theme.colors.background, borderRadius: 8, overflow: 'hidden' }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View>
                        <Appbar.Header>
                            <Appbar.BackAction onPress={this.goClose} />
                            <Appbar.Content title={'Añadir nueva anotación'}  />
                        </Appbar.Header>
                        <View style={styles.content}>
                            <TextInput
                                label={'Escribe aquí...'}
                                mode={'outlined'}
                                multiline
                                numberOfLines={10}
                                style={{ width: '100%' }}
                                value={this.state.formAnnotation}
                                disabled={this.state.isLoading}
                                onChangeText={(text)=>this.setState({ formAnnotation: text })}
                            />
                            <View style={{ width: '100%', marginTop: 8 }}>
                                <Button
                                    mode={'contained'}
                                    loading={this.state.isLoading}
                                    onPress={this.sendData}
                                >Enviar</Button>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    content: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 12,
        paddingLeft: 12,
        paddingRight: 12
    }
});