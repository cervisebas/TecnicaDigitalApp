import React, { PureComponent } from "react";
import Theme from "../Themes";
import LoadingController from "./loading/loading-controller";
import { ThemeContext } from "./ThemeProvider";
import overlay from "react-native-paper/src/styles/overlay";
import Color from "color";

type IProps = {};
type IState = {
    visible: boolean;
    text: string;
};

export default class LoadingComponent extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            text: 'Cargando...'
        };
    }
    private isMount: boolean = false;
    static contextType = ThemeContext;
    componentDidMount(): void {
        this.isMount = true;
    }
    componentWillUnmount(): void {
        this.isMount = false;
    }
    open(text: string) {
        (this.isMount)&&this.setState({ visible: true, text });
    }
    close() {
        (this.isMount)&&this.setState({ visible: false });
    }
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<LoadingController
            visible={this.state.visible}
            loadingText={this.state.text}
            backgroundColor={(isDark)? overlay(24, theme.colors.surface): theme.colors.background}
            colorText={theme.colors.text}
            indicatorColor={Theme.colors.primary}
        />);
    }
}