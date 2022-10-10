import React, { createRef, PureComponent } from "react";
import { StyleSheet, View } from "react-native";
import Swiper from "react-native-swiper";
import CustomModal from "../../Components/CustomModal";
import { ThemeContext } from "../../Components/ThemeProvider";
import View1 from "./Tutorial/View1";
import View2 from "./Tutorial/View2";
import View3 from "./Tutorial/View3";
import View4 from "./Tutorial/View4";
import View5 from "./Tutorial/View5";

type IProps = {
    onClose?: ()=>any;
};
type IState = {
    visible: boolean;
};

export default class ScreenTutorial extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: true
        };
        this._nextPage = this._nextPage.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this._restart = this._restart.bind(this);
    }
    private refSwiper = createRef<Swiper>();
    static contextType = ThemeContext;
    _nextPage() {
        this.refSwiper.current?.scrollBy(1, true);
    }
    _restart() {
        this.refSwiper.current?.scrollBy(-4, true);
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        const { theme } = this.context;
        return(<CustomModal visible={this.state.visible} onClose={this.props.onClose} animationIn={'fadeIn'} animationOut={'fadeOut'}>
            <View style={[styles.contain, { backgroundColor: theme.colors.background }]}>
                <Swiper
                    ref={this.refSwiper}
                    showsButtons={false}
                    scrollEnabled={false}
                    loop={false}
                    dotStyle={styles.hideDots}
                    activeDotStyle={styles.hideDots}>
                    <View1 nextButton={this._nextPage} />
                    <View2 nextButton={this._nextPage} />
                    <View3 nextButton={this._nextPage} />
                    <View4 nextButton={this._nextPage} />
                    <View5 nextButton={this.close} restart={this._restart} />
                </Swiper>
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    contain: {
        flex: 1
    },
    slides: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    hideDots: {
        display: 'none'
    }
});