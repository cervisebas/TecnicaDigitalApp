import React, { PureComponent } from "react";
import CustomModal from "../../Components/CustomModal";
import { ThemeContext } from "../../Components/ThemeProvider";
import { View } from "react-native";
import { Appbar, overlay } from "react-native-paper";
import { OldDataFile, OldData as OldDataType } from "../../Scripts/ApiTecnica/types";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { tabOptions } from "../../Scripts/Utils";
import ListActualData from "./ListActualData";

type IProps = {
    controllerLoading: (visible: boolean, message?: string)=>void;
};
type IState = {
    visible: boolean;
    data: OldDataType | undefined;
};

const Tab = createMaterialTopTabNavigator();

export default class ViewActualData extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            data: undefined
        };
        this.close = this.close.bind(this);
        this._renderTab = this._renderTab.bind(this);
    }
    static contextType = ThemeContext;

    open(data: OldDataType) {
        this.setState({ visible: true, data });
    }
    close() {
        this.setState({ visible: false });
    }

    _renderTab(value: { curse: string; files: OldDataFile[]; }, _index: number) {
        return(<Tab.Screen
            key={`list-actual-${value.curse}`}
            name={value.curse}
            children={()=><ListActualData {...value} controllerLoading={this.props.controllerLoading} />}
        />);
    }

    render(): React.ReactNode {
        const { theme, isDark } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            {(this.state.data)? <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={`Registros ${this.state.data.age}`} />
                </Appbar.Header>
                <View style={{ flex: 1 }}>
                    <Tab.Navigator screenOptions={{ ...tabOptions, tabBarStyle: { backgroundColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.primary } }}>
                        {this.state.data.data.map(this._renderTab)}
                    </Tab.Navigator>
                </View>
            </View>: <></>}
        </CustomModal>);
    }
}

