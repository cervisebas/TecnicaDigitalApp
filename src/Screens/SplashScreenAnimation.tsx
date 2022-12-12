import React, { createRef, useContext, useImperativeHandle, useRef, useState } from "react";
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import CustomModal from "../Components/CustomModal";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import SplashScreen from "react-native-splash-screen";
import { ThemeContext } from "../Components/ThemeProvider";
// Images
import SplashLogo from "../Assets/splash_logo.webp";
import SplashLogoDark from "../Assets/splash_logo_dark.webp";
import TextAnimationShake from "../Components/TextAnimationShake";
import { waitTo } from "../Scripts/Utils";

type IProps = {
    onFinish?: ()=>any;
};

function SplashScreenAnimation(props: IProps, ref: React.Ref<{ open: ()=>any; close: ()=>any; }>) {
    const [visible, setVisible] = useState(true);
    useImperativeHandle(ref, ()=>({ open: ()=>setVisible(true), close: ()=>setVisible(false) }));
    const refTextAnimationShake = createRef<TextAnimationShake>();
    const translateY = useSharedValue(0);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const opacity2 = useSharedValue(0);
    const sizeSecondBackground  = useSharedValue('0%');
    const borderSecondBackground  = useSharedValue(1536);

    const animatedImageStyles = useAnimatedStyle(()=>({ transform: [{ translateY: withSpring(translateY.value) }] }));
    const animatedTextStyles = useAnimatedStyle(()=>({ transform: [{ scale: withTiming(scale.value, { duration: 250 }) }], opacity: withTiming(opacity.value, { duration: 250 }) }));

    const animatedText2Styles = useAnimatedStyle(()=>({ opacity: withTiming(opacity2.value, { duration: 250 }) }));
    const animatedSecondBackground = useAnimatedStyle(()=>({
        width: withTiming(sizeSecondBackground.value, { duration: 512 }),
        height: withTiming(sizeSecondBackground.value, { duration: 512 }),
        borderRadius: withTiming(borderSecondBackground.value, { duration: 720 })
    }));
    const _goAnimation = async()=>{
        await waitTo(1000);
        SplashScreen.hide();
        translateY.value = -50;
        await waitTo(500);
        translateY.value = Dimensions.get('window').height;
        await waitTo(200);
        opacity.value = 1;
        scale.value = 1;
        await waitTo(1500);
        opacity.value = 0;
        opacity2.value = 1;
        sizeSecondBackground.value = '100%';
        borderSecondBackground.value = 0;
        await waitTo(150);
        refTextAnimationShake.current?.start();
        await waitTo(1500);
        (props.onFinish)&&props.onFinish();
        setVisible(false);
    };
    const context = useContext(ThemeContext);
    const styleContent: StyleProp<ViewStyle> = { backgroundColor: (context.isDark)? "#000000": "#FFFFFF" };
    return(<CustomModal visible={visible} removeAnimationIn={true} animationOut={'fadeOut'} animationOutTiming={750}>
        <View style={[styles.content, styleContent]}>
            <Animated.View style={[styles.secondBackground, { backgroundColor: (context.isDark)? '#c41c00': '#ff5722' }, animatedSecondBackground]} />
            <Animated.Text style={[styles.textBrand, animatedTextStyles]}>SCAPPS</Animated.Text>
            <TextAnimationShake
                ref={refTextAnimationShake}
                value={'</> SCDEV'}
                style={[styles.textBrand, animatedText2Styles]}
                styleText={[styles.textBrand2]}
            />
            <Animated.Image
                source={(context.isDark)? SplashLogoDark: SplashLogo}
                onLoad={_goAnimation}
                style={[styles.logo, animatedImageStyles]}
            />
        </View>
    </CustomModal>);
}
export default React.forwardRef(SplashScreenAnimation);

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: '#FFFFFF'
    },
    logo: {
        width: 100.39,
        height: 100
    },
    textBrand: {
        position: 'absolute',
        color: '#FF2E2E',
        fontSize: 36,
        fontFamily: 'Organetto-Bold'
    },
    textBrand2: {
        color: '#FFFFFF',
        fontSize: 36,
        fontFamily: 'Organetto-Bold'
    },
    secondBackground: {
        width: 0,
        height: 0,
        borderRadius: 1024,
        //backgroundColor: '#60ad5e',
        //backgroundColor: '#ff5722',
        position: 'absolute'
    }
});