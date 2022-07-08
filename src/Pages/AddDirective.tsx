import { Picker } from "@react-native-picker/picker";
import React, { Component } from "react";
import { DeviceEventEmitter, Keyboard, StyleSheet, ToastAndroid, TouchableWithoutFeedback, View } from "react-native";
import { Appbar, Button, TextInput } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { CustomPicker2 } from "../Components/Elements/CustomInput";
import { Directive } from "../Scripts/ApiTecnica";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
    close: ()=>any;
    showSnackbar: (visible: boolean, text: string)=>any;
};
type IState = {
    isLoading: boolean;

    showPassword: boolean;
    showPassword2: boolean;
    typeIconPassword: string;
    typeIconPassword2: string;
    showIconPassword: boolean;
    showIconPassword2: boolean;

    formName: string;
    formPosition: string;
    formDNI: string;
    formUsername: string;
    formPermission: string;
    formPassword: string;
    formPassword2: string;
    
    formErrorName: boolean;
    formErrorPosition: boolean;
    formErrorDNI: boolean;
    formErrorUsername: boolean;
    formErrorPassword: boolean;
    formErrorPassword2: boolean;
};

export default class AddDirective extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: false,
            showPassword: true,
            showPassword2: true,
            typeIconPassword: 'eye-outline',
            typeIconPassword2: 'eye-outline',
            showIconPassword: false,
            showIconPassword2: false,
            formName: '',
            formPosition: '- Seleccionar -',
            formDNI: '',
            formUsername: '',
            formPermission: '0',
            formPassword: '',
            formPassword2: '',
            formErrorName: false,
            formErrorPosition: false,
            formErrorDNI: false,
            formErrorUsername: false,
            formErrorPassword: false,
            formErrorPassword2: false,
        };
        this.sendData = this.sendData.bind(this);
        this._setPosition = this._setPosition.bind(this);
        this.clearNow = this.clearNow.bind(this);
        this.onChangeTextDNI = this.onChangeTextDNI.bind(this);
        this.goClose = this.goClose.bind(this);
    }
    private positions: string[] = ['- Seleccionar -', 'Docente', 'Preceptor/a', 'Secretario/a', 'Director/a', 'Vicedirector/a', 'Otro'];
    private permissions: string[] = ['0', '1', '2', '3', '5', '4', '1'];

    componentWillUnmount() {
        this.clearNow();
    }

    verifyInputs() {
        if (this.state.formName.length < 4) {
            this.setState({ formErrorName: true });
            return false;
        }
        if (this.state.formPosition == '' || this.state.formPosition == '- Seleccionar -') {
            this.setState({ formErrorPosition: true });
            return false;
        }
        if (this.state.formDNI.length < 7) {
            this.setState({ formErrorDNI: true });
            return false;
        }
        if (this.state.formUsername.length < 4) {
            this.setState({ formErrorUsername: true });
            return false;
        }
        if (this.state.formPassword.length < 8) {
            this.setState({ formErrorPassword: true });
            return false;
        }
        if (this.state.formPassword !== this.state.formPassword2) {
            this.setState({ formErrorPassword2: true });
            return false;
        }
        return true;
    }
    sendData() {
        if (!this.verifyInputs()) return ToastAndroid.show('Por favor revise los campos.', ToastAndroid.LONG);
        this.setState({ isLoading: true }, ()=>
            Directive.add(this.state.formName.trimStart().trimEnd(), this.state.formPosition, this.state.formDNI, this.state.formUsername.trimStart().trimEnd(), this.state.formPassword, this.state.formPermission)
                .then(()=>this.setState({ isLoading: false }, ()=>{
                    this.props.close();
                    this.props.showSnackbar(true, 'Se añadió correctamente el directivo.');
                    DeviceEventEmitter.emit('reload-page4');
                }))
                .catch((error)=>this.setState({ isLoading: false }, ()=>ToastAndroid.show(error.cause, ToastAndroid.SHORT)))
        );
    }
    clearNow() {
        this.setState({
            isLoading: false,
            showPassword: true,
            showPassword2: true,
            typeIconPassword: 'eye-outline',
            typeIconPassword2: 'eye-outline',
            showIconPassword: false,
            showIconPassword2: false,
            formName: '',
            formPosition: '- Seleccionar -',
            formDNI: '',
            formUsername: '',
            formPermission: '0',
            formPassword: '',
            formPassword2: '',
            formErrorName: false,
            formErrorPosition: false,
            formErrorDNI: false,
            formErrorUsername: false,
            formErrorPassword: false,
            formErrorPassword2: false
        });
    }
    _setPosition(value: string) {
        var index = this.positions.findIndex((v)=>v == value);
        var permission = this.permissions[index];
        this.setState({ formPosition: value, formPermission: permission, formErrorPosition: false });
    }
    onChangeTextDNI(text: string) {
        if(/^([0-9]{1,100})+$/.test(text)) this.setState({ formDNI: text, formErrorDNI: false });
    }
    goClose() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.props.close();
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} onClose={this.clearNow} onRequestClose={this.goClose} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={styles.content}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View>
                        <Appbar.Header>
                            <Appbar.BackAction onPress={this.goClose} />
                            <Appbar.Content title={'Añadir directivo'}  />
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
                            <CustomPicker2 title={"Posición:"} value={this.state.formPosition} error={this.state.formErrorPosition} disabled={this.state.isLoading} onChange={this._setPosition} style={{ ...styles.textInput, minHeight: 60 }}>
                                {this.positions.map((value, index)=><Picker.Item key={index.toString()} label={value} value={value} />)}
                            </CustomPicker2>
                            <TextInput
                                label={'Nombre de usuario'}
                                mode={'outlined'}
                                autoCapitalize={'none'}
                                secureTextEntry={false}
                                keyboardType={'default'}
                                autoComplete={'off'}
                                value={this.state.formUsername}
                                style={styles.textInput}
                                error={this.state.formErrorUsername}
                                disabled={this.state.isLoading}
                                onChangeText={(text)=>this.setState({ formUsername: text, formErrorUsername: false })}
                            />
                            <TextInput
                                label={'Contraseña'}
                                mode={'outlined'}
                                autoCapitalize={'none'}
                                secureTextEntry={this.state.showPassword}
                                keyboardType={'default'}
                                autoComplete={'off'}
                                value={this.state.formPassword}
                                style={styles.textInput}
                                error={this.state.formErrorPassword}
                                disabled={this.state.isLoading}
                                onFocus={()=>this.setState({ showIconPassword: true })}
                                onBlur={()=>this.setState({ showIconPassword: false, typeIconPassword: 'eye-outline', showPassword: true })}
                                right={(this.state.showIconPassword)&&<TextInput.Icon
                                    name={this.state.typeIconPassword}
                                    onPress={()=>{
                                        var state: boolean = this.state.showPassword;
                                        this.setState({
                                            showPassword: !state,
                                            typeIconPassword: (state)? 'eye-off-outline': 'eye-outline'
                                        });
                                    }}
                                />}
                                onChangeText={(text)=>this.setState({ formPassword: text, formErrorPassword: false })}
                            />
                            <TextInput
                                label={'Confirmar contraseña'}
                                mode={'outlined'}
                                autoCapitalize={'none'}
                                secureTextEntry={this.state.showPassword2}
                                keyboardType={'default'}
                                autoComplete={'off'}
                                value={this.state.formPassword2}
                                style={styles.textInput}
                                error={this.state.formErrorPassword2}
                                disabled={this.state.isLoading}
                                onFocus={()=>this.setState({ showIconPassword2: true })}
                                onBlur={()=>this.setState({ showIconPassword2: false, typeIconPassword2: 'eye-outline', showPassword2: true })}
                                right={(this.state.showIconPassword2)&&<TextInput.Icon
                                    name={this.state.typeIconPassword2}
                                    onPress={()=>{
                                        var state: boolean = this.state.showPassword2;
                                        this.setState({
                                            showPassword2: !state,
                                            typeIconPassword2: (state)? 'eye-off-outline': 'eye-outline'
                                        });
                                    }}
                                />}
                                onChangeText={(text)=>this.setState({ formPassword2: text, formErrorPassword2: false })}
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