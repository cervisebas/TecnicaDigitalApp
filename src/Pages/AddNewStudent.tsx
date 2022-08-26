import { Picker } from "@react-native-picker/picker";
import { encode } from "base-64";
import moment from "moment";
import React, { Component, createRef } from "react";
import { View, Image, ImageSourcePropType, TouchableHighlight, Dimensions, StyleSheet, ScrollView, ToastAndroid, DeviceEventEmitter, Pressable } from "react-native";
import DatePicker from "react-native-date-picker";
import ImageCropPicker, { Options, Image as TypeImageCrop } from "react-native-image-crop-picker";
import { ActivityIndicator, Appbar, Dialog, Portal, TextInput, Button, Provider as PaperProvider } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { CustomPicker2 } from "../Components/Elements/CustomInput";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";
import { Directive, Student } from "../Scripts/ApiTecnica";
import Theme from "../Themes";
// Images
import ImageProfile from "../Assets/profile.png";

type IProps = {
    goEditActionSheet: ()=>any;
};
type IState = {
    visible: boolean;
    isLoadImage: boolean;
    imageShow: ImageSourcePropType;
    viewModalDate: boolean;
    actualDatePicker: Date;
    actualDate: string;
    isLoading: boolean;

    // Form
    formName: string;
    formCourse: string;
    formTel: string;
    formEmail: string;
    formDate: string;
    formDNI: string;
    formImage: {
        uri: string | undefined;
        type: string | undefined;
        name: string | undefined;
    };

    // Errors
    errorFormName: boolean;
    errorFormTel: boolean;
    errorFormEmail: boolean;
    errorFormCourse: boolean;
    errorFormDate: boolean;
    errorFormDNI: boolean;
};

const { width } = Dimensions.get('window');

