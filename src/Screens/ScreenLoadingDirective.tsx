import React, { forwardRef, memo, useContext, useEffect, useImperativeHandle, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";
import { ThemeContext } from "../Components/ThemeProvider";
import { waitTo } from "../Scripts/Utils";
import { ThemeLight } from "../Themes";
import LinearGradient from "react-native-linear-gradient";
import ProgressBar from "../Components/CustomProgressBar";
import { Directive, urlBase } from "../Scripts/ApiTecnica";
import { decode } from "base-64";
import FastImage from "react-native-fast-image";
import logo from '../Assets/miniLogo.webp';
import logoDark from '../Assets/miniLogoDark.webp';
import CogsAanimations from "../Components/Animations/CogsAanimations";
import HackerAnimation from "../Components/Animations/HackerAnimation";

type IProps = {
    message: string;
};
type IRef = {
    start: ()=>void;
    hide: ()=>void;
    setSize: (w: number, h: number)=>void;
};

export type { IRef as ScreenLoadingDirectiveRef };
export default memo(forwardRef(function ScreenLoadingDirective(props: IProps, ref: React.Ref<IRef>) {
    const context = useContext(ThemeContext);
    const duration: number = 500;
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [name, setName] = useState('Nombre del Directivo');
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
    }

    useImperativeHandle(ref, ()=>({ start: startNow, hide, setSize: setSizeLayout }));

    
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
        Directive.getDataLocal().then((values)=>{
            setName(decode(values.username));
            setImage(`${urlBase}/image/${decode(values.picture)}`);
        }).catch(()=>{
            setName('Nombre del Directivo');
            setImage('https://tecnicadigital.com.ar/image/default.png');
        });
    }, []);

    return(<Animated.View style={[styles.content, contentStyle, { backgroundColor: context.theme.colors.background }]}>
        <LinearGradient colors={['rgba(0, 0, 0, 0)', 'rgba(0, 163, 255, 1)']} style={[{ position: 'absolute', bottom: 0 }, size]}>
            <CogsAanimations />
            {/*<HackerAnimation />*/}
            <FastImage source={(context.isDark)? logoDark: logo} style={styles.logo} />
            <Animated.View style={[styles.content2, content2Style]}>
                <View style={styles.contentShow}>
                    <ImageLazyLoad style={styles.contentImage} size={200} circle={true} source={{ uri: image }} />
                    <Text style={styles.text}>{name}</Text>
                </View>
                <Animated.View style={styles.contentLoading}>
                    <ProgressBar
                        indeterminate={true}
                        style={styles.progressBar}
                        theme={{ animation: { scale: 0 } }}
                    />
                    <Animated.View style={[styles.contentMessage, content3Style]}>
                        <Text style={styles.message}>{props.message}</Text>
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
        overflow: 'hidden'
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
    contentShow: {
        marginTop: -100,
        flexDirection: 'column',
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Roboto-Medium',
        fontSize: 28,
        marginTop: 24,
        color: '#FFFFFF'
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