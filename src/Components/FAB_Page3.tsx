import React, { PureComponent } from "react";
import { FAB } from "react-native-paper";

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
    _onChangeStateFab(state: { open: boolean; }) {
        if (this.props.disable) return;
        this.setState({ show: state.open });
    }
    render(): React.ReactNode {
        return(<FAB.Group
            visible={!this.props.disable}
            open={this.state.show}
            icon={(!this.state.show)? 'plus': 'close'}
            actions={[{
                icon: 'account-plus',
                label: 'Añadir estudiante',
                onPress: this.props.onAddNewStudent
            }, {
                icon: 'card-account-details-outline',
                label: 'Generar credenciales',
                onPress: this.props.onGenerateMultipleCards
            }]}
            onStateChange={this._onChangeStateFab}
        />);
    }
}