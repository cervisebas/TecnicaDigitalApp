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

export default class Card1 extends PureComponent<IPropsCard> {
    constructor(props: IPropsCard) {
        super(props);
    }
    getScale(t: number) {
        return ((this.props.scale * t) / 1);
    }
    render(): React.ReactNode {
        return(<>
            <Image
                source={require('../../Assets/Desings/card1.png')}
                style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                resizeMode={'cover'}
                resizeMethod={'scale'}
            />
            <Image
                source={{ uri: this.props.image }}
                style={{
                    position: 'absolute',
                    top: this.getScale(80),
                    left: this.getScale(60),
                    overflow: 'hidden',
                    borderWidth: this.getScale(8),
                    borderColor: '#FF2E2E',
                    borderRadius: this.getScale(16),
                    width: this.getScale(300),
                    height: this.getScale(300)
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
                    color: '#FFFFFF'
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
                    top: this.getScale(495),
                    left: this.getScale(100)
                }}
            />
        </>);
    }
}