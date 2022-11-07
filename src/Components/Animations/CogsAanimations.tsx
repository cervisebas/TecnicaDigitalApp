import React, { memo, useEffect, useState } from "react";
import { Dimensions, Image, StatusBar, StyleSheet, View } from "react-native";
import CogImage from "../../Assets/Cog.webp";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

const { height } = Dimensions.get('window');

export default memo(function CogsAnimation() {
    const [cont, setCont] = useState(false);

    const rotate = useSharedValue('0deg');
    const rotateStyle = useAnimatedStyle(()=>({
        transform: [{
            rotate: rotate.value
        }]
    }));
    
    rotate.value = withRepeat(withTiming('360deg', { duration: 2500, easing: Easing.linear }), Infinity, false);

    return(<View style={styles.content}>
        <Animated.Image
            source={CogImage}
            style={[styles.image1, rotateStyle]}
            blurRadius={12}
            resizeMethod={'scale'}
            resizeMode={'contain'}
        />
        <Animated.Image
            source={CogImage}
            style={[styles.image2, rotateStyle]}
            blurRadius={8}
            resizeMethod={'scale'}
            resizeMode={'contain'}
        />
        <Animated.Image
            source={CogImage}
            style={[styles.image3, rotateStyle]}
            blurRadius={10}
            resizeMethod={'scale'}
            resizeMode={'contain'}
        />
    </View>);
});

const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    image1: {
        position: 'absolute',
        top: 80,
        left: -150,
        width: 300,
        height: 300
    },
    image2: {
        position: 'absolute',
        bottom: -200,
        left: -200,
        width: 500,
        height: 500
    },
    image3: {
        position: 'absolute',
        top: -120,
        right: -150,
        width: 340,
        height: 340
    }
});