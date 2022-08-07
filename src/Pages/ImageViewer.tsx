import React, { PureComponent } from "react";
import ImageView from "react-native-image-viewing";

type IProps = {};
type IState = {
    visible: boolean;
    source: string;
};

export default class ImageViewer extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            source: 'https://tecnica-digital.ga/image/default-admin.png'
        };
        this.close = this.close.bind(this);
    }
    open(source: string) {
        this.setState({
            visible: true,
            source
        });
    }
    close() {
        this.setState({ visible: false });
    }
    render(): React.ReactNode {
        return(<ImageView
            images={[{ uri: this.state.source }]}
            imageIndex={0}
            visible={this.state.visible}
            swipeToCloseEnabled={true}
            doubleTapToZoomEnabled={true}
            onRequestClose={this.close}
        />);
    }
}