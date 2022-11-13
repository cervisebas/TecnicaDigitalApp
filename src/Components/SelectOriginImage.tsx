import Color from "color";
import React, { PureComponent } from "react";
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Appbar, overlay, Text, TouchableRipple } from "react-native-paper";
import CustomModal from "./CustomModal";
import { ThemeContext } from "./ThemeProvider";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type IProps = {
    onAction: (action: number)=>any;
};
type IState = {
    visible: boolean;
};

export default class SelectOriginImage extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false
        };
        this.close = this.close.bind(this);
    }
    static contextType = ThemeContext;

    private onAction(action: number) {
        this.close();
        this.props.onAction(action);
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close} animationIn={'zoomIn'} animationOut={'zoomOut'}>
            <View style={[styles.content, { backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background }]}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={'Elije una opción'} />
                </Appbar.Header>
                <View>
                    <View style={{ flexDirection: 'row' }}>
                        <ComponentCard icon={'camera-outline'} text={'Usar cámara'} onPress={()=>this.onAction(0)} style={{ paddingRight: 4 }} />
                        <ComponentCard icon={'image-multiple-outline'} text={'Usar galería'} onPress={()=>this.onAction(1)} style={{ paddingLeft: 4 }} />
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <ComponentCard icon={'delete-outline'} text={'Quitar imagen'} onPress={()=>this.onAction(2)} style={{ paddingRight: 4, paddingTop: 0 }} />
                        <ComponentCard icon={'cancel'} text={'Cancelar'} onPress={this.close} style={{ paddingLeft: 4, paddingTop: 0 }} />
                    </View>
                </View>
            </View>
        </CustomModal>);
    }
}

type IProps2 = {
    style?: StyleProp<ViewStyle>;
    onPress?: ()=>any;
    icon: string;
    text: string;
};
type IState2 = {
    height: number;
};

class ComponentCard extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            height: 0
        };
        this._onLayout = this._onLayout.bind(this);
    }
    static contextType = ThemeContext;
    _onLayout({ nativeEvent: { layout: { width } } }: LayoutChangeEvent) {
        this.setState({ height: width });
    }
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<View style={[styles.cardContent, { height: this.state.height }, this.props.style]} onLayout={this._onLayout}>
            <TouchableRipple style={[styles.card, { backgroundColor: Color(theme.colors.primary).alpha((isDark)? 0.5: 0.8).rgb().string() }]} onPress={this.props.onPress}>
                <>
                    <Icon name={this.props.icon} color={'#FFFFFF'} size={48} />
                    <Text style={{ marginTop: 8, color: '#FFFFFF' }}>{this.props.text}</Text>
                </>
            </TouchableRipple>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        marginLeft: '10%',
        marginRight: '10%',
        borderRadius: 12,
        overflow: 'hidden'
    },
    cardContent: {
        flex: 3,
        padding: 8
    },
    card: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }
});