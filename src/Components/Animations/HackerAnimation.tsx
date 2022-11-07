import { Canvas, SkiaView } from "@shopify/react-native-skia";
import React, { createRef, memo, useEffect, useState } from "react";
import { StyleSheet } from "react-native";


export default memo(function HackerAnimation() {
    const refCanvas = createRef<SkiaView>();
    return(<Canvas ref={refCanvas}>
        
    </Canvas>);
});

const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }
});