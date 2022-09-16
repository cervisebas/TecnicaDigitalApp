import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";
import CustomModal from "../../Components/CustomModal";
import Theme from "../../Themes";

type IProps = {};
type IState = {
    visible: boolean;
};

export default class AddNewShedule extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false
        };
    }
    close() {
        this.setState({ visible: false });
    }
    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            <View style={styles.content}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={'Añadir horario'} />
                </Appbar.Header>
                <View style={{ flex: 2 }}>
                    
                </View>
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.background
    }
});