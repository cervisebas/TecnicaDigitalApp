import { Picker } from "@react-native-picker/picker";
import moment from "moment";
import React, { Component, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, overlay, TextInput } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { CustomPicker2 } from "../Components/Elements/CustomInput";
import DateTimePicker from '@react-native-community/datetimepicker';
import Theme from "../Themes";
import { Assist } from "../Scripts/ApiTecnica";
import { ThemeContext } from "../Components/ThemeProvider";

type IProps = {
    createNow: (datas: { course: string; date: string; time: string; }, then?: ()=>any)=>Promise<string>;
    openConfirm: (idGroup: string, select: { id: string; curse: string; date: string; })=>any;
};
type IState = {
    visible: boolean;
    // interface
    visibleDatePicker: boolean;
    visibleTimePicker: boolean;
    actualDatePicker: Date;
    // Form
    formCourse: string;
    formDate: string;
    formHour: string;
    // Errors
    errorFormCourse: boolean;
    errorFormDate: boolean;
    errorFormHour: boolean;
};

export default class AddNewGroupAssist extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        var calcHour = Assist.getCalcHour();
        this.state = {
            visible: false,
            // Interface
            visibleDatePicker: false,
            visibleTimePicker: false,
            actualDatePicker: new Date(),
            // Form
            formCourse: '- Seleccionar -',
            formDate: moment().format('DD/MM/YYYY'),
            formHour: (calcHour)? calcHour.toString(): 'Fuera de horario',
            // Errors
            errorFormCourse: false,
            errorFormDate: false,
            errorFormHour: !calcHour
        };
        this.createGroup = this.createGroup.bind(this);
        this.closeAndClean = this.closeAndClean.bind(this);
        this.close = this.close.bind(this);
    }
    private listCourses: string[] = ['- Seleccionar -', '1°1', '1°2', '1°3', '2°1', '2°2', '2°3', '3°1', '3°2', '3°3', '4°1', '4°2', '4°3', '5°1', '5°2', '5°3', '6°1', '6°2', '6°3', '7°1', '7°2', '7°3'];
    static contextType = ThemeContext;
    closeAndClean() {
        this.close();
        var calcHour = Assist.getCalcHour();
        this.setState({
            actualDatePicker: new Date(),
            formCourse: '- Seleccionar -',
            formDate: moment().format('DD/MM/YYYY'),
            formHour: (calcHour)? calcHour.toString(): 'Fuera de horario',
            errorFormCourse: false,
            errorFormDate: false,
            errorFormHour: !calcHour
        });
    }
    verifyInputs() {
        if (this.state.formCourse == '- Seleccionar -') {
            this.setState({ errorFormCourse: true });
            return false;
        }
        if (this.state.formHour == 'Fuera de horario') {
            this.setState({ errorFormHour: true });
            return false;
        }
        return true;
    }
    createGroup() {
        if (!this.verifyInputs()) return;
        this.props.createNow({ course: this.state.formCourse, date: this.state.formDate, time: this.state.formHour }, this.close)
            .then((id)=>{
                this.props.openConfirm(id, { id, curse: this.state.formCourse, date: this.state.formDate });
                this.closeAndClean();
            });
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} style={{ marginLeft: 12, marginRight: 12 }} onRequestClose={this.closeAndClean} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={{ backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background, borderRadius: 8, overflow: 'hidden' }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.closeAndClean} />
                    <Appbar.Content title={'Agregar nuevo grupo'}  />
                    <Appbar.Action icon={'check'} onPress={this.createGroup} />
                </Appbar.Header>
                <ScrollView style={{ paddingBottom: 8 }}>
                    <CustomPicker2 title={"Curso:"} value={this.state.formCourse} error={this.state.errorFormCourse} onChange={(v)=>this.setState({ formCourse: v, errorFormCourse: false })} style={styles.textInput}>
                        {this.listCourses.map((value, index)=><Picker.Item
                            key={index.toString()}
                            label={value}
                            value={value}
                            color={'#000000'}
                        />)}
                    </CustomPicker2>
                    <Pressable onPress={()=>this.setState({ visibleDatePicker: true })}>
                        <TextInput
                            label={'Establecer fecha (Opcional)'}
                            style={styles.textInput}
                            value={this.state.formDate}
                            mode={'outlined'}
                            error={this.state.errorFormDate}
                            editable={false}
                            right={<TextInput.Icon name="calendar-range" onPress={()=>this.setState({ visibleDatePicker: true })} />}
                        />
                    </Pressable>
                    <Pressable onPress={()=>this.setState({ visibleTimePicker: true })}>
                        <TextInput
                            label={'Establecer hora (Opcional)'}
                            style={{ ...styles.textInput }}
                            value={this.state.formHour}
                            mode={'outlined'}
                            error={this.state.errorFormHour}
                            editable={false}
                            right={<TextInput.Icon name="clock-outline" onPress={()=>this.setState({ visibleTimePicker: true })} />}
                        />
                    </Pressable>
                </ScrollView>
                {(this.state.visibleDatePicker)&&<DateTimePicker
                    mode={'date'}
                    value={this.state.actualDatePicker}
                    onChange={({ type }, date)=>{
                        if (type == 'dismissed') return this.setState({ visibleDatePicker: false });
                        (date)&&this.setState({
                            actualDatePicker: date,
                            formDate: moment(date).format('DD/MM/YYYY'),
                            visibleDatePicker: false,
                        });
                    }}
                />}
                {(this.state.visibleTimePicker)&&<DateTimePicker
                    mode={'time'}
                    value={new Date()}
                    onChange={({ type }, date)=>{
                        if (type == 'dismissed') return this.setState({ visibleTimePicker: false });
                        if (date) {
                            var calcHour = Assist.getCalcHour(date);
                            this.setState({
                                formHour: (calcHour)? calcHour.toString(): 'Fuera de horario',
                                visibleTimePicker: false,
                                errorFormHour: !calcHour
                            });
                        }
                    }}
                />}
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