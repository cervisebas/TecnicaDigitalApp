import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import Background from "../../Assets/Desings/card13.png";
import { NativeSyntheticEvent, StyleSheet, TextLayoutEventData } from "react-native";

type IPropsCard = {
    scale: number;
    name: string;
    dni: string;
};
type IStateCard = {
    textTop: number;
};

export default class Card11 extends PureComponent<IPropsCard, IStateCard> {
    constructor(props: IPropsCard) {
        super(props);
        this.state = {
            textTop: 257
        };
        this._onTextLayout = this._onTextLayout.bind(this);
    }
    getScale(t: number) {
        return ((this.props.scale * t) / 1);
    }
    _onTextLayout({ nativeEvent: { lines } }: NativeSyntheticEvent<TextLayoutEventData>) {
        this.setState({
            textTop: (lines.length >= 2)? this.getScale(199): this.getScale(257)
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
                    left: this.getScale(80),
                    top: this.state.textTop,
                    justifyContent: 'center',
                    width: this.getScale(549),
                    textAlign: 'center',
                    fontWeight: '700',
                    textShadowColor: 'rgba(0, 0, 0, 0.35)',
                    textShadowOffset: {
                        width: this.getScale(2),
                        height: this.getScale(2)
                    },
                    textShadowRadius: this.getScale(4),
                    fontSize: this.getScale(58)
                }}
                numberOfLines={2}
                onTextLayout={this._onTextLayout}
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