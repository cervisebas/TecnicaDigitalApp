import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from "@react-navigation/material-top-tabs";
import { EventArg } from "@react-navigation/core";
import React, { Component, createRef } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, FAB, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomCard2 from "../Components/Elements/CustomCard2";
import Theme from "../Themes";
import FabPage2 from "./Page2/FabPage2";
import Page2Matters from "./Page2/Matters";
import Page2Lists from "./Page2/Lists";
import { NavigationContainer } from "@react-navigation/native";

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
    }
    private tabOptions: MaterialTopTabNavigationOptions = {
        tabBarScrollEnabled: false,
        tabBarStyle: { backgroundColor: Theme.colors.primary },
        tabBarIndicatorStyle: { backgroundColor: Theme.colors.accent, height: 4 }
    };
    private pageStatusMatters: boolean = false;
    // Ref's
    private refFabPage2 = createRef<FabPage2>();

    _setStatusMatterPage(status: boolean) {
        this.pageStatusMatters = status;
        this.refFabPage2.current?.updateStatuses(2, status);
    }

    _onChangeTab({ data: { state: { index } } }: any) {
        this.refFabPage2.current?.updateIndex(index);
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 1, position: 'relative' }}>
            <NavigationContainer independent theme={{ ...Theme, colors: { ...Theme.colors, text: '#FFFFFF' } }}>
                <PaperProvider theme={Theme}>
                    <Appbar>
                        <Appbar.Action icon={'menu'} onPress={this.props.navigation.openDrawer} />
                        <Appbar.Content title={'Horarios'}  />
                    </Appbar>
                    <View style={{ flex: 2 }}>
                        <Tab.Navigator initialRouteName={'Listas'} screenOptions={this.tabOptions} screenListeners={{ state: this._onChangeTab }}>
                            <Tab.Screen name={'Listas'} children={()=><Page2Lists />} />
                            <Tab.Screen name={'Materias'} children={()=><Page2Matters handlerLoad={this._setStatusMatterPage} />} />
                        </Tab.Navigator>
                    </View>
                    <FabPage2 ref={this.refFabPage2} />
                </PaperProvider>
            </NavigationContainer>
        </View>);
    }
}