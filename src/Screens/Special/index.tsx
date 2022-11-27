import Color from "color";
import React, { createRef, memo, useContext, useEffect } from "react";
import { Pressable, StyleSheet, ToastAndroid } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { ThemeContext } from "../../Components/ThemeProvider";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Directive } from "../../Scripts/ApiTecnica";
import { isDateBetweenExtended } from "../../Scripts/Utils";
import moment from "moment";
import SpecialPresentation from "./Presentation";

type IProps = {};

export default memo(function Special(_props: IProps) {
    const { theme } = useContext(ThemeContext);
    const AnimatedIcon = Animated.createAnimatedComponent(Icon);
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
    const SpecialPresentationRef = createRef<SpecialPresentation>();
    const creators: number[] = [1, 5, 10, 14, 23];
    const duration = 300;

    const scale = useSharedValue(0.6);
    const opacity = useSharedValue(0);
    const right = useSharedValue(-33.6);

    const animationStyles = useAnimatedStyle(()=>({
        transform: [{ scale: withTiming(scale.value, { duration }) }],
        opacity: withTiming(opacity.value, { duration }),
        right: withTiming(right.value, { duration })
    }));
    const animationStylesIcon = useAnimatedStyle(()=>({
        transform: [{
            rotate: withRepeat(withSequence(
                withTiming('10deg', { duration: 600 }),
                withTiming('-10deg', { duration: 600 })
            ), -1, true)
        }]
    }));
    const animationPressable = useAnimatedStyle(()=>({
        transform: [{
            translateY: withRepeat(withSequence(
                withTiming(2, { duration: 1000 }),
                withTiming(-2, { duration: 1000 })
            ), -1, true)
        }]
    }));

    function hideNow() {
        scale.value = 0.6;
        opacity.value = 0;
        right.value = -33.6;
    }
    function showNow() {
        scale.value = 1;
        opacity.value = 1;
        right.value = 4;
    }
    async function processNow() {
        try {
            if (!isDateBetweenExtended('05/11/2022', '01/01/3000', moment().format('DD/MM/YYYY'))) return;
            const userData = await Directive.getDataLocal();
            if (!!creators.find((v)=>v.toString()==userData.id)) showNow();
        } catch {
            ToastAndroid.show('Ocurrió un error al verificar si es un creador.', ToastAndroid.SHORT);
        }
    }
    function openPresentation() {
        SpecialPresentationRef.current?.open();
    }

    useEffect(()=>{
        hideNow();
        setTimeout(processNow, 1000);
    }, []);

    return(<>
        <Animated.View style={[styles.content, { backgroundColor: Color(theme.colors.primary).darken(0.2).rgb().toString() }, animationStyles]}>
            <AnimatedPressable style={[styles.presable, animationPressable]} onPress={openPresentation} onLongPress={hideNow}>
                <AnimatedIcon name={'email-outline'} color={'#FFFFFF'} size={36} style={animationStylesIcon} />
            </AnimatedPressable>
        </Animated.View>
        <SpecialPresentation ref={SpecialPresentationRef} />
    </>);
});

const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        right: 0,
        top: '40%',
        width: 56,
        height: 56,
        backgroundColor: '#FFFFFF',
        borderRadius: 56,
        overflow: 'hidden',
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6
    },
    presable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
});