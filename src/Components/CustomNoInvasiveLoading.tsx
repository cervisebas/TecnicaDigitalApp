import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";
import { ProgressBar, Text } from "react-native-paper";
import CustomModal from "./CustomModal";
import { ThemeContext } from "./ThemeProvider";

type IProps = {};
type IState = {
    visible: boolean;
    text: string;
};

export default class CustomNoInvasiveLoading extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            text: 'Mensaje de progreso...'
        };
    }
    static contextType = ThemeContext;
    
    // Controller
    open(text: string) {
        this.setState({
            visible: true,
            text
        });
    }
    close() {
        this.setState({ visible: false });
    }
    update(text: string) {
        this.setState({ text });
    }
    isOpen() {
        return this.state.visible;
    }
    
    render(): React.ReactNode {
        const { theme } = this.context;
        return(<CustomModal
            visible={this.state.visible}
            //transparent={true}
            useBackdrop={false}
            fullScreeen={false}
            style={styles.content}
            animationIn={'fadeInUp'}
            animationInTiming={256}
            animationOut={'fadeInDown'}
            animationOutTiming={256}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <ProgressBar indeterminate={true} style={styles.progressBar} />
                <View style={styles.textContent}>
                    <Text numberOfLines={1} style={styles.text}>{this.state.text}</Text>
                </View>
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 76,
        padding: 8
    },
    card: {
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 4,
        backgroundColor: 'red',
        overflow: 'hidden'
    },
    progressBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%'
    },
    textContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20
    },
    text: {
        fontSize: 14
    }
});