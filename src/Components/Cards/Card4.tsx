import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import ImageLazyLoadCard from "../Elements/ImageLazyLoadCard";
import Background from "../../Assets/Desings/card4.png";
import { StyleSheet } from "react-native";

type IPropsCard = {
    scale: number;
    image: string;
    name: string;
    dni: string;
};

export default class Card3 extends PureComponent<IPropsCard> {
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
            <ImageLazyLoadCard
                source={{ uri: this.props.image }}
                size={this.getScale(300)}
                style={{
                    position: 'absolute',
                    top: this.getScale(80),
                    left: this.getScale(60),
                    overflow: 'hidden',
                    borderWidth: this.getScale(8),
                    borderColor: '#FF2E2E',
                    borderRadius: this.getScale(16)
                }}
            />
            <Text
                style={{
                    position: 'absolute',
                    left: this.getScale(420),
                    top: this.getScale(122),
                    justifyContent: 'center',
                    width: this.getScale(780),
                    fontSize: this.getScale(64),
                    color: '#000000'
                }}
                numberOfLines={1}
            >{this.props.name}</Text>
            <Barcode
                value={`eest${this.props.dni}`}
                width={this.getScale(1000)}
                maxWidth={this.getScale(1000)}
                height={this.getScale(245)}
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