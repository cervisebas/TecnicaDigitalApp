import React, { forwardRef, memo, useContext, useEffect, useImperativeHandle, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";
import { ThemeContext } from "../Components/ThemeProvider";
import { getRandomIntInclusive, waitTo } from "../Scripts/Utils";
import { ThemeLight } from "../Themes";
import LinearGradient from "react-native-linear-gradient";
import ProgressBar from "../Components/CustomProgressBar";
import { Actions, Directive, Family, urlBase } from "../Scripts/ApiTecnica";
import { decode } from "base-64";
import CogsAanimations from "../Components/Animations/CogsAanimations";
import HackerAnimation from "../Components/Animations/HackerAnimation";
import BallsAnimation from "../Components/Animations/BallsAnimation";

type IProps = {
    visible: boolean;
    message: string;
};
type IRef = {
    start: ()=>void;
    hide: ()=>void;
    setSize: (w: number, h: number)=>void;
    updateAnimation: ()=>void;
};

export type { IRef as ScreenLoadingDirectiveRef };
export default memo(forwardRef(function ScreenLoadingDirective(props: IProps, ref: React.Ref<IRef>) {
    const context = useContext(ThemeContext);
    const duration: number = 500;
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [name, setName] = useState('Nombre del Directivo');
    const [numAnim, setNumAnim] = useState(0);
    const [image, setImage] = useState('https://tecnicadigital.com.ar/image/default.png');

    // Content 1
    const contentHeight = useSharedValue('0%');
    const contentBorder = useSharedValue(1024);
    const contentOpacity = useSharedValue(0.1);
    const contentStyle = useAnimatedStyle(()=>({
        height: withTiming(contentHeight.value, { duration }),
        opacity: withTiming(contentOpacity.value, { duration }),
        borderTopLeftRadius: withTiming(contentBorder.value, { duration }),
        borderTopRightRadius: withTiming(contentBorder.value, { duration })
    }));

    // Content 2
    const content2Opacity = useSharedValue(0);
    const content2MarginTop = useSharedValue(20);
    const content2Style = useAnimatedStyle(()=>({
        opacity: withTiming(content2Opacity.value, { duration }),
        marginTop: withTiming(content2MarginTop.value, { duration })
    }));

    // Content Message
    const content3Height = useSharedValue(0);
    const content3Opacity = useSharedValue(0);
    const content3Style = useAnimatedStyle(()=>({
        height: withTiming(content3Height.value, { duration }),
        opacity: withTiming(content3Opacity.value, { duration })
    }));

    async function startNow() {
        contentHeight.value = '100%';
        contentBorder.value = 0;
        contentOpacity.value = 1;
        await waitTo(duration + 100);
        content2Opacity.value = 1;
        content2MarginTop.value = 0;
    }
    function setSizeLayout(width: number, height: number) {
        setSize({ width, height });
    }
    function hide() {
        contentHeight.value = '0%';
        contentBorder.value = 1024;
        contentOpacity.value = 0;
        content2Opacity.value = 0;
        content2MarginTop.value = 20;
        setNumAnim(-1);
    }
    function updateAnimation() {
        setNumAnim(getRandomIntInclusive(0, 2));
    }

    useImperativeHandle(ref, ()=>({ start: startNow, hide, setSize: setSizeLayout, updateAnimation }));

    
    useEffect(()=>{
        if (props.message !== '') {
            content3Height.value = 38;
            content3Opacity.value = 1;
        } else {
            content3Height.value = 0;
            content3Opacity.value = 0;
        }
    }, [props.message]);
    useEffect(()=>{
        Actions.verifySession().then(async(opt: number)=>{
            if (opt == 0) {
                Directive.getDataLocal().then((values)=>{
                    setName((values.name)? decode(values.name): decode(values.username));
                    setImage(`${urlBase}/image/${decode(values.picture)}`);
                }).catch(()=>{
                    setName('Nombre del Directivo');
                    setImage('https://tecnicadigital.com.ar/image/default.png');
                });
            } else if (opt == 1) {
                Family.getDataLocal().then((values)=>{
                    setName((values.name)? decode(values.name): 'Nombre del Estudiante');
                    setImage((values.picture)? `${urlBase}/image/${decode(values.picture)}`: 'https://tecnicadigital.com.ar/image/default.png');
                }).catch(()=>{
                    setName('Nombre del Directivo');
                    setImage('https://tecnicadigital.com.ar/image/default.png');
                });
            }
        });
    }, []);

    return(<Animated.View style={[styles.content, contentStyle, { backgroundColor: context.theme.colors.background }]}>
        <LinearGradient colors={['rgba(0, 0, 0, 0)', 'rgba(0, 163, 255, 1)']} style={[{ position: 'absolute', bottom: 0 }, size]}>
            {(numAnim == 0)&&<CogsAanimations />}
            {(numAnim == 1)&&<HackerAnimation />}
            {(numAnim == 2)&&<BallsAnimation />}
            <Animated.View style={[styles.content2, content2Style]}>
                <View style={styles.contentShow}>
                    <ImageLazyLoad
                        style={[styles.contentImage, (props.visible)? styles.shadowImage: undefined]}
                        size={200}
                        source={{ uri: image }}
                    />
                    <Text style={[styles.text, { color: (numAnim == 1)? '#FFFFFF': (context.isDark)? '#FFFFFF': '#000000' }]}>{name}</Text>
                </View>
                <Animated.View style={styles.contentLoading}>
                    <ProgressBar
                        indeterminate={true}
                        style={styles.progressBar}
                        theme={{ animation: { scale: 0 } }}
                    />
                    <Animated.View style={[styles.contentMessage, content3Style]}>
                        <Text style={[styles.message, { color: (numAnim == 1)? '#FFFFFF': (context.isDark)? '#FFFFFF': '#000000' }]}>{props.message}</Text>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </LinearGradient>
    </Animated.View>);
}));

const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        overflow: 'hidden',
        zIndex: 9
    },
    content2: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentImage: {
        borderColor: ThemeLight.colors.accent,
        borderWidth: 4,
        borderRadius: 200,
        overflow: 'hidden'
    },
    shadowImage: {
        shadowOffset:{
            width: 0,
            height: 1
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2
    },
    contentShow: {
        marginTop: -100,
        flexDirection: 'column',
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Roboto-Medium',
        fontSize: 28,
        marginTop: 24,
        textAlign: 'center'
        //color: '#FFFFFF'
    },
    contentLoading: {
        position: 'absolute',
        width: '100%',
        left: 0,
        right: 0,
        bottom: 0,
        marginBottom: 120
    },
    progressBar: {
        width: '80%',
        marginLeft: '10%',
        marginRight: '10%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden'
    },
    contentMessage: {
        width: '100%',
        paddingLeft: '12%',
        paddingRight: '12%',
        alignItems: 'center',
        paddingTop: 14,
        overflow: 'hidden'
    },
    message: {
        fontSize: 17
    },
    logo: {
        position: 'absolute',
        left: 18,
        top: 18,
        width: 42,
        height: 42
    }
});