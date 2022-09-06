import React, { Component } from 'react';
import { View, ImageSourcePropType, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ActivityIndicator, Provider as PaperProvider, Text } from 'react-native-paper';
import CustomModal from '../Components/CustomModal';
import Theme from '../Themes';
// Images
import logo from '../Assets/logo.webp';
import logoTroll from '../Assets/logo-troll.webp';
import logoAnim1 from '../Assets/logoanim1.gif';
import logoAnim2 from '../Assets/logoanim2.gif';
import LinearGradient from 'react-native-linear-gradient';

type IProps = {
    setTimeout?: (time: number)=>any;
};
type IState = {
    visible: boolean;
    showMessage: boolean;
    hideLoadinginMessage: boolean;
    message: string;
    
    logo: ImageSourcePropType | undefined;
};

export default class ScreenLoading extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: true,
            showMessage: false,
            hideLoadinginMessage: true,
            message: '',
            logo: logo
        };
    }
    componentDidMount() {
        this.setLogo();
    }
    componentDidUpdate() {
        if (this.state.visible) {
            if (this.state.logo == undefined) this.setLogo();
        } else {
            if (this.state.logo !== undefined) this.setState({ logo: undefined });
        }
    }
    setLogo() {
        var probability: number = Math.floor(Math.random() * (1000 - 0)) + 0;
        const showLogo = ()=>{
            switch (probability) {
                case 666:
                    return logoTroll;
                case 100 || 200 || 300:
                    (this.props.setTimeout)&&this.props.setTimeout(4000);
                    setTimeout(()=>this.setState({ logo: logo }), 3000);
                    return logoAnim1;
                case 400 || 500 || 600:
                    (this.props.setTimeout)&&this.props.setTimeout(6000);
                    setTimeout(()=>this.setState({ logo: logo }), 5000);
                    return logoAnim2;
            }
            return logo;
        };
        this.setState({ logo: showLogo() });
    }

    // Controller
    open(message?: string, hideLoadinginMessage?: boolean) {
        if (message) {
            if (hideLoadinginMessage !== undefined) {
                return this.setState({
                    visible: true,
                    showMessage: false,
                    message,
                    hideLoadinginMessage
                });
            }
            return this.setState({
                visible: true,
                showMessage: false,
                message
            });
        }
        this.setState({
            visible: true,
            showMessage: false,
            message: ''
        });
    }
    updateMessage(message: string, hideLoadinginMessage?: boolean) {
        if (hideLoadinginMessage !== undefined) return this.setState({
            showMessage: true,
            message,
            hideLoadinginMessage
        });
        this.setState({
            showMessage: true,
            message
        });
    }
    hideMessage() {
        this.setState({
            showMessage: false,
            hideLoadinginMessage: true,
            message: ''
        });
    }
    close() {
        this.setState({
            visible: false,
            hideLoadinginMessage: true,
            showMessage: false,
            message: ''
        });
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} animationIn={'fadeIn'} animationOutTiming={600} animationOut={'fadeOut'}>
            <PaperProvider theme={Theme}>
                <View style={styles.background}>
                    <LinearGradient colors={['rgba(0, 0, 0, 0)', 'rgba(0, 163, 255, 1)']} style={styles.gradient}>
                        {(this.state.logo)&&<FastImage
                            source={this.state.logo as any}
                            style={styles.logo}
                        />}
                        <View style={styles.contentLoading}>
                            {(!this.state.showMessage || !this.state.hideLoadinginMessage)&&<ActivityIndicator size={'large'} animating={true} />}
                            {(this.state.showMessage)&&<Text
                                style={[styles.text, (!this.state.hideLoadinginMessage)&&{
                                    fontSize: 14,
                                    marginTop: 16
                                }]}>
                                {this.state.message}
                            </Text>}
                        </View>
                    </LinearGradient>
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: Theme.colors.background
    },
    gradient: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 2
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