import React, { PureComponent } from "react";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

type IProps = {
    addNewMatter?: ()=>any;
    addNewTimes?: ()=>any;
};
type IState = {
    visible: boolean;
    index: number;
    icon: 'table-large-plus' | 'plus';
};

export default class FabPage2 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: true,
            index: 0,
            icon: 'table-large-plus'
        };
    }
    private page1status = false;
    private page2status = true;
    updateIndex(index: number) {
        this.setState({
            index,
            icon: (index == 0)? 'table-large-plus': 'plus'
        });
    }
    componentDidUpdate(): void {
        this.setVisible();
    }
    updateStatuses(page: 1 | 2, status: boolean) {
        switch (page) {
            case 1:
                this.page1status = status;
                break;
            case 2:
                this.page2status = status;
                break;
        }
        this.setVisible();
    }
    setVisible() {
        const visible = (this.state.index == 0)? this.page1status == true: this.page2status == true;
        this.setState({ visible });
    }
    render(): React.ReactNode {
        return(<FAB
            visible={this.state.visible}
            icon={this.state.icon}
            animated={true}
            style={styles.fab}
            onPress={(this.state.index == 0)? this.props.addNewTimes: this.props.addNewMatter}
        />);
    }
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0
    }
});