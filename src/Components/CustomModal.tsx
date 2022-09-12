import React, { Component } from "react";
import { Dimensions, StyleProp, StyleSheet, ViewStyle } from "react-native";
import Modal from "react-native-modal";
import ExtraDimensions from "react-native-extra-dimensions-android";

type ExtractProps<TComponentOrTProps> = TComponentOrTProps extends React.Component<infer TProps, any> ? TProps : TComponentOrTProps;
type IProps = {
    visible: boolean;
    onShow?: ()=>any;
    onClose?: ()=>any;
    animationIn?: ExtractProps<Modal>['animationIn'];
    animationOut?: ExtractProps<Modal>['animationOut'];
    onRequestClose?: ()=>any;
    animationInTiming?: number;
    animationOutTiming?: number;
    transparent?: boolean;
    style?: StyleProp<ViewStyle>;
};
type IState = {};

const width = Dimensions.get('window').width;
const height = ExtraDimensions.get('REAL_WINDOW_HEIGHT');

export default class CustomModal extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.onShow = this.onShow.bind(this);
        this.onRequestClose = this.onRequestClose.bind(this);
        this.onClose = this.onClose.bind(this);
    }
    private _isMount: boolean = false;
    componentDidMount(): void {
        this._isMount = true;
    }
    componentWillUnmount(): void {
        this._isMount = false;
    }
    onShow() {
        if (this.props.onShow && this._isMount) this.props.onShow();
    }
    onRequestClose() {
        if (this.props.onRequestClose && this._isMount) this.props.onRequestClose();
    }
    onClose() {
        if (this.props.onClose && this._isMount) this.props.onClose();
    }
    render(): React.ReactNode {
        return(<Modal
            isVisible={this.props.visible}
            animationIn={(this.props.animationIn)? this.props.animationIn: 'fadeInUp'}
            animationInTiming={(!this.props.animationInTiming)? 250: this.props.animationInTiming}
            animationOut={(this.props.animationOut)? this.props.animationOut: 'fadeOutDown'}
            animationOutTiming={(!this.props.animationOutTiming)? 250: this.props.animationOutTiming}
            backdropOpacity={(this.props.transparent)? 0: undefined}
            onBackButtonPress={this.onRequestClose}
            onBackdropPress={this.onRequestClose}
            onModalWillShow={this.onShow}
            onModalHide={this.onClose}
            useNativeDriver={true}
            useNativeDriverForBackdrop={true}
            deviceWidth={width}
            deviceHeight={height}
            style={[this.props.style, styles.modal]}>
            {this.props.children}
        </Modal>);
    }
}

const styles = StyleSheet.create({
    modal: {
        margin: 0
    }
});