import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";
import ImageView from "react-native-image-viewing";
import { Text } from "react-native-paper";

type IProps = {};
type IState = {
    visible: boolean;
    source: string;
    text: string;
};

export default class ImageViewerText extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            source: 'https://tecnica-digital.ga/image/default-admin.png',
            text: ''
        };
        this.close = this.close.bind(this);
        this._FooterComponent = this._FooterComponent.bind(this);
    }
    open(source: string, text: string) {
        this.setState({
            visible: true,
            source,
            text
        });
    }
    close() {
        this.setState({ visible: false });
    }
    _FooterComponent() {
        return(<View style={styles.view}>
            <Text style={styles.text}>{this.state.text}</Text>
        </View>);
    }
    render(): React.ReactNode {
        return(<ImageView
            images={[{ uri: this.state.source }]}
            imageIndex={0}
            visible={this.state.visible}
            swipeToCloseEnabled={true}
            doubleTapToZoomEnabled={true}
            onRequestClose={this.close}
            FooterComponent={this._FooterComponent}
        />);
    }
}
const styles = StyleSheet.create({
    view: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 50
    },
    text: {
        color: '#FFFFFF'
    }
});