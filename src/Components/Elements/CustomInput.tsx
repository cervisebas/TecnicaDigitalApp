import { Picker } from "@react-native-picker/picker";
import React, { PureComponent } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { TouchableRipple } from "react-native-paper";

type IProps = {
    style?: StyleProp<ViewStyle>;
    onChange: (value: string)=>any;
    value: string;
    title: string;
    disabled?: boolean;
    error?: boolean;
};
type IState2 = {
    colorsClick: string[];
    colorsClickError: string[];
    borderClick: string[];
    borderClickError: string[];
    indexColors: number;
    widthMax: number;
    widthText: number;
};
export class CustomPicker2 extends PureComponent<IProps, IState2> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            colorsClick: ['rgba(0, 0, 0, 0.5)', 'rgba(237, 112, 53, 1)'],
            colorsClickError: ['rgba(255, 0, 0, 0.5)', 'rgba(255, 64, 64, 1)'],
            borderClick: ['#000000', '#ED7035'],
            borderClickError: ['#FF0000', '#ED7035'],
            indexColors: 0,
            widthMax: 0,
            widthText: 0
        };
        this.onPress = this.onPress.bind(this);
        this.onPressIn = this.onPressIn.bind(this);
        this.onPressOut = this.onPressOut.bind(this);
    }
    private ref: Picker<string> | null = null;
    componentWillUnmount() {
        this.ref = null;
        this.setState({
            indexColors: 0,
            widthMax: 0,
            widthText: 0
        });
    }
    onPress() {
        if (!this.props.disabled) return this.ref?.focus();
        return undefined;
    }
    onPressIn() {
        if (!this.props.disabled) return this.setState({ indexColors: 1 });
        return undefined;
    }
    onPressOut() {
        if (!this.props.disabled) return this.setState({ indexColors: 0 });
        return undefined;
    }
    render(): React.ReactNode {
        return(<TouchableRipple
                disabled={this.props.disabled}
                onPress={this.onPress}
                onPressIn={this.onPressIn}
                onPressOut={this.onPressOut}
                style={[this.props.style, styles.touchable, { borderColor: (!this.props.disabled)? (this.props.error)? this.state.colorsClickError[this.state.indexColors]: this.state.colorsClick[this.state.indexColors]: 'rgba(0, 0, 0, 0.25)' }]}>
            <View onLayout={(layout)=>this.setState({ widthMax: layout.nativeEvent.layout.width })} style={styles.viewInto}>
                <Text onLayout={(layout)=>this.setState({ widthText: layout.nativeEvent.layout.width })} style={[styles.text, { color: (!this.props.disabled)? '#000000': 'rgba(0, 0, 0, 0.25)' }]}>{this.props.title}</Text>
                <Picker
                    ref={(ref)=>this.ref = ref}
                    style={{ width: (this.state.widthMax - this.state.widthText - 16), height: 52, color: (!this.props.disabled)? '#000000': 'rgba(0, 0, 0, 0.25)' }}
                    selectedValue={this.props.value}
                    enabled={!this.props.disabled}
                    onValueChange={this.props.onChange}
                    mode={'dropdown'}
                    dropdownIconColor={(!this.props.disabled)? (this.props.error)? this.state.borderClickError[this.state.indexColors]: this.state.borderClick[this.state.indexColors]: 'rgba(255, 255, 255, 0.30)'}
                    dropdownIconRippleColor={'rgba(0,0,0,0)'}>
                    {this.props.children}
                </Picker>
            </View>
        </TouchableRipple>);
    }
};

const styles = StyleSheet.create({
    touchable: {
        borderRadius: 4,
        borderWidth: 1.5,
        overflow: 'hidden'
    },
    viewInto: {
        flex: 3,
        flexDirection: 'row',
        alignItems: 'center'
    },
    text: {
        marginLeft: 8,
        marginRight: 12
    }
});