import { Picker } from "@react-native-picker/picker";
import { decode } from "base-64";
import React, { Component } from "react";
import { DeviceEventEmitter, Keyboard, StyleSheet, ToastAndroid, TouchableWithoutFeedback, View } from "react-native";
import { Button, TextInput, Appbar } from "react-native-paper";
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

    formName: string;
    formPosition: string;
    formDNI: string;
    
    formErrorName: boolean;
    formErrorPosition: boolean;
    formErrorDNI: boolean;
};

export default class EditDirective extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            data: this.dataDefault,
            isLoading: false,
            formName: '',
            formPosition: '',
            formDNI: '',
            formErrorName: false,
            formErrorPosition: false,
            formErrorDNI: false,
        };
        this.sendData = this.sendData.bind(this);
        this.loadData = this.loadData.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onChangeTextDNI = this.onChangeTextDNI.bind(this);
        this.goClose = this.goClose.bind(this);
    }
    private positions: string[] = ['Docente', 'Preceptor/a', 'Secretario/a', 'Director/a', 'Vicedirector/a', 'Otro'];
    private dataDefault: DirectivesList = {
        id: '-1',
        name: '',
        position: '',
        dni: '',
        picture: '',
        username: '',
        permission: ''
    };

    verifyInputs() {
        if (this.state.formName.length < 4) {
            this.setState({ formErrorName: true });
            return false;
        }
        if (this.state.formDNI.length < 7) {
            this.setState({ formErrorDNI: true });
            return false;
        }
        return true;
    }
    sendData() {
        if (!this.verifyInputs()) return;
        this.setState({ isLoading: true }, ()=>{
            var name = (this.state.formName !== decode(this.state.data.name))? this.state.formName.trimStart().trimEnd(): undefined;
            var position = (this.state.formPosition !== decode(this.state.data.position))? this.state.formPosition.trimStart().trimEnd(): undefined;
            var dni = (this.state.formDNI !== decode(this.state.data.dni))? this.state.formDNI: undefined;
            Directive.edit(this.state.data.id, name, position, dni)
                .then(()=>this.setState({ isLoading: false }, ()=>{
                    this.props.showSnackbar(true, 'Directivo editado correctamente.');
                    DeviceEventEmitter.emit('reload-page4', true);
                    this.close();
                }))
                .catch((error)=>this.setState({ isLoading: false }, ()=>ToastAndroid.show(error.cause, ToastAndroid.SHORT)));
        });
    }
    loadData() {
        this.setState({
            formName: decode(this.state.data.name),
            formPosition: decode(this.state.data.position),
            formDNI: decode(this.state.data.dni)
        });
    }
    onClose() {
        this.setState({
            isLoading: false,
            formName: '',
            formPosition: '',
            formDNI: '',
            formErrorName: false,
            formErrorPosition: false,
            formErrorDNI: false
        });
    }
    onChangeTextDNI(text: string) {
        if(/^([0-9]{1,100})+$/.test(text)) this.setState({
            formDNI: text,
            formErrorDNI: false
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
        this.setState({
            visible: false,
            data: this.dataDefault
        });
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onShow={this.loadData} onClose={this.onClose} onRequestClose={this.goClose} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={styles.content}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View>
                        <Appbar.Header>
                            <Appbar.BackAction onPress={this.goClose} />
                            <Appbar.Content title={'Editar directivo'}  />
                        </Appbar.Header>
                        <View>
                            <TextInput
                                label={'Nombre y apellido'}
                                mode={'outlined'}
                                secureTextEntry={false}
                                keyboardType={'default'}
                                autoComplete={'off'}
                                value={this.state.formName}
                                style={styles.textInput}
                                error={this.state.formErrorName}
                                disabled={this.state.isLoading}
                                onChangeText={(text)=>this.setState({ formName: text, formErrorName: false })}
                            />
                            <CustomPicker2 title={"Posición:"} value={this.state.formPosition} error={this.state.formErrorPosition} disabled={this.state.isLoading} onChange={(value)=>this.setState({ formPosition: value })} style={{ ...styles.textInput, minHeight: 60 }}>
                                {this.positions.map((value, index)=><Picker.Item key={index.toString()} label={value} value={value} />)}
                            </CustomPicker2>
                            <TextInput
                                label={'DNI'}
                                mode={'outlined'}
                                secureTextEntry={false}
                                keyboardType={'number-pad'}
                                autoComplete={'off'}
                                value={this.state.formDNI}
                                style={styles.textInput}
                                error={this.state.formErrorDNI}
                                disabled={this.state.isLoading}
                                onChangeText={this.onChangeTextDNI}
                            />
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