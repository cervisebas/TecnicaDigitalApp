import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import ImageLazyLoadCard from "../Elements/ImageLazyLoadCard";
import Background from "../../Assets/Desings/card14.webp";
import { NativeSyntheticEvent, StyleSheet, TextLayoutEventData } from "react-native";

type IPropsCard = {
    scale: number;
    image: string;
    name: string;
    dni: string;
};
type IStateCard = {
    textTop: number;
};

export default class Card12 extends PureComponent<IPropsCard, IStateCard> {
    constructor(props: IPropsCard) {
        super(props);
        this.state = {
            textTop: 148
        };
        this._onTextLayout = this._onTextLayout.bind(this);
    }
    getScale(t: number) {
        return ((this.props.scale * t) / 1);
    }
    _onTextLayout({ nativeEvent: { lines } }: NativeSyntheticEvent<TextLayoutEventData>) {
        this.setState({
            textTop: (lines.length >= 2)? this.getScale(148): this.getScale(192)
        });
    }
    render(): React.ReactNode {
        return(<>
            <FastImage
                source={Background}
                style={styles.background}
                resizeMode={'cover'}
            />
            <ImageLazyLoadCard
                source={{ uri: this.props.image }}
                size={this.getScale(300)}
                style={{
                    position: 'absolute',
                    top: this.getScale(80),
                    left: this.getScale(60),
                    overflow: 'hidden',
                    borderRadius: this.getScale(16),
                }}
            />
            <Text
                style={{
                    position: 'absolute',
                    left: this.getScale(420),
                    top: this.state.textTop,
                    justifyContent: 'center',
                    color: '#FFE677',
                    fontWeight: '700',
                    textShadowColor: 'rgba(255, 230, 119, 0.5)',
                    textShadowOffset: {
                        width: this.getScale(2),
                        height: this.getScale(2)
                    },
                    textShadowRadius: this.getScale(3),
                    width: this.getScale(740),
                    fontSize: this.getScale(64)
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