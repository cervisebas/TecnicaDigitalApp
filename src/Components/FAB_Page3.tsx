import React, { PureComponent } from "react";
import { FAB, overlay } from "react-native-paper";
import { ThemeContext } from "./ThemeProvider";

type IProps = {
    onAddNewStudent: ()=>any;
    onGenerateMultipleCards: ()=>any;
    disable: boolean;
};
type IState = {
    show: boolean;
};

export default class FABPage3 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            show: false
        };
        this._onChangeStateFab = this._onChangeStateFab.bind(this);
    }
    static contextType = ThemeContext;
    _onChangeStateFab(state: { open: boolean; }) {
        if (this.props.disable) return;
        this.setState({ show: state.open });
    }
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<FAB.Group
            visible={!this.props.disable}
            open={this.state.show}
            icon={(!this.state.show)? 'plus': 'close'}
            actions={[{
                icon: 'account-plus',
                label: 'Añadir estudiante',
                style: (isDark)? {
                    backgroundColor: overlay(4, theme.colors.surface)
                }: undefined,
                onPress: this.props.onAddNewStudent
            }, {
                icon: 'card-account-details-outline',
                label: 'Generar credenciales',
                style: (isDark)? {
                    backgroundColor: overlay(4, theme.colors.surface)
                }: undefined,
                onPress: this.props.onGenerateMultipleCards
            }]}
            onStateChange={this._onChangeStateFab}
        />);
    }
}