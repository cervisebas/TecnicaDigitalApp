import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";
import { ThemeContext } from "../ThemeProvider";

export default memo(function BallsAnimation() {
    const { theme } = React.useContext(ThemeContext);
    return(<View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <WebView
            source={{
                html: '<canvas id=canvas></canvas><style>body,html,canvas#canvas{background:transparent;}canvas#canvas{position:fixed;top:0;left:0;width:100%;height:100%;}</style><script>window.onload=()=>{var t,i,s,e,r,n,a,o,$,u,c,m;function y(){var t,i,s,e;for(requestAnimationFrame(y),a.clearRect(0,0,w,h),e=[],i=0,s=n.length;i<s;i++)t=n[i],e.push(t.draw());return e}s=120,t=[[0,102,255],[255,204,0],[255,46,46],[255,87,34],[0,255,0]],e=2*Math.PI,a=(r=document.getElementById("canvas")).getContext("2d"),window.w=0,window.h=0,c=function(){return window.w=r.width=width=window.screen.width,window.h=r.height=window.screen.height},window.addEventListener("resize",c,!1),c(),u=(t,i)=>(i-t)*Math.random()+t,o=function(t,i,s,r){return a.beginPath(),a.arc(t,i,s,0,e,!1),a.fillStyle=r,a.fill()},m=.5,window.requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){return window.setTimeout(t,1e3/60)},i=function(){function i(){this.style=t[~~u(0,5)],this.rgb="rgba("+this.style[0]+","+this.style[1]+","+this.style[2],this.r=~~u(2,6),this.r2=2*this.r,this.replace()}return i.prototype.replace=function(){return this.opacity=0,this.dop=.03*u(1,4),this.x=u(-this.r2,w-this.r2),this.y=u(-20,h-this.r2),this.xmax=w-this.r,this.ymax=h-this.r,this.vx=u(0,2)+8*m-5,this.vy=.7*this.r+u(-1,1)},i.prototype.draw=function(){var t;return this.x+=this.vx,this.y+=this.vy,this.opacity+=this.dop,this.opacity>1&&(this.opacity=1,this.dop*=-1),(this.opacity<0||this.y>this.ymax)&&this.replace(),0<(t=this.x)&&t<this.xmax||(this.x=(this.x+this.xmax)%this.xmax),o(~~this.x,~~this.y,this.r,this.rgb+","+this.opacity+")")},i}(),n=function(){var t,e;for(e=[],$=t=1;1<=s?t<=s:t>=s;$=1<=s?++t:--t)e.push(new i);return e}(),y()};</script>',
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
        height: '100%'
    },
    webView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0)'
    }
});