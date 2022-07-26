import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import ImageLazyLoadCard from "../Elements/ImageLazyLoadCard";

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
                source={require('../../Assets/Desings/card2.png')}
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                resizeMode={'cover'}
            />
            <ImageLazyLoadCard
                source={{ uri: this.props.image }}
                size={this.getScale(308)}
                circle
                style={{
                    position: 'absolute',
                    top: this.getScale(246),
                    left: this.getScale(140),
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
                width={this.getScale(526)}
                maxWidth={this.getScale(526)}
                height={this.getScale(130)}
                style={{
                    position: 'absolute',
                    top: this.getScale(432),
                    left: this.getScale(576)
                }}
            />
        </>);
    }
}