import React, { Component } from "react";
import { View, TouchableWithoutFeedback, Keyboard, StyleSheet, ToastAndroid, DeviceEventEmitter } from "react-native";
import { Appbar, TextInput, Button } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { Directive } from "../Scripts/ApiTecnica";
import { DirectivesList } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
    close: ()=>any;
    data: DirectivesList | undefined;
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

    formPassword: string;
    formPassword2: string;

    formErrorPassword: boolean;
    formErrorPassword2: boolean;
};

export default class ChangePasswordDirective extends Component<IProps, IState> {
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
            formPassword: '',
            formPassword2: '',
            formErrorPassword: false,
            formErrorPassword2: false
        };
        this.onClose = this.onClose.bind(this);
        this.sendData = this.sendData.bind(this);
        this.goClose = this.goClose.bind(this);
    }
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
            Directive.edit(this.props.data!.id, undefined, undefined, undefined, undefined, this.state.formPassword)
                .then(()=>{
                    this.props.showSnackbar(true, 'La contraseña se editó correctamente.');
                    DeviceEventEmitter.emit('reload-page4');
                    this.props.close();
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
        this.props.close();
    }
    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} onClose={this.onClose} onRequestClose={this.goClose} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={styles.content}>
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