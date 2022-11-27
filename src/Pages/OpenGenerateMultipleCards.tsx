import { Picker } from "@react-native-picker/picker";
import moment from "moment";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, overlay } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { CustomPicker2 } from "../Components/Elements/CustomInput";
import { ThemeContext } from "../Components/ThemeProvider";

type IProps = {
    openChangeDesing: (isVip?: boolean)=>any;
    openListCrendentials: (curse: string)=>any;
    onChangeCurse: (curse: string)=>any;
};
type IState = {
    visible: boolean;
    selectCurse: string;
    errorSelectCurse: boolean;
    disableCustomize: boolean;
};

export default class OpenGenerateMultipleCards extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            selectCurse: '- Seleccionar -',
            errorSelectCurse: false,
            disableCustomize: false
        };
        this.closeClear = this.closeClear.bind(this);
        this.send = this.send.bind(this);
        this.verifyInput = this.verifyInput.bind(this);
        this.openChangeDesign = this.openChangeDesign.bind(this);
        this.close = this.close.bind(this);
        this._onChangeCurse = this._onChangeCurse.bind(this);
    }
    private listCourses: string[] = ['- Seleccionar -', 'Docentes', '1°1', '1°2', '1°3', '2°1', '2°2', '2°3', '3°1', '3°2', '3°3', '4°1', '4°2', '4°3', '5°1', '5°2', '5°3', '6°1', '6°2', '6°3', '7°1', '7°2', '7°3'];
    static contextType = ThemeContext;
    componentWillUnmount() {
        this.setState({
            selectCurse: '',
            errorSelectCurse: false
        });
    }
    componentDidUpdate(_prevProps: Readonly<IProps>, prevState: Readonly<IState>): void {
        if (this.state.selectCurse !== prevState.selectCurse)
            this.props.onChangeCurse(this.state.selectCurse);
    }
    verifyInput() {
        if (this.state.selectCurse == '- Seleccionar -') {
            this.setState({ errorSelectCurse: true });
            return false;
        }
        return true;
    }
    send() {
        if (this.verifyInput()) {
            this.props.openListCrendentials(this.state.selectCurse);
            this.close();
        }
    }
    closeClear() {
        this.setState({
            selectCurse: '- Seleccionar -',
            errorSelectCurse: false
        });
    }
    openChangeDesign() {
        const isVip = (this.state.selectCurse.indexOf('7°') !== -1) && (moment().format("YYYY") == "2022");
        this.props.openChangeDesing(isVip);
    }
    _onChangeCurse(selectCurse: string) {
        let state: any = { selectCurse, errorSelectCurse: false };
        if (selectCurse == 'Docentes') state['disableCustomize'] = true; else if (this.state.disableCustomize) state['disableCustomize'] = false;
        this.setState(state);
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
        return(<CustomModal visible={this.state.visible} onClose={this.closeClear} onRequestClose={this.close} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={{ backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background, margin: 8, borderRadius: 8, overflow: 'hidden' }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={`Generar credenciales`} />
                    <Appbar.Action icon={'pencil-ruler'} disabled={this.state.disableCustomize} onPress={this.openChangeDesign} />
                    <Appbar.Action icon={'send-outline'} onPress={this.send} />
                </Appbar.Header>
                <View style={{ marginTop: 4, marginBottom: 8 }}>
                    <CustomPicker2 title={"Curso:"} value={this.state.selectCurse} error={this.state.errorSelectCurse} onChange={this._onChangeCurse} style={styles.textInput}>
                        {this.listCourses.map((value, index)=><Picker.Item
                            key={index.toString()}
                            label={value}
                            value={value}
                            color={'#000000'}
                        />)}
                    </CustomPicker2>
                </View>
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    textInput: {
        marginLeft: 16,
        marginRight: 16,
        marginTop: 8,
        marginBottom: 8,
        height: 56
    }
});