import { Picker } from "@react-native-picker/picker";
import React, { Component } from "react";
import { View, TouchableWithoutFeedback, Keyboard, StyleSheet, DeviceEventEmitter, ToastAndroid } from "react-native";
import { Appbar, Button } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { CustomPicker2 } from "../Components/Elements/CustomInput";
import { Directive } from "../Scripts/ApiTecnica";
import { DirectivesList } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";

type IProps = {
    showSnackbar: (visible: boolean, text: string)=>any;
};
type IState = {
    visible: boolean;
    data: DirectivesList;
    isLoading: boolean;
    formPermission: string;
};

export default class ChangePermissionDirective extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            data: this.dataDefault,
            isLoading: false,
            formPermission: '1'
        };
        this.sendData = this.sendData.bind(this);
        this.onClose = this.onClose.bind(this);
        this.goClose = this.goClose.bind(this);
    }
    private dataDefault: DirectivesList = {
        id: '-1',
        name: '',
        position: '',
        dni: '',
        picture: '',
        username: '',
        permission: ''
    };
    private permissions: { name: string; value: string; }[] = [
        { name: '0 (muy bajo) inhabilitar', value: '0' },
        { name: '1 (bajo)', value: '1' },
        { name: '2 (intermedio)', value: '2' },
        { name: '3 (intermedio)', value: '3' },
        { name: '4 (alto)', value: '4' },
        { name: '5 (muy alto)', value: '5' }
    ];
    sendData() {
        this.setState({ isLoading: true }, ()=>
            Directive.edit(this.state.data.id, undefined, undefined, undefined, undefined, undefined, this.state.formPermission)
                .then(()=>this.setState({ isLoading: false }, ()=>{
                    this.props.showSnackbar(true, 'Permisos editados correctamente.');
                    DeviceEventEmitter.emit('reload-page4', true);
                    this.close();
                }))
                .catch((error)=>this.setState({ isLoading: false }, ()=>ToastAndroid.show(error.cause, ToastAndroid.SHORT)))
        );
    }
    onClose() {
        this.setState({
            isLoading: false,
            formPermission: '1'
        });
    }
    goClose() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.close();
    }

    // Controller
    open(data: DirectivesList) {
        this.setState({
            visible: true,
            data
        });
    }
    close() {
        this.setState({ visible: false });
    }


    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onShow={()=>this.setState({ formPermission: this.state.data.permission })} onClose={this.onClose} onRequestClose={this.goClose} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={styles.content}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View>
                        <Appbar.Header>
                            <Appbar.BackAction onPress={this.goClose} />
                            <Appbar.Content title={'Cambiar permisos'}  />
                        </Appbar.Header>
                        <View>
                            <CustomPicker2 title={"Permisos:"} value={this.state.formPermission} disabled={this.state.isLoading} onChange={(value)=>this.setState({ formPermission: value })} style={{ ...styles.textInput, minHeight: 60 }}>
                                {this.permissions.map((value, index)=><Picker.Item key={index.toString()} label={value.name} value={value.value} />)}
                            </CustomPicker2>
                            <View style={{ width: '100%', paddingTop: 12, paddingBottom: 4, alignItems: 'center' }}>
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
        backgroundColor: Theme.colors.background,
        margin: 10,
        borderRadius: 8,
        overflow: 'hidden',
        paddingBottom: 10
    },
    textInput: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 8,
        marginBottom: 0
    }
});