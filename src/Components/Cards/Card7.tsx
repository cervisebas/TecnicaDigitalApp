import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import Background from "../../Assets/Desings/card9.webp";
import { NativeSyntheticEvent, StyleSheet, TextLayoutEventData } from "react-native";

type IPropsCard = {
    scale: number;
    name: string;
    dni: string;
};
type IStateCard = {
    textTop: number;
};

export default class Card7 extends PureComponent<IPropsCard, IStateCard> {
    constructor(props: IPropsCard) {
        super(props);
        this.state = {
            textTop: 281
        };
        this._onTextLayout = this._onTextLayout.bind(this);
    }
    getScale(t: number) {
        return ((this.props.scale * t) / 1);
    }
    _onTextLayout({ nativeEvent: { lines } }: NativeSyntheticEvent<TextLayoutEventData>) {
        this.setState({
            textTop: (lines.length >= 2)? this.getScale(213): this.getScale(281)
        });
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
                    left: this.getScale(486),
                    top: this.state.textTop,
                    justifyContent: 'center',
                    width: this.getScale(647),
                    color: '#FFFFFF',
                    textAlign: 'center',
                    fontWeight: 'normal',
                    textShadowColor: 'rgba(0, 0, 0, 1)',
                    textShadowOffset: {
                        width: this.getScale(3),
                        height: this.getScale(3)
                    },
                    textShadowRadius: this.getScale(4),
                    fontSize: this.getScale(64)
                }}
                numberOfLines={2}
                onTextLayout={this._onTextLayout}
            >{this.props.name}</Text>
            <Barcode
                value={`eest${this.props.dni}`}
                width={this.getScale(607.84)}
                maxWidth={this.getScale(607.84)}
                height={this.getScale(151.14)}
                style={{
                    position: 'absolute',
                    top: this.getScale(523),
                    left: this.getScale(506)
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