import { Picker } from "@react-native-picker/picker";
import { decode } from "base-64";
import moment from "moment";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { CustomPicker2 } from "../Components/Elements/CustomInput";
import Theme from "../Themes";

type IProps = {
    openChangeDesing: (isVip?: boolean)=>any;
    openListCrendentials: (curse: string)=>any;
    onChangeCurse: (curse: string)=>any;
};
type IState = {
    visible: boolean;
    selectCurse: string;
    errorSelectCurse: boolean;
};

export default class OpenGenerateMultipleCards extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            selectCurse: '- Seleccionar -',
            errorSelectCurse: false
        };
        this.closeClear = this.closeClear.bind(this);
        this.send = this.send.bind(this);
        this.verifyInput = this.verifyInput.bind(this);
        this.openChangeDesign = this.openChangeDesign.bind(this);
        this.close = this.close.bind(this);
    }
    private listCourses: string[] = ['- Seleccionar -', 'Docentes', '1°1', '1°2', '1°3', '2°1', '2°2', '2°3', '3°1', '3°2', '3°3', '4°1', '4°2', '4°3', '5°1', '5°2', '5°3', '6°1', '6°2', '6°3', '7°1', '7°2', '7°3'];
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

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onClose={this.closeClear} onRequestClose={this.close} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={{ backgroundColor: Theme.colors.background, margin: 8, borderRadius: 8, overflow: 'hidden' }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={`Generar credenciales`} />
                    <Appbar.Action icon={'pencil-ruler'} onPress={this.openChangeDesign} />
                    <Appbar.Action icon={'send-outline'} onPress={this.send} />
                </Appbar.Header>
                <View style={{ marginTop: 4, marginBottom: 8 }}>
                    <CustomPicker2 title={"Curso:"} value={this.state.selectCurse} error={this.state.errorSelectCurse} onChange={(v)=>this.setState({ selectCurse: v, errorSelectCurse: false })} style={styles.textInput}>
                        {this.listCourses.map((value, index)=><Picker.Item key={index.toString()} label={value} value={value} />)}
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