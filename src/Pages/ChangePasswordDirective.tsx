import React, { Component } from "react";
import { View, TouchableWithoutFeedback, Keyboard, StyleSheet, ToastAndroid, DeviceEventEmitter } from "react-native";
import { Appbar, TextInput, Button, overlay } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { ThemeContext } from "../Components/ThemeProvider";
import { Directive } from "../Scripts/ApiTecnica";
import { DirectivesList } from "../Scripts/ApiTecnica/types";

type IProps = {
    showSnackbar: (visible: boolean, text: string)=>any;
};
type IState = {
    visible: boolean;
    data: DirectivesList;
    isLoading: boolean;

    showPassword: boolean;
    showPassword2: boolean;
    typeIconPassword: string;
    typeIconPassword2: string;
    showIconPassword: boolean;
    showIconPassword2: boolean;

    formPassword: string;
    formPassword2: string;

    formErrorPassword: boolean;
    formErrorPassword2: boolean;
};

export default class ChangePasswordDirective extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            data: this.dataDefault,
            isLoading: false,
            showPassword: true,
            showPassword2: true,
            typeIconPassword: 'eye-outline',
            typeIconPassword2: 'eye-outline',
            showIconPassword: false,
            showIconPassword2: false,
            formPassword: '',
            formPassword2: '',
            formErrorPassword: false,
            formErrorPassword2: false
        };
        this.onClose = this.onClose.bind(this);
        this.sendData = this.sendData.bind(this);
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
    static contextType = ThemeContext;
    verifyInputs() {
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
        if (!this.verifyInputs()) return;
        this.setState({ isLoading: true }, ()=>
            Directive.edit(this.state.data.id, undefined, undefined, undefined, undefined, this.state.formPassword)
                .then(async()=>{
                    this.props.showSnackbar(true, 'La contraseña se editó correctamente.');
                    DeviceEventEmitter.emit('reload-page4', true);
                    await this.verifyChangePassword();
                    this.close();
                })
                .catch((error)=>ToastAndroid.show(error.cause, ToastAndroid.SHORT))
        );
    }
    onClose() {
        this.setState({
            isLoading: false,
            showPassword: true,
            showPassword2: true,
            typeIconPassword: 'eye-outline',
            typeIconPassword2: 'eye-outline',
            showIconPassword: false,
            showIconPassword2: false,
            formPassword: '',
            formPassword2: '',
            formErrorPassword: false,
            formErrorPassword2: false
        });
    }
    goClose() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.close();
    }
    async verifyChangePassword() {
        try {
            const datauser = await Directive.getDataLocal();
            if (this.state.data.id == datauser.id) DeviceEventEmitter.emit('reVerifySession');
        } catch (error) {
            var cause = 'Ocurrió un error al actualizar los datos.';
            if ((error as any).cause) cause = (error as any).cause;
            ToastAndroid.show(cause, ToastAndroid.LONG);
        }
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
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onClose={this.onClose} onRequestClose={this.goClose} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={[styles.content, { backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background }]}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View>
                        <Appbar.Header>
                            <Appbar.BackAction onPress={this.goClose} />
                            <Appbar.Content title={'Editar contraseña'}  />
                        </Appbar.Header>
                        <View>
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
                                onBlur={()=>this.setState({ showIconPassword: false, showPassword: true, typeIconPassword: 'eye-outline' })}
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
                                onBlur={()=>this.setState({ showIconPassword2: false, showPassword2: true, typeIconPassword2: 'eye-outline' })}
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
                            <View style={styles.viewButtonSend}>
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
        //backgroundColor: Theme.colors.background,
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
    },
    viewButtonSend: {
        width: '100%',
        paddingTop: 12,
        paddingBottom: 4,
        alignItems: 'center'
    }
});