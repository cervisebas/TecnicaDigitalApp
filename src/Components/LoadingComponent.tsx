import React, { PureComponent } from "react";
import Theme from "../Themes";
import LoadingController from "./loading/loading-controller";

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
    open(text: string) {
        this.setState({ visible: true, text });
    }
    close() {
        this.setState({ visible: false });
    }
    render(): React.ReactNode {
        return(<LoadingController
            visible={this.state.visible}
            loadingText={this.state.text}
            indicatorColor={Theme.colors.accent}
        />);
    }
}