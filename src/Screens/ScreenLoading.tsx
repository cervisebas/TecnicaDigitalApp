import React, { Component } from 'react';
import { View, ImageBackground, ImageSourcePropType, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ActivityIndicator, Provider as PaperProvider, Text } from 'react-native-paper';
import CustomModal from '../Components/CustomModal';
import Theme from '../Themes';
// Images
import backgroundImage from "../Assets/background-loading.webp";
import logo from '../Assets/logo.webp';
import logoTroll from '../Assets/logo-troll.webp';
import logoAnim1 from '../Assets/logoanim1.gif';
import logoAnim2 from '../Assets/logoanim2.gif';

type IProps = {
    visible: boolean;
    showMessage: boolean | undefined;
    message: string | undefined;
};
type IState = {
    logo: ImageSourcePropType | undefined;
};

export default class ScreenLoading extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            logo: logo
        };
    }
    componentDidMount() {
        this.setLogo();
    }
    componentDidUpdate() {
        if (this.props.visible) {
            if (this.state.logo == undefined) this.setLogo();
        } else {
            if (this.state.logo !== undefined) this.setState({ logo: undefined });
        }
    }
    setLogo() {
        var probability: number = Math.floor(Math.random() * (1000 - 0)) + 0;
        const showLogo = ()=>{
            switch (probability) {
                case 500:
                    return logoTroll;
                case 100 || 200 || 300:
                    setTimeout(()=>this.setState({ logo: logo }), 8000);
                    return logoAnim1;
                case 400 || 500 || 600:
                    setTimeout(()=>this.setState({ logo: logo }), 5000);
                    return logoAnim2;
            }
            return logo;
        };
        this.setState({ logo: showLogo() });
    }
    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} animationIn={'fadeIn'} animationOutTiming={600} animationOut={'fadeOut'}>
            <PaperProvider theme={Theme}>
                <ImageBackground source={backgroundImage} style={styles.background}>
                    {(this.state.logo)&&<FastImage
                        source={this.state.logo as any}
                        style={styles.logo}
                    />}
                    <View style={styles.contentLoading}>
                        {(!this.props.showMessage)&&<ActivityIndicator size={'large'} animating={true} />}
                        {(this.props.showMessage)&&<Text style={styles.text}>{this.props.message}</Text>}
                    </View>
                </ImageBackground>
            </PaperProvider>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        width: 200,
        height: 200,
        marginTop: -180
    },
    contentLoading: {
        position: 'absolute',
        bottom: 0,
        marginBottom: 120,
        width: '100%',
        alignItems: 'center'
    },
    text: {
        fontSize: 18,
        width: '90%',
        textAlign: 'center'
    }
});