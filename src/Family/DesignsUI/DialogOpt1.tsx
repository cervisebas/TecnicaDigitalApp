import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View, DeviceEventEmitter, EmitterSubscription } from "react-native";
import { Text } from "react-native-paper";
import CustomModal from "../../Components/CustomModal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, { call, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { waitTo } from "../../Scripts/Utils";

type IProps = {};
export type DialogOpt1Ref = {
    open: (message: string, callback?: ()=>void)=>Promise<void>;
    close: ()=>Promise<void>;
};

export default memo(forwardRef(function DialogOpt1(_props: IProps, ref: React.Ref<DialogOpt1Ref>) {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('Mensaje de prueba');
    const [heightMessage, setHeightMessage] = useState(1);
    var eventClick: EmitterSubscription | undefined = undefined;

    const headerTY = useSharedValue(60);
    const footerTY = useSharedValue(-70);

    const styleHeader = useAnimatedStyle(()=>({ transform: [{ translateY: withTiming(headerTY.value, { duration: 150 }) }] }));
    const styleFooter = useAnimatedStyle(()=>({ transform: [{ translateY: withTiming(footerTY.value, { duration: 150 }) }] }));

    async function open(message: string, callback?: ()=>void) {
        headerTY.value = heightMessage / 2;
        footerTY.value = -(heightMessage / 2);
        setVisible(true);
        setMessage(message);
        await waitTo(300);
        headerTY.value = 0;
        footerTY.value = 0;
        if (callback) eventClick = DeviceEventEmitter.addListener('ClickDialogOpt1', callback);
    }
    async function close() {
        headerTY.value = heightMessage / 2;
        footerTY.value = -(heightMessage / 2);
        await waitTo(200);
        setVisible(false);
        eventClick?.remove();
    }
    function onPress() {
        DeviceEventEmitter.emit('ClickDialogOpt1');
        close();
    }
    function updateHeight({ nativeEvent: { layout: { height } } }: LayoutChangeEvent) {
        setHeightMessage(height);
    }
    useImperativeHandle(ref, ()=>({ open, close }));

    useEffect(()=>{
        if (visible == false) {
            headerTY.value = heightMessage / 2;
            footerTY.value = -(heightMessage / 2);
        }
    }, [heightMessage]);

    return(<CustomModal visible={visible} onRequestClose={close} animationIn={'zoomIn'} animationOut={'zoomOut'}>
        <View style={style.content}>
            <Animated.View style={[style.header, styleHeader]}>
                <Text style={style.headerText}>ALERTA</Text>
            </Animated.View>
            <View style={style.message} onLayout={updateHeight}>
                <Text style={style.messageText}>{message}</Text>
            </View>
            <Animated.View style={[style.footer, styleFooter]}>
                <View style={style.buttonContent}>
                    <Pressable style={[style.buttonPressable, { backgroundColor: '#5797c5' }]} onPress={onPress}>
                        <View style={style.buttonView}>
                            <Icon name={'checkbox-blank-circle-outline'} color={'#FFFFFF'} size={30} />
                        </View>
                    </Pressable>
                </View>
                <View style={style.buttonContent}>
                    <Pressable style={[style.buttonPressable, { backgroundColor: '#e16b8a' }]} onPress={close}>
                        <View style={style.buttonView}>
                            <Icon name={'close'} color={'#FFFFFF'} size={30} />
                        </View>
                    </Pressable>
                </View>
            </Animated.View>
        </View>
    </CustomModal>);
}));

const style = StyleSheet.create({
    content: {
        width: '96%',
        marginLeft: '2%',
        marginRight: '2%',
        //backgroundColor: '#f9f9f9',
        //backgroundColor: '#dadada',
        opacity: 1
    },
    header: {
        width: '100%',
        height: 80,
        backgroundColor: '#f9f9f9',
        shadowColor: "#000000",
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
        //opacity: 0.9,
        //marginBottom: 6,
        //transform: [{ translateY: 60 }],
        zIndex: 2
    },
    headerText: {
        fontFamily: 'SAOUI-Bold',
        color: '#5f5f5f',
        fontSize: 28
    },
    message: {
        width: '100%',
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: '#dadada',
        zIndex: 1
    },
    messageText: {
        fontFamily: 'SAOUI-Regular',
        color: '#5f5f5f',
        fontSize: 20
    },
    footer: {
        width: '100%',
        height: 90,
        backgroundColor: '#f9f9f9',
        shadowColor: "#000000",
        elevation: 3,
        //opacity: 0.9,
        //marginTop: 6,
        flexDirection: 'row',
        zIndex: 2,
        //transform: [{ translateY: -70 }]
    },
    buttonContent: {
        width: '50%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonPressable: {
        //backgroundColor: '#5797c5',
        borderRadius: 64,
        overflow: 'hidden',
        padding: 3
    },
    buttonView: {
        padding: 4,
        borderColor: '#FFFFFF',
        borderWidth: 2,
        borderRadius: 64
    }
});

//dadada