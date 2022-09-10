import { Picker } from "@react-native-picker/picker";
import { decode, encode } from "base-64";
import moment from "moment";
import React, { Component, createRef, PureComponent } from "react";
import { View, Image, ImageSourcePropType, TouchableHighlight, Dimensions, StyleSheet, ScrollView, ToastAndroid, DeviceEventEmitter, Pressable, LayoutChangeEvent, TouchableWithoutFeedback, Keyboard } from "react-native";
import DatePicker from "react-native-date-picker";
import ImageCropPicker, { Options, Image as TypeImageCrop } from "react-native-image-crop-picker";
import { ActivityIndicator, Appbar, Dialog, Portal, TextInput, Button, Provider as PaperProvider, Checkbox, Text, ProgressBar } from "react-native-paper";
import CustomModal from "../../Components/CustomModal";
import { CustomPicker2 } from "../../Components/Elements/CustomInput";
import CustomSnackbar from "../../Components/Elements/CustomSnackbar";
import { Directive, Matters, Student } from "../../Scripts/ApiTecnica";
import Theme from "../../Themes";

type IProps = {};
type IState = {
    visible: boolean;
    isLoading: boolean;
    isLoadingTeachers: boolean;
    listTeachers: {
        id: string;
        name: string;
    }[];

    // Form
    formName: string;
    formTeacher: string;

    // Errors
    errorFormName: boolean;
    errorFormTeacher: boolean;
};

export default class AddNewMatter extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            isLoading: false,
            isLoadingTeachers: true,
            listTeachers: [{ id: '-1', name: encode('Cargando...') }],
            // Form
            formName: '',
            formTeacher: '-1',
            // Errors
            errorFormName: false,
            errorFormTeacher: false
        };
        this.closeAndClean = this.closeAndClean.bind(this);
        this.close = this.close.bind(this);
        this.sendData = this.sendData.bind(this);
        this.loadingTeachers = this.loadingTeachers.bind(this);
    }
    private refCustomSnackbar = createRef<CustomSnackbar>();

    closeAndClean() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.setState({
            isLoading: false,
            listTeachers: [{ id: '-1', name: encode('Cargando...') }],
            // Form
            formName: '',
            formTeacher: '-1'
        }, this.close);
    }

    verifyInputs() {
        var errors: number = 0;
        if (this.state.formName.length < 4) {
            errors += 1;
            this.setState({ errorFormName: true });
        }
        if (this.state.formTeacher == '-1') {
            errors += 1;
            this.setState({ errorFormTeacher: true });
        }
        return errors == 0;
    }
    sendData() {
        this.setState({ isLoading: true }, ()=>{
            if (!this.verifyInputs()) return this.setState({ isLoading: false }, ()=>this.refCustomSnackbar.current?.open("Por favor revise los datos ingresados."));
            Matters.create(this.state.formTeacher, encode(this.state.formName.trimStart().trimEnd()))
                .then(()=>{
                    this.setState({
                        formName: '',
                        formTeacher: '-1',
                        errorFormName: false,
                        errorFormTeacher: false,
                        isLoading: false
                    });
                    this.refCustomSnackbar.current?.open('Materia añadida con éxito.');
                    DeviceEventEmitter.emit('p2-matters-reload', true);
                })
                .catch((error)=>{
                    this.setState({ isLoading: false });
                    this.refCustomSnackbar.current?.open(error.cause);
                })
        });
    }
    loadingTeachers() {
        this.setState({ isLoadingTeachers: true }, ()=>
            Student.getAllTeachers()
                .then((list)=>this.setState({
                    isLoadingTeachers: false,
                    listTeachers: [{ id: '-1', name: encode('- Seleccionar -') }].concat(list)
                }))
                .catch((error)=>{
                    this.setState({ listTeachers: [{ id: '-1', name: encode('Error al cargar...') }] });
                    this.refCustomSnackbar.current?.open(error.cause);
                })
        );
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onShow={this.loadingTeachers} onRequestClose={this.closeAndClean}>
            <PaperProvider theme={Theme}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
                        <Appbar.Header>
                            <Appbar.BackAction onPress={this.closeAndClean} />
                            <Appbar.Content title={'Añadir nueva materia'} />
                        </Appbar.Header>
                        <ProgressBar indeterminate color={Theme.colors.accent} style={[styles.progressBar, { opacity: (this.state.isLoadingTeachers)? 1: 0 }]} />
                        <View style={{ flex: 2 }}>
                            <TextInput
                                label={'Nombre de la materia'}
                                mode={'outlined'}
                                autoCapitalize={'words'}
                                style={styles.textInput}
                                value={this.state.formName}
                                disabled={this.state.isLoading || this.state.isLoadingTeachers}
                                error={this.state.errorFormName}
                                onChangeText={(text)=>this.setState({ formName: text, errorFormName: false })}
                            />
                            <CustomPicker2 title={"Profesor:"} value={this.state.formTeacher} error={this.state.errorFormTeacher} disabled={this.state.isLoading || this.state.isLoadingTeachers} onChange={(v)=>(!this.state.isLoadingTeachers)&&this.setState({ formTeacher: v, errorFormTeacher: false })} style={styles.textInput}>
                                {this.state.listTeachers.map((value)=><Picker.Item
                                    key={`item-teacher-${value.id}`}
                                    label={decode(value.name)}
                                    value={value.id}
                                />)}
                            </CustomPicker2>
                            <View style={styles.buttonContent}>
                                <Button
                                    mode={'contained'}
                                    disabled={this.state.isLoading || this.state.isLoadingTeachers}
                                    loading={this.state.isLoading}
                                    onPress={this.sendData}
                                >Enviar</Button>
                            </View>
                        </View>
                        <CustomSnackbar ref={this.refCustomSnackbar} />
                    </View>
                </TouchableWithoutFeedback>
            </PaperProvider>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    textInput: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 8,
        marginBottom: 0,
        minHeight: 56
    },
    checkbox_teachers: {
        marginLeft: 16,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    progressBar: {
        backgroundColor: '#FFFFFF'
    },
    buttonContent: {
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24
    }
});