import React, { PureComponent } from "react";
import ThemeProvider from "./Components/ThemeProvider";
import Index from "./Index";

type IProps = {};
type IState = {};

export default class AppIndex extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): React.ReactNode {
        return(<ThemeProvider>
            <Index />
        </ThemeProvider>);
    }
}