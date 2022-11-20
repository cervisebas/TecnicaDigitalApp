import React, { createRef, memo, useEffect, useImperativeHandle, useState } from 'react';
import { View, ImageSourcePropType, StyleSheet, LayoutChangeEvent, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ActivityIndicator, Text } from 'react-native-paper';
import CustomModal from '../Components/CustomModal';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { ThemeContext } from '../Components/ThemeProvider';
import ScreenLoadingDirective, { ScreenLoadingDirectiveRef } from './ScreenLoadingDirective';
// Images
import logo from '../Assets/logo.webp';
import { waitTo } from '../Scripts/Utils';

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
type IRef = {
    open: (message?: string, hideLoadinginMessage?: boolean)=>void;
    close: ()=>void;
    updateMessage: (message: string, hideLoadinginMessage?: boolean)=>void;
    hideMessage: ()=>void;
    openAnimation: ()=>void;
    updateAnimation: ()=>void;
};

export type { IRef as ScreenLoadingRef };
export default memo(React.forwardRef(function ScreenLoading(props: IProps, ref: React.Ref<IRef>) {
    // State's
    const [visible, setVisible] = useState(true);
    const [showMessage, setShowMessage] = useState(false);
    const [hideLoadinginMessage, setHideLoadinginMessage] = useState(true);
    const [message, setMessage] = useState('');
    const [imageTop, setImageTop] = useState(0);
    const [imageLeft, setImageLeft] = useState(0);
    
    // Ref's
    const refScreenLoadingDirective = createRef<ScreenLoadingDirectiveRef>();

    // Context
    const { theme } = React.useContext(ThemeContext);

    // Animation
    const scaleImage = useSharedValue(1);
    const topImage = useSharedValue<undefined | number>(undefined);
    const leftImage = useSharedValue<undefined | number>(undefined);
    const animationImage = useAnimatedStyle(()=>({
        transform: [{ scale: withSpring(scaleImage.value) }],
        top: (topImage.value)? topImage.value: undefined,
        left: (leftImage.value)? leftImage.value: undefined
    }));

    // Position Image
    function setPositionImage() {
        const deviceSize = Dimensions.get('window');
        const top = (deviceSize.height / 2) - 150;
        const left = (deviceSize.width / 2) - 100;
        setImageTop(top);
        setImageLeft(left);
        topImage.value = top;
        leftImage.value = left;
    }

    // Layout Animation
    function _onLayout({ nativeEvent: { layout: { width, height } } }: LayoutChangeEvent) {
        refScreenLoadingDirective.current?.setSize(width, height);
    }

    // Ref Functions
    function open(message?: string, hideLoadinginMessage?: boolean) {
        if (message) {
            if (hideLoadinginMessage !== undefined) {
                setVisible(true);
                setShowMessage(false);
                setMessage(message);
                setHideLoadinginMessage(hideLoadinginMessage);
                return;
            }
            setVisible(true);
            setShowMessage(false);
            setMessage(message);
            return;
        }
        setVisible(true);
        setShowMessage(false);
        setMessage('');
    }
    function updateMessage(message: string, hideLoadinginMessage?: boolean) {
        if (hideLoadinginMessage !== undefined) {
            setShowMessage(true);
            setMessage(message);
            setHideLoadinginMessage(hideLoadinginMessage);
            return;
        }
        setShowMessage(true);
        setMessage(message);
    }
    function hideMessage() {
        setShowMessage(false);
        setHideLoadinginMessage(true);
        setMessage('');
    }
    function close() {
        setVisible(false);
        setHideLoadinginMessage(true);
        setShowMessage(false);
        setMessage('');
        refScreenLoadingDirective.current?.hide();
        setTimeout(()=>{
            scaleImage.value = 1;
            setPositionImage();
        }, 300);
    }
    async function openAnimation(): Promise<void> {
        topImage.value = withTiming(-61, { duration: 512 });
        leftImage.value = withTiming(-61, { duration: 512 });
        scaleImage.value = 0.21;
        await waitTo(400);
        refScreenLoadingDirective.current?.start();
    }
    function updateAnimation() {
        refScreenLoadingDirective.current?.updateAnimation();
    }
    useImperativeHandle(ref, ()=>({ open, updateMessage, hideMessage, close, openAnimation, updateAnimation }));

    useEffect(()=>{
        setPositionImage();
        //setTimeout(openAnimation, 6000);
    }, []);

    return(<CustomModal visible={visible} animationIn={'fadeIn'} animationOutTiming={600} animationOut={'fadeOut'}>
        <View style={[styles.background, { backgroundColor: theme.colors.background }]} onLayout={_onLayout}>
            <LinearGradient colors={['rgba(0, 0, 0, 0)', 'rgba(0, 163, 255, 1)']} style={styles.gradient}>
                <Animated.View style={[styles.viewLogo, { top: imageTop, left: imageLeft }, animationImage]}>
                    <Animated.Image
                        source={logo}
                        style={styles.logo}
                    />
                </Animated.View>
                <View style={styles.contentLoading}>
                    {(!showMessage || !hideLoadinginMessage)&&<ActivityIndicator size={'large'} animating={true} />}
                    {(showMessage)&&<Text
                        style={[styles.text, (!hideLoadinginMessage)&&{
                            fontSize: 14,
                            marginTop: 16
                        }]}>
                        {message}
                    </Text>}
                </View>
            </LinearGradient>
            <ScreenLoadingDirective ref={refScreenLoadingDirective} message={message} />
        </View>
    </CustomModal>);
}));

const styles = StyleSheet.create({
    background: {
        flex: 1
    },
    gradient: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 2
    },
    viewLogo: {
        position: 'absolute',
        width: 200,
        height: 200,
        overflow: 'visible',
        zIndex: 10
    },
    logo: {
        width: '100%',
        height: '100%',
        marginTop: -40
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