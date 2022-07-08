import { decode } from "base-64";
import React, { Component } from "react";
import { DeviceEventEmitter, FlatList, ListRenderItemInfo, ToastAndroid, View } from "react-native";
import { Appbar, Avatar, Card, IconButton, Text } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { Annotation, urlBase } from "../Scripts/ApiTecnica";
import { AnnotationList } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";

type IProps= {
    visible: boolean;
    close: ()=>any;
    select: { id: string; curse: string; date: string; annotations: number; };
    data: AnnotationList[];
    goLoading: (visible: boolean, text: string, then?: ()=>any)=>any;
};
type IState= {};

export default class ViewAnnotations extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this._renderItem = this._renderItem.bind(this);
    }

    deleteNow(idAnnotation: string) {
        this.props.goLoading(true, 'Borrando anotación...', ()=>
            Annotation.delete(idAnnotation)
                .then(()=>this.props.goLoading(false, '', ()=>{
                    ToastAndroid.show('Anotación borrada con éxito', ToastAndroid.SHORT);
                    DeviceEventEmitter.emit('restore-view-annotations');
                    DeviceEventEmitter.emit('p1-reload', 1);
                    this.props.close();
                }))
                .catch((error)=>this.props.goLoading(false, '', ()=>ToastAndroid.show(error.cause, ToastAndroid.SHORT)))
        );
    }

    _keyExtractor(item: AnnotationList) {
        return `annotation-${item.id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<AnnotationList>) {
        return(<Card style={{ marginLeft: 8, marginBottom: 10, marginRight: 8 }} elevation={3}>
            <Card.Title
                key={`annotation-${item.id}`}
                title={decode(item.directive.name)}
                subtitle={item.date}
                subtitleStyle={{ marginLeft: 8, fontSize: 11 }}
                titleStyle={{ fontSize: 16 }}
                left={(props)=><Avatar.Image
                    {...props}
                    size={40}
                    source={{ uri: `${urlBase}/image/${decode(item.directive.picture)}` }}
                />}
                right={(props)=><IconButton
                    {...props}
                    icon={'delete-outline'}
                    onPress={()=>this.deleteNow(item.id)}
                />}
            />
            <Card.Content><Text>{decode(item.note)}</Text></Card.Content>
        </Card>);
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} onRequestClose={()=>this.props.close()}>
            <View style={{ flex: 1, backgroundColor: Theme.colors.background, margin: 12, overflow: 'hidden', borderRadius: 8 }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={()=>this.props.close()} />
                    <Appbar.Content title={'Ver anotaciones'} />
                </Appbar.Header>
                <View style={{ flex: 2 }}>
                    {(this.props.visible)&&<FlatList
                        data={this.props.data}
                        contentContainerStyle={{ paddingTop: 8 }}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />}
                </View>
            </View>
        </CustomModal>);
    }
}