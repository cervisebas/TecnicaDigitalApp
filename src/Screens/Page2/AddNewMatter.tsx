import { decode, encode } from "base-64";
import React, { createRef, PureComponent } from "react";
import { View, StyleSheet, ToastAndroid, DeviceEventEmitter, TouchableWithoutFeedback, Keyboard, Pressable, Platform } from "react-native";
import { Appbar, TextInput, Button, ProgressBar, overlay } from "react-native-paper";
import CustomModal from "../../Components/CustomModal";
import CustomSnackbar from "../../Components/Elements/CustomSnackbar";
import { ThemeContext } from "../../Components/ThemeProvider";
import { Matters, Student } from "../../Scripts/ApiTecnica";

type IProps = {
    openTeacherSelector?: (id: string, teachers: { id: string; name: string; }[])=>any;
    openMatterSelector?: ()=>any;
};
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

export default class AddNewMatter extends PureComponent<IProps, IState> {
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
        this._openTeacherSelector = this._openTeacherSelector.bind(this);
    }
    private refCustomSnackbar = createRef<CustomSnackbar>();
    static contextType = ThemeContext;

    closeAndClean() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.setState({
            isLoading: false,
            listTeachers: [{ id: '-1', name: encode('Cargando...') }],
            // Form
            formName: '',
            formTeacher: '-1',
            // Erros
            errorFormName: false,
            errorFormTeacher: false
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
    _openTeacherSelector() {
        if (!this.props.openTeacherSelector) return;
        this.props.openTeacherSelector(this.state.formTeacher, this.state.listTeachers);
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    updateMatter(formName: string) {
        this.setState({ formName });
    }
    updateTeacher(formTeacher: string) {
        this.setState({ formTeacher });
    }

    getNameTeacherByID(id: string) {
        if (id == '-1') return '- Seleccionar -';
        const search = this.state.listTeachers.find((v)=>v.id == id);
        if (search == undefined) return '- Seleccionar -';
        return decode(search.name);
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onShow={this.loadingTeachers} onRequestClose={this.closeAndClean} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.content, { backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background }]}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.closeAndClean} borderless={Platform.Version > 25} />
                        <Appbar.Content title={'Añadir nueva materia'} />
                    </Appbar.Header>
                    <ProgressBar indeterminate color={theme.colors.accent} style={{ opacity: (this.state.isLoadingTeachers)? 1: 0, backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background }} />
                    <View>
                        <TextInput
                            label={'Nombre de la materia'}
                            mode={'outlined'}
                            autoCapitalize={'words'}
                            style={styles.textInput}
                            value={this.state.formName}
                            disabled={this.state.isLoading || this.state.isLoadingTeachers}
                            error={this.state.errorFormName}
                            onChangeText={(text)=>this.setState({ formName: text, errorFormName: false })}
                            right={<TextInput.Icon
                                icon={'magnify'}
                                disabled={this.state.isLoading || this.state.isLoadingTeachers}
                                onPress={this.props.openMatterSelector}
                            />}
                        />
                        <Pressable onPress={this._openTeacherSelector}>
                            <TextInput
                                label={'Profesor'}
                                mode={'outlined'}
                                style={styles.textInput}
                                value={this.getNameTeacherByID(this.state.formTeacher)}
                                editable={false}
                                disabled={this.state.isLoading || this.state.isLoadingTeachers}
                                error={this.state.errorFormTeacher}
                                right={<TextInput.Icon
                                    icon={'gesture-tap'}
                                    disabled={this.state.isLoading || this.state.isLoadingTeachers}
                                    onPress={this._openTeacherSelector}
                                />}
                            />
                        </Pressable>
                        {/*<CustomPicker2 title={"Profesor:"} value={this.state.formTeacher} error={this.state.errorFormTeacher} disabled={this.state.isLoading || this.state.isLoadingTeachers} onChange={(v)=>(!this.state.isLoadingTeachers)&&this.setState({ formTeacher: v, errorFormTeacher: false })} style={styles.textInput}>
                            {this.state.listTeachers.map((value)=><Picker.Item
                                key={`item-teacher-${value.id}`}
                                label={decode(value.name)}
                                value={value.id}
                                color={'#000000'}
                            />)}
                        </CustomPicker2>*/}
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
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    content: {
        overflow: 'hidden',
        marginLeft: 8,
        marginRight: 8,
        borderRadius: 8
    },
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
    buttonContent: {
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24
    }
});