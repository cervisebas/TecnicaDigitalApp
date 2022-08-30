import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import CustomModal from '../CustomModal';

interface Props {
  visible: boolean;
  loadingText?: string;
  backgroundOverlayColor?: string;
  backgroundColor?: string;
  indicatorSize?: "large" | "small";
  fontWeight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  loadingPaddingView?: number;
  borderRadius?: number;
  loadingTextMargin?: string;
  indicatorColor?: string;
  loaderContentDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  colorText?: string;
}

const defaultProps: Props = {
  visible: false,
  loadingText: 'Loading',
  indicatorSize: 'large',
  backgroundColor: 'white',
  backgroundOverlayColor: 'rgba(0, 0, 0, .3)',
  loadingPaddingView: 25,
  loadingTextMargin: '3%',
  loaderContentDirection: "row",
  borderRadius: 6,
  fontWeight: 'normal',
  colorText: '#000000'
};

const LoadingController: React.FC<Props> = (props: Props) => {
  return(<CustomModal visible={props.visible} transparent animationIn={'fadeIn'} animationOut={'fadeOut'}>
    <View style={{ flex: 1, backgroundColor: props.backgroundOverlayColor, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ padding: props.loadingPaddingView, backgroundColor: props.backgroundColor, borderRadius: props.borderRadius }}>
        <View style={{ flexDirection: props.loaderContentDirection, alignItems: 'center' }}>
          <ActivityIndicator size={props.indicatorSize} color={props.indicatorColor}/>
          <Text style={{ margin: props.loadingTextMargin, fontWeight: props.fontWeight, color: props.colorText, marginLeft: 16 }}>{props.loadingText}</Text>
        </View>
      </View>
    </View>
  </CustomModal>);
};

LoadingController.defaultProps = defaultProps;

export default LoadingController;
