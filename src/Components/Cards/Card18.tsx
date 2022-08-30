import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import Background from "../../Assets/Desings/card20.webp";
import { StyleSheet } from "react-native";

type IPropsCard = {
    scale: number;
    name: string;
    dni: string;
};
type IStateCard = {};

export default class Card18 extends PureComponent<IPropsCard, IStateCard> {
    constructor(props: IPropsCard) {
        super(props);
    }
    getScale(t: number) {
        return ((this.props.scale * t) / 1);
    }
    render(): React.ReactNode {
        return(<>
            <FastImage
                source={Background}
                style={styles.background}
                resizeMode={'cover'}
            />
            <Text
                style={{
                    position: 'absolute',
                    left: this.getScale(36),
                    top: this.getScale(32),
                    justifyContent: 'center',
                    color: '#000000',
                    fontWeight: '700',
                    width: this.getScale(492),
                    fontSize: this.getScale(44)
                }}
                numberOfLines={1}
            >{this.props.name}</Text>
            <Barcode
                value={`eest${this.props.dni}`}
                width={this.getScale(1000)}
                maxWidth={this.getScale(1000)}
                height={this.getScale(247)}
                style={{
                    position: 'absolute',
                    top: this.getScale(481),
                    left: this.getScale(100)
                }}
            />
        </>);
    }
}

const styles = StyleSheet.create({
    background: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
    }
});