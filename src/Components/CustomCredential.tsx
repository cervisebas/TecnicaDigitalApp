import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import { Image, Pressable, StyleProp, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import ViewShot from "react-native-view-shot";
import Card1 from "./Cards/Card1";
import Card2 from "./Cards/Card2";
import Card3 from "./Cards/Card3";
import Card4 from "./Cards/Card4";
import Card5 from "./Cards/Card5";
import DesingDefault from "./Cards/Default";
import CardVip from "./Cards/Vip";

type IProps = {
    scale: number;
    image: string;
    name: string;
    dni: string;
    style?: StyleProp<ViewStyle>;
    refTarget?: (ref: ViewShot | null)=>any;
    type?: number;
    onPress?: (ref: ViewShot)=>any;
};
type IState = {
    refViewShow: ViewShot | null;
};

export default class CustomCredential extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this._ref = this._ref.bind(this);
        this._onPress = this._onPress.bind(this);
    }
    getScale(t: number) {
        return ((this.props.scale * t) / 1);
    }
    getSize() {
        return {
            width: this.getScale(1200),
            height: (this.props.type == 5)? this.getScale(1558): this.getScale(799)
        };
    }
    _ref(ref: ViewShot | null) {
        if (this.props.refTarget) this.props.refTarget(ref)
        this.setState({ refViewShow: ref });
    }
    _onPress() {
        if (this.props.onPress) this.props.onPress(this.state.refViewShow!);
    }
    render(): React.ReactNode {
        return(<View style={[this.props.style]}>
            <Pressable onPress={this._onPress} android_ripple={(this.props.onPress)? { color: 'rgba(0, 0, 0, 0.5)', foreground: true }: undefined}>
                <ViewShot ref={this._ref} style={{ ...this.getSize(), overflow: 'hidden' }} options={{ width: 227, height: 142, format: 'png', quality: 1 }}>
                    {(this.props.type)?
                        (this.props.type == 1)? <Card1 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 2)? <Card2 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 3)? <Card3 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 4)? <Card4 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 5)? <CardVip scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 6)? <Card5 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        <></>
                    : <DesingDefault scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />}
                </ViewShot>
            </Pressable>
        </View>);
    }
}