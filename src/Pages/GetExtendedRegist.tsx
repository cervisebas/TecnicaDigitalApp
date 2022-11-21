import { Picker } from "@react-native-picker/picker";
import moment from "moment";
import React, { PureComponent } from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";
import { Appbar, Button, overlay } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { CustomPicker2 } from "../Components/Elements/CustomInput";
import { ThemeContext } from "../Components/ThemeProvider";

type IProps = {
    generateNow: (curse: string, month: number, age: number)=>any;
};
type IState = {
    visible: boolean;
    formCurse: string;
    formMonth: number;
    formAge: number;
    errorFormCurse: boolean;
};

export default class GetExtendedRegist extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            formCurse: '- Seleccionar -',
            formMonth: parseInt(moment().format('MM')),
            formAge: 2022,
            errorFormCurse: false
        };
        
        const ageNow = parseInt(moment().format('YYYY')) + 11;
        const listAges: number[] = [];
        for (let i = 1900; i < ageNow; i++) { listAges.push(i); }
        this.listAges = listAges;
        
        this.onClose = this.onClose.bind(this);
        this.close = this.close.bind(this);
        this.send = this.send.bind(this);
    }
    static contextType = ThemeContext;
    private listCourses: string[] = ['- Seleccionar -', '1°1', '1°2', '1°3', '2°1', '2°2', '2°3', '3°1', '3°2', '3°3', '4°1', '4°2', '4°3', '5°1', '5°2', '5°3', '6°1', '6°2', '6°3', '7°1', '7°2', '7°3'];
    private listMonths = [
        { index: 1, name: 'Enero'},
        { index: 2, name: 'Febrero'},
        { index: 3, name: 'Marzo'},
        { index: 4, name: 'Abril'},
        { index: 5, name: 'Mayo'},
        { index: 6, name: 'Junio'},
        { index: 7, name: 'Julio'},
        { index: 8, name: 'Agosto'},
        { index: 9, name: 'Septiembre'},
        { index: 10, name: 'Octubre'},
        { index: 11, name: 'Noviembre'},
        { index: 12, name: 'Diciembre'}
    ];
    private listAges: number[] = [];

    onClose() {
        this.setState({
            formCurse: '- Seleccionar -',
            formMonth: parseInt(moment().format('MM')),
            formAge: 2022,
            errorFormCurse: false
        });
    }
    send() {
        if (this.verify()) return ToastAndroid.show('Por favor, revise los datos ingresados...', ToastAndroid.SHORT);
        this.props.generateNow(this.state.formCurse, this.state.formMonth, this.state.formAge);
        this.close();
    }
    verify(): boolean {
        if (this.state.formCurse == '- Seleccionar -') {
            this.setState({ errorFormCurse: true });
            return true;
        }
        return false;
    }

    // Controller
    open() {
        this.setState({
            visible: true
        });
    }
    close() {
        this.setState({
            visible: false
        });
    }
    restaure(curse: string, month: number, age: number) {
        this.setState({
            visible: true,
            formCurse: curse,
            formMonth: month,
            formAge: age
        });
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onClose={this.onClose} onRequestClose={this.close} style={{ paddingLeft: 12, paddingRight: 12 }} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={[styles.content, { backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background, borderRadius: 8, overflow: 'hidden' }]}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={'Generar registro extendido'} />
                </Appbar.Header>
                <View style={styles.view}>
                    <CustomPicker2 title={"Curso:"} value={this.state.formCurse} error={this.state.errorFormCurse} onChange={(v)=>this.setState({ formCurse: v, errorFormCurse: false })} style={styles.textInput}>
                        {this.listCourses.map((value, index)=><Picker.Item
                            key={index.toString()}
                            label={value}
                            value={value}
                            color={'#000000'}
                            //style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
                        />)}
                    </CustomPicker2>
                    <CustomPicker2 title={"Mes:"} value={this.state.formMonth as any} onChange={(v: any)=>this.setState({ formMonth: v })} style={styles.textInput}>
                        {this.listMonths.map((value)=><Picker.Item
                            key={value.name}
                            label={value.name}
                            value={value.index}
                            color={'#000000'}
                        />)}
                    </CustomPicker2>
                    <CustomPicker2 title={"Año:"} value={this.state.formAge as any} onChange={(v: any)=>this.setState({ formAge: v })} style={styles.textInput}>
                        {this.listAges.map((value)=><Picker.Item
                            key={`age-${value}`}
                            label={value.toString()}
                            value={value}
                            color={'#000000'}
                        />)}
                    </CustomPicker2>
                    <View style={styles.buttonView}>
                        <Button
                            mode={'contained'}
                            onPress={this.send}
                        >Generar</Button>
                    </View>
                </View>
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    content: {
        width: '100%'
    },
    view: {
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 16
    },
    textInput: {
        marginLeft: 8,
        marginRight: 8,
        marginTop: 8,
        marginBottom: 0,
        height: 56
    },
    buttonView: {
        paddingTop: 12,
        paddingRight: 8,
        paddingLeft: 8
    }
});