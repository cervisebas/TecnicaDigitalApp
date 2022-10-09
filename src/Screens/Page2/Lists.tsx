import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, Dimensions, EmitterSubscription, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import CustomCard4 from "../../Components/Elements/CustomCard4";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemeContext } from "../../Components/ThemeProvider";
import { DataSchedule } from "../../Scripts/ApiTecnica/types";
import { ActivityIndicator, IconButton, Text } from "react-native-paper";
import { Schedules } from "../../Scripts/ApiTecnica";
import { decode } from "base-64";
import ViewSchedule from "../../Pages/ViewSchedule";
import EditShedule from "./EditSchedule";

type IProps = {
    handlerLoad: (status: boolean)=>any;
    goLoading: (visible: boolean, message?: string)=>any;
};
type IState = {
    isLoading: boolean;
    isRefresh: boolean;
    isError: boolean;
    messageError: string;
    datas: DataSchedule[];
    numColumns: number;
};

export default class Page2Lists extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            isRefresh: false,
            isError: false,
            messageError: '',
            datas: [],
            numColumns: 2
        };
        this._renderItem = this._renderItem.bind(this);
        this.loadData = this.loadData.bind(this);
    }
    private event: EmitterSubscription | undefined = undefined;
    static contextType = ThemeContext;
    private refViewSchedule = createRef<ViewSchedule>();
    private refEditShedule = createRef<EditShedule>();

    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('p2-lists-reload', (reload?: boolean)=>this.setState({ isRefresh: !!reload }, this.loadData));
        const { width } = Dimensions.get('window');
        this.setState({ numColumns: ((width/2) >= 200)? 2: 1 });
        this.loadData();
    }
    componentWillUnmount(): void {
        this.event?.remove();
    }
    
    loadData() {
        if (!this.state.isRefresh) {
            this.props.handlerLoad(false);
            this.setState({ isLoading: true, datas: [] });
        }
        this.setState({ isError: false }, ()=>
            Schedules.getAll()
                .then((datas)=>{
                    this.setState({ datas, isLoading: false, isRefresh: false });
                    this.props.handlerLoad(true);
                    console.log(datas[0].data);
                })
                .catch((error)=>this.setState({ isLoading: false, isError: true, messageError: error.cause }))
        );
    }

    openSchedule(data: DataSchedule) {
        //console.log(data.data);
        this.refViewSchedule.current?.open(data);
    }

    // FlatList
    _renderItem({ item, index }: ListRenderItemInfo<DataSchedule>) {
        return(<CustomCard4
            key={`card-num-${item.id}`}
            title={`Curso ${decode(item.curse)}`}
            subtitle={''}
            position={(index%2 == 0)? 'left': 'right'}
            onPress={()=>this.openSchedule(item)}
            onEdit={()=>this.refEditShedule.current?.open(item)}
        />);
    }
    _getItemLayout(data: DataSchedule[] | null | undefined, index: number) {
        return {
            length: 128,
            offset: 128 * index,
            index
        };
    }

    render(): React.ReactNode {
        const { theme } = this.context;
        return(<View style={styles.content}>
            {(!this.state.isLoading)? (!this.state.isError)?
            <FlatList
                key={`Page2ListTimes${this.state.numColumns}`}
                data={this.state.datas}
                numColumns={this.state.numColumns}
                contentContainerStyle={{
                    flex: (this.state.datas.length == 0)? 1: undefined,
                    paddingBottom: 8,
                    paddingTop: 8
                }}
                refreshControl={<RefreshControl colors={[theme.colors.primary]} progressBackgroundColor={theme.colors.surface} refreshing={this.state.isRefresh} onRefresh={()=>this.setState({ isRefresh: true }, this.loadData)} />}
                getItemLayout={this._getItemLayout}
                ListEmptyComponent={<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} color={theme.colors.text} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningúna lista</Text></View>}
                renderItem={this._renderItem}
            />:
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Icon name={'account-alert-outline'} size={48} color={theme.colors.text} style={{ fontSize: 48 }} />
                    <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                    <IconButton icon={'reload'} color={theme.colors.primary} size={28} onPress={this.loadData} style={{ marginTop: 12 }} />
                </View>
            </View>
            :<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={'large'} animating /></View>}
            
            {/* ##### Modal's ##### */}
            <ViewSchedule ref={this.refViewSchedule} />
            <EditShedule ref={this.refEditShedule} goLoading={this.props.goLoading} />
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    }
});