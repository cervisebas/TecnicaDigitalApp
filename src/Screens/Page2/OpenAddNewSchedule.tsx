import { Picker } from "@react-native-picker/picker";
import React, { createRef, PureComponent } from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Appbar, Button, overlay } from "react-native-paper";
import CustomModal from "../../Components/CustomModal";
import { CustomPicker2 } from "../../Components/Elements/CustomInput";
import CustomSnackbar from "../../Components/Elements/CustomSnackbar";
import { ThemeContext } from "../../Components/ThemeProvider";

type IProps = {
    nextStep: (curse: string)=>any;
};
type IState = {
    visible: boolean;
    // Form
    formCurse: string;
    // Errors
    errorFormCurse: boolean;
};

export default class OpenAddNewSchedule extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            // Form
            formCurse: '- Seleccionar -',
            // Errors
            errorFormCurse: false
        };
        this.close = this.close.bind(this);
        this.sendData = this.sendData.bind(this);
    }
    private listCourses: string[] = ['- Seleccionar -', '1°1', '1°2', '1°3', '2°1', '2°2', '2°3', '3°1', '3°2', '3°3', '4°1', '4°2', '4°3', '5°1', '5°2', '5°3', '6°1', '6°2', '6°3', '7°1', '7°2', '7°3'];
    private refCustomSnackbar = createRef<CustomSnackbar>();
    static contextType = ThemeContext;

    verifyInputs() {
        var errors: number = 0;
        if (this.state.formCurse == '- Seleccionar -') {
            errors += 1;
            this.setState({ errorFormCurse: true });
        }
        return errors == 0;
    }
    sendData() {
        if (!this.verifyInputs()) return;
        const curse = this.state.formCurse;
        this.props.nextStep(curse);
        this.setState({ visible: false, formCurse: '- Seleccionar -' });
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.content, { backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background }]}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={'Añadir nuevo horario'} />
                    </Appbar.Header>
                    <View>
                        <CustomPicker2 title={"Curso:"} value={this.state.formCurse} error={this.state.errorFormCurse} onChange={(v)=>this.setState({ formCurse: v, errorFormCurse: false })} style={styles.textInput}>
                            {this.listCourses.map((value)=><Picker.Item
                                key={`item-curse-${value}`}
                                label={value}
                                value={value}
                                color={'#000000'}
                            />)}
                        </CustomPicker2>
                        <View style={styles.buttonContent}>
                            <Button
                                mode={'contained'}
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