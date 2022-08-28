import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import ImageLazyLoadCard from "../Elements/ImageLazyLoadCard";
import Background from "../../Assets/Desings/card2.png";
import { StyleSheet } from "react-native";

type IPropsCard = {
    scale: number;
    image: string;
    name: string;
    dni: string;
};
type IStateCard = {
    textTop: number;
};

export default class Card2 extends PureComponent<IPropsCard, IStateCard> {
    constructor(props: IPropsCard) {
        super(props);
        this.state = {
            textTop: 0
        };
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
            <ImageLazyLoadCard
                source={{ uri: this.props.image }}
                size={this.getScale(316)}
                circle
                style={{
                    position: 'absolute',
                    top: this.getScale(232),
                    left: this.getScale(143),
                    overflow: 'hidden',
                    borderWidth: this.getScale(8),
                    borderColor: '#00A3FF'
                }}
            />
            <Text
                style={{
                    position: 'absolute',
                    left: this.getScale(565),
                    top: this.state.textTop,
                    justifyContent: 'center',
                    width: this.getScale(536),
                    textAlign: 'center',
                    fontSize: this.getScale(48),
                    color: '#000000'
                }}
                numberOfLines={2}
                onTextLayout={({ nativeEvent: { lines } })=>this.setState({ textTop: (lines.length >= 2)? this.getScale(237): this.getScale(270) })}
            >{this.props.name}</Text>
            <Barcode
                value={`eest${this.props.dni}`}
                width={this.getScale(526.32)}
                maxWidth={this.getScale(526.32)}
                height={this.getScale(130)}
                style={{
                    position: 'absolute',
                    top: this.getScale(420),
                    left: this.getScale(570)
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