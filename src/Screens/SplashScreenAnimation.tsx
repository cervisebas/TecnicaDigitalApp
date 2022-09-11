import React, { useImperativeHandle, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import CustomModal from "../Components/CustomModal";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import RNBootSplash from "react-native-bootsplash";
// Images
import SplashLogo from "../Assets/splash_logo.webp";

type IProps = {
    onFinish?: ()=>any;
};

function SplashScreenAnimation(props: IProps, ref: React.Ref<{ open: ()=>any; close: ()=>any; }>) {
    const [visible, setVisible] = useState(true);
    useImperativeHandle(ref, ()=>({ open: ()=>setVisible(true), close: ()=>setVisible(false) }));
    const translateY = useSharedValue(0);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const animatedImageStyles = useAnimatedStyle(()=>({ transform: [{ translateY: withSpring(translateY.value) }] }));
    const animatedTextStyles = useAnimatedStyle(()=>({ transform: [{ scale: withTiming(scale.value, { duration: 250 }) }], opacity: withTiming(opacity.value, { duration: 250 }) }));
    const wait = (time: number)=>new Promise((res)=>setTimeout(res, time));
    const _goAnimation = async()=>{
        await wait(200);
        await RNBootSplash.hide({ fade: false });
        translateY.value = -50;
        await wait(500);
        translateY.value = Dimensions.get('window').height;
        await wait(200);
        opacity.value = 1;
        scale.value = 1;
        await wait(1500);
        (props.onFinish)&&props.onFinish();
        setVisible(false);
    };
    return(<CustomModal visible={visible} animationIn={'fadeIn'} animationOut={'fadeOut'} animationInTiming={0} animationOutTiming={750}>
        <View style={styles.content}>
            <Animated.Text style={[styles.textBrand, animatedTextStyles]}>SCAPPS</Animated.Text>
            <Animated.Image
                source={SplashLogo}
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
        backgroundColor: '#FFFFFF'
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
    }
});