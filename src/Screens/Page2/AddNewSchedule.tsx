import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, StyleSheet, ToastAndroid, View } from "react-native";
import { Appbar, overlay } from "react-native-paper";
import CustomModal from "../../Components/CustomModal";
import CustomSnackbar from "../../Components/Elements/CustomSnackbar";
import { ThemeContext } from "../../Components/ThemeProvider";
import { Matters, Schedules } from "../../Scripts/ApiTecnica";
import { Matter } from "../../Scripts/ApiTecnica/types";
import Theme from "../../Themes";
import CreateScheduleDay, { DayResult } from "./CreateScheduleDay";

type IProps = {
    goLoading: (visible: boolean, text?: string)=>any;
};
type IState = {
    visible: boolean;
    isLoading: boolean;
    curse: string;
    matters: Matter[];
};

const Tab = createMaterialTopTabNavigator();

type Results = {
    day: string;
    hour: string;
    group: string;
    matter: string;
};

export default class AddNewShedule extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            isLoading: false,
            curse: '0°0',
            matters: []
        };
        this.close = this.close.bind(this);
        this.createNow = this.createNow.bind(this);
    }
    static contextType = ThemeContext;
    private tabOptions: MaterialTopTabNavigationOptions = {
        tabBarScrollEnabled: true,
        swipeEnabled: true,
        tabBarIndicatorStyle: { backgroundColor: Theme.colors.accent, height: 4 }
    };

    // Ref's
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private refMonday = createRef<CreateScheduleDay>();
    private refTuesday = createRef<CreateScheduleDay>();
    private refWednesday = createRef<CreateScheduleDay>();
    private refThursday = createRef<CreateScheduleDay>();
    private refFriday = createRef<CreateScheduleDay>();

    open(curse: string) {
        this.setState({
            visible: true,
            curse
        });
        this.loadData();
    }
    close() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.clearInputs();
        this.setState({ visible: false });
    }
    clearInputs() {
        this.refMonday.current?.clear();
        this.refTuesday.current?.clear();
        this.refWednesday.current?.clear();
        this.refThursday.current?.clear();
        this.refFriday.current?.clear();
    }
    createNow() {
        const mon = this.refMonday.current?.get();
        const tue = this.refTuesday.current?.get();
        const wed = this.refWednesday.current?.get();
        const thu = this.refThursday.current?.get();
        const fri = this.refFriday.current?.get();
        const verify = this.verify(mon!, tue!, wed!, thu!, fri!);
        if (verify) {
            this.props.goLoading(true, 'Combinando los datos...');
            const result: Results[] = [];
            mon!.forEach((value)=>result.push({ ...value, day: 'monday' }));
            tue!.forEach((value)=>result.push({ ...value, day: 'tuesday' }));
            wed!.forEach((value)=>result.push({ ...value, day: 'wednesday' }));
            thu!.forEach((value)=>result.push({ ...value, day: 'thursday' }));
            fri!.forEach((value)=>result.push({ ...value, day: 'friday' }));
            setTimeout(()=>this.sendData(result), 2000);
            return;
        }
        this.refCustomSnackbar.current?.open('Por favor revise los datos ingresados.');
    }

    sendData(data: Results[]) {
        this.props.goLoading(true, 'Enviando datos...');
        Schedules.create(this.state.curse, data)
            .then(()=>{
                this.props.goLoading(false);
                ToastAndroid.show('Se añadio el nuevo horario.', ToastAndroid.SHORT);
                this.close();
                DeviceEventEmitter.emit('p2-lists-reload', true);
            })
            .catch((error)=>{
                this.props.goLoading(false);
                this.refCustomSnackbar.current?.open(error.cause);
            });
    }

    loadData() {
        this.props.goLoading(true, 'Cargando materias...');
        this.setState({ isLoading: true }, ()=>
            Matters.getAll()
                .then((matters)=>this.setState({ matters, isLoading: false }, ()=>this.props.goLoading(false)))
                .catch((error)=>this.setState({ isLoading: false, visible: false }, ()=>{
                    this.props.goLoading(false);
                    ToastAndroid.show(error.cause, ToastAndroid.LONG);
                }))
        );
    }

    private verify(monday: DayResult[], tuesday: DayResult[], wednesday: DayResult[], thursday: DayResult[], friday: DayResult[]): boolean {
        const mon = this.verifyDay(monday);
        const tue = this.verifyDay(tuesday);
        const wed = this.verifyDay(wednesday);
        const thu = this.verifyDay(thursday);
        const fri = this.verifyDay(friday);
        return mon && tue && wed && thu && fri;
    }
    private verifyDay(days: DayResult[]): boolean {
        var r715: boolean = false;
        var r840: boolean = false;
        var r950: boolean = false;
        var r1100: boolean = false;
        days.forEach((day)=>{
            if (day.hour == '7:15') r715 = true;
            if (day.hour == '8:40') r840 = true;
            if (day.hour == '9:50') r950 = true;
            if (day.hour == '11:00') r1100 = true;
        });
        return r715 && r840 && r950 && r1100;
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            <NavigationContainer independent theme={{ ...theme, colors: { ...theme.colors, text: '#FFFFFF' } }}>
                <View style={styles.content}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={`Añadir horario (${this.state.curse})`} />
                        <Appbar.Action icon={'check'} disabled={this.state.isLoading} onPress={this.createNow} />
                    </Appbar.Header>
                    <View style={{ flex: 2 }}>
                        <Tab.Navigator initialRouteName={'Listas'} screenOptions={{ ...this.tabOptions, tabBarStyle: { backgroundColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.primary } }}>
                            <Tab.Screen name={'Lunes'} children={()=><CreateScheduleDay ref={this.refMonday} disabled={this.state.isLoading} matters={this.state.matters} />} />
                            <Tab.Screen name={'Martes'} children={()=><CreateScheduleDay ref={this.refTuesday} disabled={this.state.isLoading} matters={this.state.matters} />} />
                            <Tab.Screen name={'Miercoles'} children={()=><CreateScheduleDay ref={this.refWednesday} disabled={this.state.isLoading} matters={this.state.matters} />} />
                            <Tab.Screen name={'Jueves'} children={()=><CreateScheduleDay ref={this.refThursday} disabled={this.state.isLoading} matters={this.state.matters} />} />
                            <Tab.Screen name={'Viernes'} children={()=><CreateScheduleDay ref={this.refFriday} disabled={this.state.isLoading} matters={this.state.matters} />} />
                        </Tab.Navigator>
                    </View>
                    <CustomSnackbar ref={this.refCustomSnackbar} />
                </View>
            </NavigationContainer>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.background
    }
});