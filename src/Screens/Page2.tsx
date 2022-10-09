import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from "@react-navigation/material-top-tabs";
import React, { Component, createRef } from "react";
import { View } from "react-native";
import { Appbar, overlay, Provider as PaperProvider } from "react-native-paper";
import Theme from "../Themes";
import FabPage2 from "./Page2/FabPage2";
import Page2Matters from "./Page2/Matters";
import Page2Lists from "./Page2/Lists";
import { NavigationContainer } from "@react-navigation/native";
import AddNewMatter from "./Page2/AddNewMatter";
import LoadingComponent from "../Components/LoadingComponent";
import { ThemeContext } from "../Components/ThemeProvider";
import AddNewShedule from "./Page2/AddNewSchedule";
import OpenAddNewSchedule from "./Page2/OpenAddNewSchedule";

type IProps = {
    navigation: any;
};
type IState = {};

const Tab = createMaterialTopTabNavigator();

export default class Page2 extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this._onChangeTab = this._onChangeTab.bind(this);
        this._setStatusMatterPage = this._setStatusMatterPage.bind(this);
        this._setStatusSchedulePage = this._setStatusSchedulePage.bind(this);
        this._openAddSchedule = this._openAddSchedule.bind(this);
        this._openAddNewMatter = this._openAddNewMatter.bind(this);
        this._goLoading = this._goLoading.bind(this);
        this._next = this._next.bind(this);
    }
    private tabOptions: MaterialTopTabNavigationOptions = {
        tabBarScrollEnabled: false,
        //tabBarStyle: { backgroundColor: Theme.colors.primary },
        tabBarIndicatorStyle: { backgroundColor: Theme.colors.accent, height: 4 }
    };
    static contextType = ThemeContext;
    // Ref's
    private refFabPage2 = createRef<FabPage2>();
    private refAddNewMatter = createRef<AddNewMatter>();
    private refLoading = createRef<LoadingComponent>();
    private refAddNewShedule = createRef<AddNewShedule>();
    private refOpenAddNewSchedule = createRef<OpenAddNewSchedule>();

    _setStatusMatterPage(status: boolean) {
        this.refFabPage2.current?.updateStatuses(2, status);
    }
    _setStatusSchedulePage(status: boolean) {
        this.refFabPage2.current?.updateStatuses(2, status);
    }
    _onChangeTab({ data: { state: { index } } }: any) {
        this.refFabPage2.current?.updateIndex(index);
    }
    _goLoading(visible: boolean, message?: string) {
        if (!visible) return this.refLoading.current?.close();
        this.refLoading.current?.open(message!);
    }

    // Fab Functions
    _openAddNewMatter() {
        this.refAddNewMatter.current?.open();
    }
    _openAddSchedule() {
        this.refOpenAddNewSchedule.current?.open();
    }

    // Functions
    _next(curse: string) {
        this.refAddNewShedule.current?.open(curse);
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<View style={{ flex: 1, position: 'relative' }}>
            <NavigationContainer independent theme={{ ...theme, colors: { ...theme.colors, text: '#FFFFFF' } }}>
                <PaperProvider theme={theme}>
                    <Appbar>
                        <Appbar.Action icon={'menu'} onPress={this.props.navigation.openDrawer} />
                        <Appbar.Content title={'Horarios'} />
                    </Appbar>
                    <View style={{ flex: 2 }}>
                        <Tab.Navigator initialRouteName={'Listas'} screenOptions={{ ...this.tabOptions, tabBarStyle: { backgroundColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.primary } }} screenListeners={{ state: this._onChangeTab }}>
                            <Tab.Screen name={'Listas'} children={()=><Page2Lists handlerLoad={this._setStatusSchedulePage} goLoading={this._goLoading} />} />
                            <Tab.Screen name={'Materias'} children={()=><Page2Matters handlerLoad={this._setStatusMatterPage} goLoading={this._goLoading} />} />
                        </Tab.Navigator>
                    </View>
                    <FabPage2
                        ref={this.refFabPage2}
                        addNewTimes={this._openAddSchedule}
                        addNewMatter={this._openAddNewMatter}
                    />
                </PaperProvider>
            </NavigationContainer>
            <AddNewMatter ref={this.refAddNewMatter} />
            <AddNewShedule ref={this.refAddNewShedule} goLoading={this._goLoading} />
            <OpenAddNewSchedule ref={this.refOpenAddNewSchedule} nextStep={this._next} />
            <LoadingComponent ref={this.refLoading} />
        </View>);
    }
}