export default class AddNewStudent extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            isLoadImage: false,
            imageShow: ImageProfile,
            viewModalDate: false,
            actualDatePicker: new Date(),
            actualDate: moment(new Date()).format('DD/MM/YYYY'),
            isLoading: false,
            // Form
            formName: '',
            formCourse: '- Seleccionar -',
            formTel: '',
            formEmail: '',
            formDNI: '',
            formDate: moment(new Date()).format('DD/MM/YYYY'),
            formImage: { uri: '', type: '', name: '' },
            // Errors
            errorFormName: false,
            errorFormTel: false,
            errorFormEmail: false,
            errorFormCourse: false,
            errorFormDate: false,
            errorFormDNI: false
        };
        this.closeAndClean = this.closeAndClean.bind(this);
        this.close = this.close.bind(this);
        this.changeImage2 = this.changeImage2.bind(this);
        this.errorImagePicker = this.errorImagePicker.bind(this);
    }
    private listCourses: string[] = ['- Seleccionar -', 'Profesor/a', '1°1', '1°2', '1°3', '2°1', '2°2', '2°3', '3°1', '3°2', '3°3', '4°1', '4°2', '4°3', '5°1', '5°2', '5°3', '6°1', '6°2', '6°3', '7°1', '7°2', '7°3'];
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private defaultOptions: Options = {
        cropping: true,
        multiple: false,
        mediaType: 'photo',
        cropperStatusBarColor: '#FF3232',
        cropperActiveWidgetColor: '#FF3232',
        cropperToolbarColor: '#FF3232',
        cropperToolbarWidgetColor: '#FFFFFF',
        cropperToolbarTitle: 'Editar imagen',
        writeTempFile: true,
        includeBase64: false,
        includeExif: false
    };
    closeAndClean() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.setState({
            isLoadImage: false,
            imageShow: ImageProfile,
            viewModalDate: false,
            actualDatePicker: new Date(),
            actualDate: moment(new Date()).format('DD/MM/YYYY'),
            isLoading: false,
            // Form
            formName: '',
            formCourse: '- Seleccionar -',
            formTel: '',
            formEmail: '',
            formDNI: '',
            formDate: moment(new Date()).format('DD/MM/YYYY'),
            formImage: { uri: '', type: '', name: '' },
            errorFormName: false,
            errorFormTel: false,
            errorFormEmail: false,
            errorFormCourse: false,
            errorFormDate: false,
            errorFormDNI: false
        }, this.close);
    }

    changeImage2({ mime, path }: TypeImageCrop) {
        const filename = path.replace(/^.*[\\\/]/, '');
        this.setState({ isLoadImage: true }, ()=>
            this.setState({
                imageShow: { uri: path },
                formImage: {
                    uri: path,
                    type: mime,
                    name: filename
                },
                isLoadImage: false
            }, ()=>{
                var verify = (filename!.indexOf('.png') !== -1) || (filename!.indexOf('.jpg') !== -1) || (filename!.indexOf('.jpeg') !== -1) || (filename!.indexOf('.webp') !== -1);
                if (!verify) ToastAndroid.show('La extensión de la imagen no es válida.', ToastAndroid.SHORT);
            })
        );
    }
    calcYears(date: string): number {
        var dateNow = new Date();
        var processDate = moment(date, 'DD/MM/YYYY').toDate();
        var years = dateNow.getFullYear() - processDate.getFullYear();
        var months = dateNow.getMonth() - processDate.getMonth();
        if (months < 0 || (months === 0 && dateNow.getDate() < processDate.getDate())) years--;
        return years;
    }
    verifyInputs() {
        var errors: number = 0;
        if (this.state.formName.length < 4) {
            errors += 1;
            this.setState({ errorFormName: true });
        }
        if (this.state.formDNI.length != 8) {
            errors += 1;
            this.setState({ errorFormDNI: true });
        }
        if (this.state.formCourse == '- Seleccionar -') {
            errors += 1;
            this.setState({ errorFormCourse: true });
        }
        if (this.state.formEmail.length !== 0) {
            var p1 = this.state.formEmail.indexOf('@');
            if (p1 !== -1) {
                if (this.state.formEmail.indexOf('.', p1) === -1) {
                    errors += 1;
                    this.setState({ errorFormEmail: true });
                }
            }
        }
        if (this.state.formTel.length > 10 && this.state.formTel.length < 17) {
            errors += 1;
            this.setState({ errorFormTel: true });
        }
        if (this.calcYears(this.state.formDate) < 11) {
            errors += 1;
            this.setState({ errorFormDate: true });
        }
        return errors == 0;
    }
    sendData() {
        this.setState({ isLoading: true }, ()=>
            Directive.getDataLocal().then((dataDirective)=>{
                var form = new FormData();
                form.append('addNewStudent', '1');
                form.append('name', encode(this.state.formName.trimStart().trimEnd()));
                form.append('dni', encode(this.state.formDNI));
                form.append('course', encode(this.state.formCourse));
                form.append('tel', encode(this.state.formTel));
                form.append('username', dataDirective.username);
                form.append('password', dataDirective.password);
                (this.state.formEmail.length !== 0)&&form.append('email', encode(this.state.formEmail));
                form.append('date', encode(this.state.formDate));
                (this.state.formImage.uri?.length !== 0)&&form.append('image', this.state.formImage);
                var verify = this.verifyInputs();
                if (!verify) return this.setState({ isLoading: false }, ()=>this.refCustomSnackbar.current?.open('Por favor revise los datos ingresados.'));
                Student.create(form).then(()=>{
                    this.refCustomSnackbar.current?.open('Estudiante añadido con exito.');
                    this.setState({
                        isLoading: false,
                        formName: '',
                        formCourse: '- Seleccionar -',
                        formTel: '',
                        formEmail: '',
                        formDNI: '',
                        formDate: moment(new Date()).format('DD/MM/YYYY'),
                        formImage: { uri: '', type: '', name: '' },
                        imageShow: ImageProfile,
                        actualDatePicker: new Date(),
                        actualDate: moment(new Date()).format('DD/MM/YYYY')
                    }, ()=>DeviceEventEmitter.emit('reloadPage3', true))
                })
                .catch((error)=>{
                    this.refCustomSnackbar.current?.open(error.cause);
                    this.setState({ isLoading: false });
                });
            })    
        );
    }
    errorImagePicker(error: object) {
        const ErrorString = String(error);
        if (ErrorString.indexOf('User cancelled image selection') != -1) return this.refCustomSnackbar.current?.open('Acción cancelada por el usuario.');
        if (ErrorString.indexOf('User did not grant camera permission') != -1) return this.refCustomSnackbar.current?.open('No se proporcionó acceso a la cámara.');
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    actionAddPicture(index: number) {
        if (index == 0) ImageCropPicker.openCamera(this.defaultOptions).then(this.changeImage2).catch(this.errorImagePicker);
        if (index == 1) ImageCropPicker.openPicker(this.defaultOptions).then(this.changeImage2).catch(this.errorImagePicker);
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onRequestClose={this.closeAndClean}>
            <PaperProvider theme={Theme}>
                <View style={{ flex: 1 }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.closeAndClean} />
                        <Appbar.Content title={'Añadir nuevo estudiante'}  />
                    </Appbar.Header>
                    <ScrollView style={{ flex: 2, backgroundColor: Theme.colors.background }}>
                        <View style={{ width: '100%', height: 124, flexDirection: 'row' }}>
                            <TouchableHighlight disabled={this.state.isLoading} onPress={this.props.goEditActionSheet} style={styles.touchImage}>
                                <View>
                                    <Image
                                        source={this.state.imageShow}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode={'cover'}
                                    />
                                    {(this.state.isLoadImage || this.state.isLoading)&&<ActivityIndicator animating={true} size={'large'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom:0, margin: 0  }} />}
                                </View>
                            </TouchableHighlight>
                            <View style={{ width: (width - 148), height: 100, marginTop: 16, justifyContent: 'center' }}>
                                <TextInput
                                    label={'Nombre y apellido'}
                                    mode={'outlined'}
                                    value={this.state.formName}
                                    disabled={this.state.isLoading}
                                    error={this.state.errorFormName}
                                    onChangeText={(text)=>this.setState({ formName: text, errorFormName: false })}
                                />
                            </View>
                        </View>
                        <View>
                            <TextInput
                                label={'D.N.I'}
                                keyboardType={'decimal-pad'}
                                style={styles.textInput}
                                value={this.state.formDNI}
                                disabled={this.state.isLoading}
                                error={this.state.errorFormDNI}
                                onChangeText={(text)=>this.setState({ formDNI: text.replace(/\ /gi, '').replace(/\./gi, '').replace(/\,/gi, '').replace(/\-/gi, ''), errorFormDNI: false })}
                                mode={'outlined'}
                            />
                            <CustomPicker2 title={"Curso:"} value={this.state.formCourse} error={this.state.errorFormCourse} disabled={this.state.isLoading} onChange={(v)=>this.setState({ formCourse: v, errorFormCourse: false })} style={styles.textInput}>
                                {this.listCourses.map((value, index)=><Picker.Item key={index.toString()} label={value} value={value} />)}
                            </CustomPicker2>
                            <TextInput
                                label={'Teléfono'}
                                keyboardType={'phone-pad'}
                                style={styles.textInput}
                                mode={'outlined'}
                                disabled={this.state.isLoading}
                                error={this.state.errorFormTel}
                                value={this.state.formTel}
                                onChangeText={(text)=>this.setState({ formTel: text.replace(/\ /gi, '').replace(/\./gi, '').replace(/\,/gi, '').replace(/\-/gi, ''), errorFormTel: false })}
                            />
                            <TextInput
                                label={'E-Mail (opcional)'}
                                keyboardType={'email-address'}
                                style={styles.textInput}
                                autoCapitalize={'none'}
                                mode={'outlined'}
                                disabled={this.state.isLoading}
                                error={this.state.errorFormEmail}
                                value={this.state.formEmail}
                                onChangeText={(text)=>this.setState({ formEmail: text, errorFormEmail: false })}
                            />
                            <Pressable onPress={()=>this.setState({ viewModalDate: true, errorFormDate: false })}>
                                <TextInput
                                    label={'Fecha de nacimiento'}
                                    style={styles.textInput}
                                    value={this.state.formDate}
                                    mode={'outlined'}
                                    disabled={this.state.isLoading}
                                    error={this.state.errorFormDate}
                                    editable={false}
                                    right={<TextInput.Icon disabled={this.state.isLoading} name="calendar-range" onPress={()=>this.setState({ viewModalDate: true, errorFormDate: false })} />}
                                />
                            </Pressable>
                            <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
                                <Button
                                    mode={'contained'}
                                    disabled={this.state.isLoading}
                                    loading={this.state.isLoading}
                                    onPress={()=>this.sendData()}
                                >Enviar</Button>
                            </View>
                        </View>
                    </ScrollView>
                    <CustomSnackbar ref={this.refCustomSnackbar} />
                    <Portal>
                        <Dialog visible={this.state.viewModalDate} dismissable={true} onDismiss={()=>this.setState({ viewModalDate: false })}>
                            <Dialog.Title>Fecha de nacimiento</Dialog.Title>
                            <Dialog.Content style={{ overflow: 'hidden' }}>
                                <DatePicker
                                    date={this.state.actualDatePicker}
                                    mode={'date'}
                                    theme={'auto'}
                                    onDateChange={(date)=>this.setState({ actualDatePicker: date, actualDate: moment(date).format('DD/MM/YYYY') })}
                                />
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={()=>this.setState({ viewModalDate: false })}>Cancelar</Button>
                                <Button onPress={()=>this.setState({ formDate: this.state.actualDate, viewModalDate: false })}>Aceptar</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    textInput: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 8,
        marginBottom: 0
    },
    touchImage: {
        position: 'relative',
        marginTop: 16,
        marginBottom: 16,
        marginRight: 16,
        marginLeft: 16,
        height: 100,
        width: 100,
        borderRadius: 168,
        overflow: 'hidden',
        elevation: 2,
        backgroundColor: '#FFFFFF'
    }
});