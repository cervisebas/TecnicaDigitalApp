import moment from "moment";
import React, { Component, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, TextInput } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import DateTimePicker from '@react-native-community/datetimepicker';
import Theme from "../Themes";
import { ThemeContext } from "../Components/ThemeProvider";

type IProps = {
    goSearch: (newDate: Date)=>any;
};
type IState = {
    visible: boolean;
    visibleDatePicker: boolean;
    dateStr: string;
    date: Date;
};

export default class SearchGroups extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            visibleDatePicker: false,
            dateStr: '00/00/0000',
            date: new Date()
        };
        this.goSearch = this.goSearch.bind(this);
        this.resetDate = this.resetDate.bind(this);
        this.close = this.close.bind(this);
    }
    static contextType = ThemeContext;
    componentDidMount(): void {
        this.setState({
            dateStr: moment().format('DD/MM/YYYY')
        });
    }
    goSearch() {
        this.props.goSearch(this.state.date);
        this.close();
    }
    resetDate() {
        this.setState({
            date: new Date(),
            dateStr: moment().format('DD/MM/YYYY')
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
        return(<CustomModal visible={this.state.visible} style={{ marginLeft: 12, marginRight: 12 }} onShow={this.resetDate} onRequestClose={this.close} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={[styles.content, { backgroundColor: (isDark)? theme.colors.surface: theme.colors.background }]}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
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
    content: {
        borderRadius: 8,
        overflow: 'hidden'
    },
    textInput: {
        marginLeft: 8,
        marginRight: 8,
        marginTop: 8,
        marginBottom: 0
    }
});