import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import ImageLazyLoadCard from "../Elements/ImageLazyLoadCard";
import Background from "../../Assets/Desings/card24.webp";
import { NativeSyntheticEvent, StyleSheet, TextLayoutEventData } from "react-native";

type IPropsCard = {
    scale: number;
    image: string;
    name: string;
    dni: string;
};
type IStateCard = {};

export default class Card22 extends PureComponent<IPropsCard, IStateCard> {
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
                size={this.getScale(280)}
                style={{
                    position: 'absolute',
                    top: this.getScale(141),
                    left: this.getScale(402),
                    overflow: 'hidden',
                    transform: [{ rotate: '-90deg' }],
                    borderWidth: this.getScale(8),
                    borderColor: '#513973'
                }}
            />
            <Text
                style={{
                    position: 'absolute',
                    left: this.getScale(616),
                    top: this.getScale(208),
                    justifyContent: 'center',
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    color: '#513973',
                    fontWeight: '700',
                    width: this.getScale(280),
                    height: this.getScale(150),
                    fontSize: this.getScale(40),
                    transform: [{ rotate: '-90deg' }]
                }}
                numberOfLines={2}
            >{this.props.name}</Text>
            <Barcode
                value={`eest${this.props.dni}`}
                width={this.getScale(607.29)}
                maxWidth={this.getScale(607.29)}
                height={this.getScale(150)}
                style={{
                    position: 'absolute',
                    top: this.getScale(303.645),
                    left: this.getScale(772),
                    transform: [{ rotate: '-90deg' }]
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