import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

export default memo(function HackerAnimation() {
    return(<View style={styles.content}>
        <WebView
            source={{
                html: '<!doctypehtml><canvas id=canv></canvas><style>canvas#canv{position:fixed;top:0;left:0;width:100%;height:100%}</style><script>window.onload=()=>{let $=document.getElementById("canv"),l=$.getContext("2d"),t=$.width=window.screen.width,e=$.height=window.screen.height,n=Math.floor(t/20)+1,o=Array(n).fill(0);function i($,l){return $=Math.ceil($),Math.floor(Math.random()*((l=Math.floor(l))-$+1)+$)}function f(){l.fillStyle="#0001",l.fillRect(0,0,t,e),l.fillStyle="#0f0",l.font="15pt monospace",o.forEach(($,t)=>{let e=i(0,1);l.fillText(e,20*t,$),$>100+1e4*Math.random()?o[t]=0:o[t]=$+20})}l.fillStyle="#000000",l.fillRect(0,0,t,e),setInterval(f,50)};</script>',
                baseUrl: ''
            }}
            originWhitelist={['*']}
            scalesPageToFit={false}
            javaScriptEnabled={true}
            allowUniversalAccessFromFileURLs={true}
            mixedContentMode={'always'}
            domStorageEnabled={true}
            thirdPartyCookiesEnabled={true}
            style={styles.webView}
        />
    </View>);
});

const styles = StyleSheet.create({
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000000'
    },
    webView: {
        flex: 1
    }
});