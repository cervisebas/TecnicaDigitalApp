import React, { PureComponent } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import CustomCard4 from "../../Components/Elements/CustomCard4";

type IProps = {};
type IState = {
    numColumns: number;
};

export default class Page2Lists extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            numColumns: 2
        };
        for (let i = 0; i < 100; i++) {
            this.data.push(i);
        }
    }
    private data: number[] = [];

    componentDidMount() {
        const { width } = Dimensions.get('window');
        this.setState({ numColumns: ((width/2) >= 200)? 2: 1 });
    }
    render(): React.ReactNode {
        return(<View style={styles.content}>
            <FlatList
                key={`Page2ListTimes${this.state.numColumns}`}
                data={this.data}
                numColumns={this.state.numColumns}
                renderItem={({ index })=><CustomCard4
                    key={`card-num-${index}`}
                    title={'Curso 4°2'}
                    subtitle={'Lunes: 9:40hs'}
                    position={(index%2 == 0)? 'left': 'right'}
                />}
            />
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    }
});