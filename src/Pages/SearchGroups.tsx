import { Picker } from "@react-native-picker/picker";
import moment from "moment";
import React, { Component, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { CustomPicker2 } from "../Components/Elements/CustomInput";
import DateTimePicker from '@react-native-community/datetimepicker';
import Theme from "../Themes";
import { Assist } from "../Scripts/ApiTecnica";

type IProps = {
    visible: boolean;
    close: ()=>any;
    goSearch: (newDate: Date)=>any;
};
type IState = {
    visibleDatePicker: boolean;
    dateStr: string;
    date: Date;
};

export default class SearchGroups extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visibleDatePicker: false,
            dateStr: '00/00/0000',
            date: new Date()
        };
        this.goSearch = this.goSearch.bind(this);
        this.resetDate = this.resetDate.bind(this);
    }
    componentDidMount(): void {
        this.setState({
            dateStr: moment().format('DD/MM/YYYY')
        });
    }
    goSearch() {
        this.props.goSearch(this.state.date);
    }
    resetDate() {
        this.setState({
            date: new Date(),
            dateStr: moment().format('DD/MM/YYYY')
        });
    }
    render(): ReactNode {
        return(<CustomModal visible={this.props.visible} style={{ marginLeft: 12, marginRight: 12 }} onShow={this.resetDate} onRequestClose={this.props.close} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={{ backgroundColor: Theme.colors.background, borderRadius: 8, overflow: 'hidden' }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.props.close} />
                    <Appbar.Content title={'Buscar registro'}  />
                    <Appbar.Action icon={'magnify'} onPress={this.goSearch} />
                </Appbar.Header>
                <ScrollView style={{ paddingBottom: 8 }}>
                    <Pressable onPress={()=>this.setState({ visibleDatePicker: true })}>
                        <TextInput
                            label={'Establecer fecha (Opcional)'}
                            style={styles.textInput}
                            value={this.state.dateStr}
                            mode={'outlined'}
                            editable={false}
                            right={<TextInput.Icon name="calendar-range" onPress={()=>this.setState({ visibleDatePicker: true })} />}
                        />
                    </Pressable>
                </ScrollView>
                {(this.state.visibleDatePicker)&&<DateTimePicker
                    mode={'date'}
                    value={this.state.date}
                    onChange={({ type }, date)=>{
                        if (type == 'dismissed') return this.setState({ visibleDatePicker: false });
                        (date)&&this.setState({
                            date: date,
                            dateStr: moment(date).format('DD/MM/YYYY'),
                            visibleDatePicker: false,
                        });
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