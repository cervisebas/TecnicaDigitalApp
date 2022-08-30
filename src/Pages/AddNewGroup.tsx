import { Picker } from "@react-native-picker/picker";
import React, { Component, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { CustomPicker2 } from "../Components/Elements/CustomInput";
import Theme from "../Themes";

type IProps = {
    next: (curse: string, group: string)=>any;
};
type IState = {
    visible: boolean;
    // interface
    visibleDatePicker: boolean;
    visibleTimePicker: boolean;
    actualDatePicker: Date;
    // Form
    formCourse: string;
    formGroup: string;
    // Errors
    errorFormCourse: boolean;
    errorFormGroup: boolean;
};

export default class AddNewGroup extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            // Interface
            visibleDatePicker: false,
            visibleTimePicker: false,
            actualDatePicker: new Date(),
            // Form
            formCourse: '- Seleccionar -',
            formGroup: '- Seleccionar -',
            // Errors
            errorFormCourse: false,
            errorFormGroup: false
        };
        this.createGroup = this.createGroup.bind(this);
        this.closeAndClean = this.closeAndClean.bind(this);
        this.close = this.close.bind(this);
    }
    private listCourses: string[] = ['- Seleccionar -', 'Profesor/a', '1°1', '1°2', '1°3', '2°1', '2°2', '2°3', '3°1', '3°2', '3°3', '4°1', '4°2', '4°3', '5°1', '5°2', '5°3', '6°1', '6°2', '6°3', '7°1', '7°2', '7°3'];
    private listGroup: string[] = ['- Seleccionar -', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    closeAndClean() {
        this.close();
        this.setState({
            actualDatePicker: new Date(),
            formCourse: '- Seleccionar -',
            formGroup: '- Seleccionar -',
            errorFormCourse: false,
            errorFormGroup: false
        });
    }
    verifyInputs() {
        if (this.state.formCourse == '- Seleccionar -') {
            this.setState({ errorFormCourse: true });
            return false;
        }
        if (this.state.formGroup == '- Seleccionar -') {
            this.setState({ errorFormGroup: true });
            return false;
        }
        return true;
    }
    createGroup() {
        if (!this.verifyInputs()) return;
        this.props.next(this.state.formCourse, this.state.formGroup);
        this.closeAndClean();
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): ReactNode {
        return(<CustomModal visible={this.state.visible} style={{ marginLeft: 12, marginRight: 12 }} onRequestClose={this.closeAndClean} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={{ backgroundColor: Theme.colors.background, borderRadius: 8, overflow: 'hidden' }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.closeAndClean} />
                    <Appbar.Content title={'Agregar nuevo grupo'}  />
                    <Appbar.Action icon={'check'} onPress={this.createGroup} />
                </Appbar.Header>
                <ScrollView style={{ paddingBottom: 8 }}>
                    <CustomPicker2 title={"Curso:"} value={this.state.formCourse} error={this.state.errorFormCourse} onChange={(v)=>this.setState({ formCourse: v, errorFormCourse: false })} style={styles.textInput}>
                        {this.listCourses.map((value, index)=><Picker.Item key={index.toString()} label={value} value={value} />)}
                    </CustomPicker2>
                    <CustomPicker2 title={"Grupo:"} value={this.state.formGroup} error={this.state.errorFormGroup} onChange={(v)=>this.setState({ formGroup: v, errorFormGroup: false })} style={styles.textInput}>
                        {this.listGroup.map((value, index)=><Picker.Item key={index.toString()} label={value} value={value} />)}
                    </CustomPicker2>
                </ScrollView>
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    textInput: {
        marginLeft: 8,
        marginRight: 8,
        marginTop: 8,
        marginBottom: 0
    }
});