import React, { Component } from "react";
import { View } from "react-native";
import { Appbar, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomCard2 from "../Components/Elements/CustomCard2";
import Theme from "../Themes";

type IProps = {
    navigation: any;
};
type IState = {};

export default class Page2 extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar>
                    <Appbar.Action icon="menu" onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Horarios'}  />
                </Appbar>
                <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                    {/*<CustomCard2 title={'Curso 3°2'} />
                    <CustomCard2 title={'Curso 3°2'} />
                    <CustomCard2 title={'Curso 3°2'} />*/}
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <Icon name={'office-building-cog-outline'} size={74} />
                        <Text style={{ marginTop: 24, fontSize: 18 }}>Trabajo en proceso...</Text>
                    </View>
                </View>
            </PaperProvider>
        </View>);
    }
}