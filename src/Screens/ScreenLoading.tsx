import React, { Component } from 'react';
import { View, Image, ImageBackground, ImageSourcePropType } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ActivityIndicator, Provider as PaperProvider, Text } from 'react-native-paper';
import CustomModal from '../Components/CustomModal';
import Theme from '../Themes';

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
            logo: undefined
        };
    }
    componentDidMount() {
        var probability: number = Math.floor(Math.random() * (1000 - 0)) + 0;
        this.setState({ logo: (probability == 500)? require('../Assets/logo-troll.webp'): require('../Assets/logo.webp') });
    }
    componentWillUnmount() {
        this.setState({ logo: undefined });
    }
    componentDidUpdate() {
        if (this.props.visible) {
            if (this.state.logo == undefined) {
                var probability: number = Math.floor(Math.random() * (1000 - 0)) + 0;
                this.setState({ logo: (probability == 500)? require('../Assets/logo-troll.webp'): require('../Assets/logo.webp') });
            }
        } else {
            if (this.state.logo !== undefined) this.setState({ logo: undefined });
        }
    }
    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} animationIn={'fadeIn'} animationOutTiming={600} animationOut={'fadeOut'}>
            <PaperProvider theme={Theme}>
                <ImageBackground source={require('../Assets/background-loading.webp')} style={{ flex: 1, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
                    {(this.state.logo)&&<FastImage
                        source={this.state.logo as any}
                        style={{
                            width: 200,
                            height: 200,
                            marginTop: -180
                        }}
                    />}
                    <View style={{ position: 'absolute', bottom: 0, marginBottom: 120, width: '100%', alignItems: 'center' }}>
                        {(!this.props.showMessage)&&<ActivityIndicator size={'large'} animating={true} />}
                        {(this.props.showMessage)&&<Text style={{ fontSize: 18, width: '90%', textAlign: 'center' }}>{this.props.message}</Text>}
                    </View>
                </ImageBackground>
            </PaperProvider>
        </CustomModal>);
    }
}