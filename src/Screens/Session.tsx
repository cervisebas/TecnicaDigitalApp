import React, { Component, createRef, PureComponent } from "react";
import { Keyboard, StyleProp, TouchableWithoutFeedback, View, ViewStyle, TextInput as NativeTextInput, StyleSheet, BackHandler, Pressable, Platform } from "react-native";
import { Text, TextInput, Button, Colors, Snackbar, IconButton, Checkbox } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { Directive, Family } from "../Scripts/ApiTecnica";
import CustomBackgroundSession from "../Components/CustomBackgroundSession";
import { ThemeContext } from "../Components/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";

type IProps = {
    reVerifySession: ()=>any;
};
type IState = {
    visible: boolean;
    // Form
    formUserName: string;
    formPassword: string;
    formTemporal: boolean;
    // Errors
    formErrorUserName: boolean;
    formErrorPassword: boolean;
    // Interface
    isLoading: boolean;
    snackbarShow: boolean;
    snackbarText: string | React.ReactNode;
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
            visible: false,
            // Forms
            formUserName: '',
            formPassword: '',
            formTemporal: false,
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
        this._onChangeTemp = this._onChangeTemp.bind(this);
    }
    private input1 = createRef<NativeTextInput>();
    private input2 = createRef<NativeTextInput>();
    static contextType = ThemeContext;
    logInNow() {
        if (!this.verifyInputs()) return;
        this.setState({ isLoading: true }, ()=>
            Directive.open(this.state.formUserName, this.state.formPassword, this.state.formTemporal)
                .then(()=>this.setState({ isLoading: false }, async()=>{
                    await AsyncStorage.multiRemove(['PreferencesAssist']);
                    this.props.reVerifySession();
                    setTimeout(()=>this.setState({
                        formUserName: '',
                        formPassword: '',
                        isDirective: false,
                        visible: false
                    }), 16);
                }))
                .catch((value)=>this.setState({
                    isLoading: false,
                    snackbarShow: true,
                    snackbarText: value.cause
                }, ()=>console.log(value)))
        );
    }
    componentDidUpdate() {
        if (!this.state.visible) {
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
            this.input1.current?.focus();
        }
        if (this.state.formPassword.length < 8) {
            errors += 1;
            this.setState({ formErrorPassword: true });
            (errors == 1)&&this.input2.current?.focus();
        }
        (errors !== 0)&&this.setState({ snackbarShow: true, snackbarText: 'Revise los datos ingresados.' });
        return errors == 0;
    }
    changePanel() { this.setState({ isDirective: !this.state.isDirective }); }

    /* Students / Family */
    student_changeTextDNI(text: string) {
        if (text.length == 0) return this.setState({ formDNI: text, formErrorDNI: false });
        if (/^[0-9]+$/.test(text)) this.setState({ formDNI: text, formErrorDNI: false });
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
                    this.props.reVerifySession();
                    setTimeout(()=>this.setState({ formDNI: '', visible: false }), 16);
                }))
                .catch((error)=>this.setState({ isLoading: false, snackbarShow: true, snackbarText: error.cause }))
        );
    }
    /* ############ */

    _onChangeTemp() {
        this.setState({ formTemporal: !this.state.formTemporal });
    }

    // Controller
    async open() {
        const autoSessionTemp = DeviceInfo.isTablet() || await DeviceInfo.isEmulator();
        if (autoSessionTemp) this.setState({
            snackbarShow: true,
            snackbarText: <><Text style={{ fontWeight: '700' }}>Dispositivo detectado:</Text><Text> se activó la sesión temporal en el modo directivo.</Text></>
        });
        this.setState({
            visible: true,
            formTemporal: autoSessionTemp
        });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        const { isDark, theme, setTheme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={BackHandler.exitApp} animationInTiming={0} animationOutTiming={0} animationIn={'fadeIn'} animationOut={'fadeOut'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
                    <CustomBackgroundSession style={styles.imageBackground} />
                    <IconButton
                        icon={(isDark)? 'weather-night': 'weather-sunny'}
                        style={styles.buttonTheme}
                        size={34}
                        animated={true}
                        color={(isDark)? theme.colors.accent: theme.colors.primary}
                        onPress={setTheme}
                    />
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
                                error={this.state.formErrorUserName}
                                disabled={this.state.isLoading}
                                render={(props)=><NativeTextInput {...props} ref={this.input1} />}
                                onChangeText={(text)=>this.setState({ formUserName: text, formErrorUserName: false })}
                                returnKeyType={'next'}
                                onSubmitEditing={()=>this.input2.current?.focus()}
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
                                render={(props)=><NativeTextInput {...props} ref={this.input2} />}
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
                            <Pressable style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }} onPress={this._onChangeTemp}>
                                <Checkbox
                                    status={(this.state.formTemporal)? 'checked': 'unchecked'}
                                    color={theme.colors.primary}
                                    onPress={this._onChangeTemp}
                                />
                                <Text
                                    style={(!isDark)? {
                                        textShadowColor: 'rgba(255, 255, 255, 0.75)',
                                        textShadowOffset: {
                                            width: -1,
                                            height: 1
                                        },
                                        textShadowRadius: 4
                                    }: undefined}
                                >Sesión temporal</Text>
                            </Pressable>
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
                </View>
            </TouchableWithoutFeedback>
            <Snackbar
                visible={this.state.snackbarShow}
                onDismiss={()=>this.setState({ snackbarShow: false })}
                duration={3000}
                action={{ label: 'OCULTAR', onPress: ()=>this.setState({ snackbarShow: false }) }}
            >
                <Text>{this.state.snackbarText}</Text>
            </Snackbar>
        </CustomModal>);
    }
}

type IProps2 = { style?: StyleProp<ViewStyle>; };
class CustomTitle extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    static contextType = ThemeContext;
    render(): React.ReactNode {
        const { isDark } = this.context;
        return(<View style={[this.props.style, { alignItems: 'center' }]}>
            <Text style={[styles.titleContent, { color: (isDark)? "#FFFFFF": "#000000" }]}>Bienvenid@ a</Text>
            <Text>
                <Text style={styles.title1}>Tecnica</Text>
                <Text style={styles.title2}>Digital</Text>
            </Text>
        </View>);
    }
}

const styles = StyleSheet.create({
    titleContent: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    title1: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.red500,
        textShadowColor: 'rgba(244, 67, 54, 0.4)',
        textShadowOffset: {
            width: -1,
            height: 1
        },
        textShadowRadius: 2
    },
    title2: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.blue800,
        textShadowColor: 'rgba(21, 101, 192, 0.4)',
        textShadowOffset: {
            width: -1,
            height: 1
        },
        textShadowRadius: 2
    },
    content: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageBackground: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    buttonTheme: {
        position: 'absolute',
        top: 0,
        left: 0,
        marginLeft: 6,
        marginTop: 6
    }
});