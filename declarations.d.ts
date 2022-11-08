declare module "*.svg" {
    import React from 'react';
    import { SvgProps } from "react-native-svg";
    const content: React.FC<SvgProps>;
    export default content;
}
declare module '*.png';
declare module '*.jpg';
declare module '*.webp';
declare module '*.gif';
declare module '*.svg';
declare module '*.ttf' {
    import Rect from 'react-native-svg';
    const content: DataSourceParam;
    export default content;
};