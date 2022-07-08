import React, { Component, PureComponent } from "react";
import { DeviceEventEmitter, ImageBackground, Keyboard, StyleProp, TouchableWithoutFeedback, View, ViewStyle, TextInput as NativeTextInput } from "react-native";
import { Text, Provider as PaperProvider, TextInput, Button, Colors, Snackbar } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { Directive, Family } from "../Scripts/ApiTecnica";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
};
type IState = {
    // Form
    formUserName: string;
    formPassword: string;
    // Errors
    formErrorUserName: boolean;
    formErrorPassword: boolean;
    // Interface
    isLoading: boolean;
    snackbarShow: boolean;
    snackbarText: string;
    // TextInput
    iconTextInputPassword: string;
    showIconTextInputPassword: boolean;
    stateTextInputPassword: boolean;
    // Form Student
    formDNI: string;
    formErrorDNI: boolean;
    // Pads
    isDirective: boolean;
};

export default class Session extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            // Forms
            formUserName: '',
            formPassword: '',
            // Errors
            formErrorUserName: false,
            formErrorPassword: false,
            // Interface
            isLoading: false,
            snackbarShow: false,
            snackbarText: '',
            // TextInput
            iconTextInputPassword: 'eye-outline',
            showIconTextInputPassword: false,
            stateTextInputPassword: true,
            // Form Student
            formDNI: '',
            formErrorDNI: false,
            // Pads
            isDirective: false
        };
        this.logInNow = this.logInNow.bind(this);
        this.changePanel = this.changePanel.bind(this);
        this.student_changeTextDNI = this.student_changeTextDNI.bind(this);
        this.goLogInStudent = this.goLogInStudent.bind(this);
    }
    private input1: NativeTextInput | null = null;
    private input2: NativeTextInput | null = null;
    logInNow() {
        if (!this.verifyInputs()) return;
        this.setState({ isLoading: true }, ()=>
            Directive.open(this.state.formUserName, this.state.formPassword)
                .then(()=>this.setState({ isLoading: false }, async()=>{
                    DeviceEventEmitter.emit('ChangeIndexNavigation', 'Admin');
                    DeviceEventEmitter.emit('textScreenLoading', null);
                    DeviceEventEmitter.emit('turnScreenLoading', true);
                    setTimeout(()=>{
                        DeviceEventEmitter.emit('turnSessionView', false);
                        DeviceEventEmitter.emit('loadNowAll');
                        setTimeout(()=>DeviceEventEmitter.emit('turnScreenLoading', false), 1500);
                    }, 10);
                }))
                .catch((value)=>this.setState({
                    isLoading: false,
                    snackbarShow: true,
                    snackbarText: value.cause
                }))
        );
    }
    componentWillUnmount() {
        this.setState({
            formUserName: '',
            formPassword: '',
            formErrorUserName: false,
            formErrorPassword: false,
            isLoading: false,
            snackbarShow: false,
            snackbarText: ''
        });
        this.input1 = null;
        this.input2 = null;
    }
    componentDidUpdate() {
        if (!this.props.visible) {
            if (this.state.formPassword.length !== 0 || this.state.formUserName.length !== 0) {
                this.setState({
                    formUserName: '',
                    formPassword: '',
                    formErrorUserName: false,
                    formErrorPassword: false,
                    isLoading: false,
                    snackbarShow: false,
                    snackbarText: ''
                });
            }
        }
    }
    verifyInputs(): boolean {
        var errors: number = 0;
        if (this.state.formUserName.length < 6) {
            errors += 1;
            this.setState({ formErrorUserName: true });
            this.input1?.focus();
        }
        if (this.state.formPassword.length < 8) {
            errors += 1;
            this.setState({ formErrorPassword: true });
            (errors == 1)&&this.input2?.focus();
        }
        (errors !== 0)&&this.setState({ snackbarShow: true, snackbarText: 'Revise los datos ingresados.' });
        return errors == 0;
    }
    changePanel() { this.setState({ isDirective: !this.state.isDirective }); }

    /* Students / Family */
    student_changeTextDNI(text: string) {
        if (/^[0-9]+$/.test(text))
            this.setState({ formDNI: text, formErrorDNI: false });
    }
    student_verifyInputs() {
        if (this.state.formDNI.length <= 7) {
            this.setState({ formErrorDNI: true });
            return false;
        }
        return true;
    }
    goLogInStudent() {
        if (!this.student_verifyInputs()) return;
        this.setState({ isLoading: true }, ()=>
            Family.open(this.state.formDNI)
                .then(()=>this.setState({ isLoading: false }, async()=>{
                    DeviceEventEmitter.emit('ChangeIndexNavigation', 'Family');
                    DeviceEventEmitter.emit('textScreenLoading', null);
                    DeviceEventEmitter.emit('turnScreenLoading', true);
                    setTimeout(()=>{
                        DeviceEventEmitter.emit('turnSessionView', false);
                        DeviceEventEmitter.emit('loadNowAll');
                        setTimeout(()=>DeviceEventEmitter.emit('turnScreenLoading', false), 1500);
                    }, 10);
                }))
                .catch((error)=>this.setState({ isLoading: false, snackbarShow: true, snackbarText: error.cause }))
        );
    }
    /* ############ */

    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} animationInTiming={0} animationOutTiming={0} animationIn={'fadeIn'} animationOut={'fadeOut'}>
            <PaperProvider theme={Theme}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    {(this.props.visible)? <ImageBackground source={require('../Assets/background-session.webp')} resizeMode="cover" style={{ flex: 2, backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <CustomTitle />
                            {(this.state.isDirective)? <View style={{ marginTop: 16, width: '90%' }}>
                                <TextInput
                                    label={'Nombre de usuario'}
                                    mode={'outlined'}
                                    autoCapitalize={'none'}
                                    secureTextEntry={false}
                                    keyboardType={'email-address'}
                                    autoComplete={'off'}
                                    autoCorrect={false}
                                    textContentType={'username'}
                                    blurOnSubmit={false}
                                    value={this.state.formUserName}
                                    error={this.state.formErrorPassword}
                                    disabled={this.state.isLoading}
                                    render={(props)=><NativeTextInput {...props} ref={(ref)=>this.input1 = ref} />}
                                    onChangeText={(text)=>this.setState({ formUserName: text, formErrorUserName: false })}
                                    returnKeyType={'next'}
                                    onSubmitEditing={()=>this.input2?.focus()}
                                />
                                <TextInput
                                    label={'Contraseña'}
                                    mode={'outlined'}
                                    autoCapitalize={'none'}
                                    secureTextEntry={this.state.stateTextInputPassword}
                                    autoComplete={'off'}
                                    autoCorrect={false}
                                    textContentType={'password'}
                                    style={{ marginTop: 8 }}
                                    value={this.state.formPassword}
                                    error={this.state.formErrorPassword}
                                    disabled={this.state.isLoading}
                                    render={(props)=><NativeTextInput {...props} ref={(ref)=>this.input2 = ref} />}
                                    onChangeText={(text)=>this.setState({ formPassword: text, formErrorPassword: false })}
                                    returnKeyType={'send'}
                                    onSubmitEditing={this.logInNow}
                                    onFocus={()=>this.setState({ showIconTextInputPassword: true })}
                                    onBlur={()=>this.setState({ showIconTextInputPassword: false, stateTextInputPassword: true, iconTextInputPassword: 'eye-outline' })}
                                    right={(this.state.showIconTextInputPassword)&&<TextInput.Icon
                                        name={this.state.iconTextInputPassword}
                                        onPress={()=>{
                                            var state: boolean = this.state.stateTextInputPassword;
                                            this.setState({
                                                stateTextInputPassword: !state,
                                                iconTextInputPassword: (state)? 'eye-off-outline': 'eye-outline'
                                            });
                                        }}
                                    />}
                                />
                                <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
                                    <Button
                                        mode={'contained'}
                                        onPress={this.logInNow}
                                        style={{ width: '50%' }}
                                        loading={this.state.isLoading}
                                        disabled={this.state.isLoading}
                                    >Iniciar sesión</Button>
                                    <Button
                                        mode={'text'}
                                        onPress={this.changePanel}
                                        style={{ width: '80%', marginTop: 8 }}
                                        disabled={this.state.isLoading}
                                    >Soy familia/estudiante</Button>
                                </View>
                            </View>:
                            <View style={{ marginTop: 16, width: '90%' }}>
                                <TextInput
                                    label={'D.N.I'}
                                    mode={'outlined'}
                                    autoCapitalize={'none'}
                                    secureTextEntry={false}
                                    keyboardType={'number-pad'}
                                    autoComplete={'off'}
                                    autoCorrect={false}
                                    value={this.state.formDNI}
                                    error={this.state.formErrorDNI}
                                    disabled={this.state.isLoading}
                                    maxLength={9}
                                    onChangeText={this.student_changeTextDNI}
                                    returnKeyType={'send'}
                                    onSubmitEditing={this.goLogInStudent}
                                />
                                <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
                                    <Button
                                        mode={'contained'}
                                        onPress={this.goLogInStudent}
                                        style={{ width: '50%' }}
                                        loading={this.state.isLoading}
                                        disabled={this.state.isLoading}
                                    >Iniciar sesión</Button>
                                    <Button
                                        mode={'text'}
                                        onPress={this.changePanel}
                                        style={{ width: '50%', marginTop: 8 }}
                                        disabled={this.state.isLoading}
                                    >Soy directivo</Button>
                                </View>
                            </View>}
                        </View>
                    </ImageBackground>: <View></View>}
                </TouchableWithoutFeedback>
                <Snackbar
                    visible={this.state.snackbarShow}
                    onDismiss={()=>this.setState({ snackbarShow: false })}
                    duration={3000}
                    action={{ label: 'OCULTAR', onPress: ()=>this.setState({ snackbarShow: false }) }}
                >
                    <Text>{this.state.snackbarText}</Text>
                </Snackbar>
            </PaperProvider>
        </CustomModal>);
    }
}

type IProps2 = { style?: StyleProp<ViewStyle>; };
class CustomTitle extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    private fontSize: number = 24;
    private fontSize2: number = 36;
    private fontWeight: "bold" | "normal" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | undefined = 'bold';
    render(): React.ReactNode {
        return(<View style={[this.props.style, { alignItems: 'center' }]}>
            <Text style={{ fontWeight: this.fontWeight, fontSize: this.fontSize }}>Bienvenid@ a</Text>
            <Text>
                <Text style={{ fontSize: this.fontSize2, fontWeight: this.fontWeight, color: Colors.red500 }}>Tecnica</Text>
                <Text style={{ fontSize: this.fontSize2, fontWeight: this.fontWeight, color: Colors.blue800 }}>Digital</Text>
            </Text>
        </View>);
    }
}