import { decode } from "base-64";
import React, { PureComponent } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { IconButton, Text } from "react-native-paper";
import ImageLazyLoadNative from "../../Components/Elements/ImageLazyLoadNative";
import { urlBase } from "../../Scripts/ApiTecnica";
import { StudentsData } from "../../Scripts/ApiTecnica/types";
import ImageReflect from "./Components/ImageReflect";
import Triangle from "./Components/Triangle";
// Image
import Swords from "../../Assets/swords.webp";

type IProps = {
    data: StudentsData | undefined;
    openImage: (src: string)=>any;
    closeSession: ()=>any;
    openDialog: (title: string, text: string)=>any;

    // FUnction
    _openImage: ()=>void;
    close: ()=>void;
    disableDesing: ()=>void;

    // States
    visible: boolean;
    idStudent: string;
    isStudent: boolean;
    switchNotifications: boolean;
};
type IState = {};

export default class FamilyOptionsOpt1 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): React.ReactNode {
        const { width, height } = Dimensions.get('window');
        const sizeImage = width - 220;
        return(<View style={[styles.content, { height: height - 200 }]}>
            <View style={styles.nameView}>
                <Text style={styles.nameText} numberOfLines={1}>{decode(this.props.data!.name)}</Text>
                <View style={styles.divider} />
            </View>
            <View style={styles.imageContent}>
                <IconButton
                    icon={'arrow-left'}
                    onPress={this.props.close}
                    style={styles.backButton}
                    color={'#5f5f5f'}
                />
                <Pressable onPress={this.props._openImage} style={styles.imageTouchable}>
                    <ImageLazyLoadNative
                        source={{ uri: `${urlBase}/image/${decode(this.props.data!.picture)}` }}
                        size={sizeImage}
                        style={[styles.image, { borderRadius: sizeImage }]}
                        nativeImageProps={{ blurRadius: 1 }}
                    />
                    <ImageReflect
                        source={{ uri: `${urlBase}/image/${decode(this.props.data!.picture)}` }}
                        size={sizeImage}
                        style={[styles.imageReflect, { borderRadius: sizeImage, bottom: -sizeImage }]}
                        nativeImageProps={{ blurRadius: 10, borderRadius: sizeImage }}
                    />
                </Pressable>
            </View>
            <View style={[styles.details, { height: ((height - 200) - 81) - ((sizeImage + (sizeImage / 2)) + 10) }]}>
                <View style={styles.viewDetailsTitle}>
                    <Text style={styles.titleText}>Información:</Text>
                </View>
                <View style={styles.viewInfo}>
                    <TextView title={'ID'} text={this.props.idStudent} />
                    <TextView title={'Curso'} text={decode(this.props.data!.curse)} />
                    <TextView title={'D.N.I'} text={decode(this.props.data!.dni)} />
                    <TextView title={'Nacimiento'} text={decode(this.props.data!.date)} />
                    <TextView title={'Teléfono'} text={decode(this.props.data!.tel)} />
                </View>
                <View style={styles.iconSwordsContent}><FastImage source={Swords} style={styles.iconSwords} /></View>
                <Triangle
                    color={'#FFFFFF'}
                    size={20}
                    style={styles.triangle}
                />
                <Pressable style={styles.pressableBrand} onLongPress={this.props.disableDesing}>
                    <Text style={styles.textBrand}>SCAPPS</Text>
                </Pressable>
            </View>
        </View>);
    }
}

type IProps2 = {
    title: string;
    text: string;
};
class TextView extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.itemContent}>
            <Text style={styles.item1}>{`${this.props.title}:`}</Text>
            <Text style={styles.item2}>{this.props.text}</Text>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        position: 'relative',
        marginLeft: 16,
        marginRight: 16,
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
    },
    nameView: {
        width: '100%',
        height: 81,
        alignItems: 'center',
        paddingTop: 18,
        overflow: 'hidden'
    },
    nameText: {
        fontSize: 30,
        fontFamily: 'SAOUI-Regular',
        width: '100%',
        paddingLeft: 20,
        paddingRight: 20,
        textAlign: 'center',
        color: '#4d4d4d'
    },
    divider: {
        width: '90%',
        height: 2,
        backgroundColor: '#4d4d4d',
        marginTop: 24,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4
    },
    imageContent: {
        width: '100%',
        flex: 1
    },
    imageTouchable: {
        position: 'relative',
        width: '100%',
        alignItems: 'center',
        marginTop: 32
    },
    image: {
        shadowColor: "#4d4d4d",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.36,
        shadowRadius: 6.68,
        elevation: 0
    },
    imageReflect: {
        position: 'absolute',
        transform: [{ rotate: '180deg' }, { scaleX: -1 }]
    },
    details: {
        width: '100%',
        backgroundColor: '#d7d7d7',
        overflow: 'hidden'
    },
    triangle: {
        position: 'absolute',
        left: 37,
        top: 0
    },
    iconSwordsContent: {
        position: 'absolute',
        top: (20 * 1.5) + 14,
        left: 26,
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        height: 64,
        backgroundColor: '#4d4d4d',
        borderRadius: 64
    },
    iconSwords: {
        width: 36,
        height: 36
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        paddingLeft: 4
    },
    item1: {
        fontFamily: 'SAOUI-Bold',
        color: '#5f5f5f',
        fontSize: 18
    },
    item2: {
        marginLeft: 2,
        fontFamily: 'SAOUI-Regular',
        color: '#5f5f5f',
        fontSize: 18
    },
    viewDetailsTitle: {
        width: '100%',
        height: 64,
        top: (20 * 1.5) + 14,
        paddingLeft: 104,
        justifyContent: 'center'
    },
    titleText: {
        fontFamily: 'SAOUI-Bold',
        fontSize: 38,
        color: '#5f5f5f'
    },
    viewInfo: {
        width: '100%',
        height: 64,
        top: (20 * 1.5) + 38,
        paddingLeft: 104,
        justifyContent: 'center'
    },
    pressableBrand: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        margin: 18
    },
    textBrand: {
        color: '#5f5f5f',
        fontSize: 18,
        fontFamily: 'SAOUI-Bold'
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        marginTop: 10,
        marginLeft: 14
    }
});