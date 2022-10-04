import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import Background from "../../Assets/Desings/card8.webp";
import { NativeSyntheticEvent, StyleSheet, TextLayoutEventData } from "react-native";

type IPropsCard = {
    scale: number;
    name: string;
    dni: string;
};
type IStateCard = {
    textTop: number;
};

export default class Card6 extends PureComponent<IPropsCard, IStateCard> {
    constructor(props: IPropsCard) {
        super(props);
        this.state = {
            textTop: 229
        };
        this._onTextLayout = this._onTextLayout.bind(this);
    }
    getScale(t: number) {
        return ((this.props.scale * t) / 1);
    }
    _onTextLayout({ nativeEvent: { lines } }: NativeSyntheticEvent<TextLayoutEventData>) {
        this.setState({
            textTop: (lines.length >= 2)? this.getScale(177): this.getScale(229)
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
                    left: this.getScale(54),
                    top: this.state.textTop,
                    justifyContent: 'center',
                    width: this.getScale(700),
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: this.getScale(48),
                    color: '#000000'
                }}
                numberOfLines={2}
                onTextLayout={this._onTextLayout}
            >{this.props.name}</Text>
            <Barcode
                value={`eest${this.props.dni}`}
                width={this.getScale(686.27)}
                maxWidth={this.getScale(686.27)}
                height={this.getScale(169.51)}
                style={{
                    position: 'absolute',
                    top: this.getScale(400),
                    left: this.getScale(61)
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