import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import { Image } from "react-native";
import { Text } from "react-native-paper";

type IPropsCard = {
    scale: number;
    image: string;
    name: string;
    dni: string;
};
type IStateCard = {
    textTop: number;
};

export default class Card5 extends PureComponent<IPropsCard, IStateCard> {
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
            <Image
                source={require('../../Assets/Desings/card5.png')}
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                resizeMode={'cover'}
                resizeMethod={'scale'}
            />
            <Image
                source={{ uri: this.props.image }}
                style={{
                    position: 'absolute',
                    top: this.getScale(80),
                    left: this.getScale(48),
                    overflow: 'hidden',
                    borderRadius: this.getScale(14),
                    width: this.getScale(308),
                    height: this.getScale(312)
                }}
            />
            <Text
                style={{
                    position: 'absolute',
                    left: this.getScale(420),
                    top: this.state.textTop,
                    justifyContent: 'center',
                    width: this.getScale(780),
                    fontSize: this.getScale(64),
                    color: '#FFFFFF',
                    fontWeight: '600',
                    textShadowColor: 'rgba(255, 255, 255, 0.40)',
                    textShadowOffset: { width: this.getScale(2.5), height: this.getScale(2.5) },
                    textShadowRadius: this.getScale(2)
                }}
                numberOfLines={2}
                onTextLayout={({ nativeEvent: { lines } })=>this.setState({ textTop: (lines.length >= 2)? this.getScale(148): this.getScale(192) })}
            >{this.props.name}</Text>
            <Barcode
                value={`eest${this.props.dni}`}
                width={this.getScale(1000)}
                maxWidth={this.getScale(1000)}
                height={this.getScale(247)}
                style={{
                    position: 'absolute',
                    top: this.getScale(495),
                    left: this.getScale(100)
                }}
            />
        </>);
    }
}