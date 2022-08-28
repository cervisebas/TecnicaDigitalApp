import React, { PureComponent } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import ViewShot from "react-native-view-shot";
import Card1 from "./Cards/Card1";
import Card10 from "./Cards/Card10";
import Card11 from "./Cards/Card11";
import Card12 from "./Cards/Card12";
import Card13 from "./Cards/Card13";
import Card14 from "./Cards/Card14";
import Card15 from "./Cards/Card15";
import Card16 from "./Cards/Card16";
import Card17 from "./Cards/Card17";
import Card18 from "./Cards/Card18";
import Card19 from "./Cards/Card19";
import Card2 from "./Cards/Card2";
import Card20 from "./Cards/Card20";
import Card21 from "./Cards/Card21";
import Card3 from "./Cards/Card3";
import Card4 from "./Cards/Card4";
import Card5 from "./Cards/Card5";
import Card6 from "./Cards/Card6";
import Card7 from "./Cards/Card7";
import Card8 from "./Cards/Card8";
import Card9 from "./Cards/Card9";
import DesingDefault from "./Cards/Default";
import CardVip from "./Cards/Vip";

type IProps = {
    scale: number;
    image: string;
    name: string;
    dni: string;
    style?: StyleProp<ViewStyle>;
    refTarget?: (ref: ViewShot | null)=>any;
    refTarget2?: React.RefObject<ViewShot>;
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
            minwidth: this.getScale(1200),
            maxwidth: this.getScale(1200),
            height: (this.props.type == 5)? this.getScale(1558): this.getScale(779),
            maxheight: (this.props.type == 5)? this.getScale(1558): this.getScale(779),
            minheight: (this.props.type == 5)? this.getScale(1558): this.getScale(779)
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
            <Pressable onPress={(this.props.refTarget2)? this.props.onPress as any: this._onPress} android_ripple={(this.props.onPress)? { color: 'rgba(0, 0, 0, 0.5)', foreground: true }: undefined}>
                <ViewShot ref={(this.props.refTarget2)? this.props.refTarget2: this._ref} style={{ ...this.getSize(), overflow: 'hidden' }} options={{ width: 227, height: 142, format: 'png', quality: 1 }}>
                    {(this.props.type)?
                        (this.props.type == 1)? <Card1 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 2)? <Card2 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 3)? <Card3 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 4)? <Card4 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 5)? <CardVip scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 6)? <Card5 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 7)? <Card6 scale={this.props.scale} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 8)? <Card7 scale={this.props.scale} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 9)? <Card8 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 10)? <Card9 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 11)? <Card10 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 12)? <Card11 scale={this.props.scale} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 13)? <Card12 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 14)? <Card13 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 15)? <Card14 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 16)? <Card15 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 17)? <Card16 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 18)? <Card17 scale={this.props.scale} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 19)? <Card18 scale={this.props.scale} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 20)? <Card19 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 21)? <Card20 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        (this.props.type == 22)? <Card21 scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />:
                        <></>
                    : <DesingDefault scale={this.props.scale} image={this.props.image} name={this.props.name} dni={this.props.dni} />}
                </ViewShot>
            </Pressable>
        </View>);
    }
}