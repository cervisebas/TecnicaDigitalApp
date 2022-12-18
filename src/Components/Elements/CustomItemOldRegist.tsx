import React, { memo } from "react";
import { List } from "react-native-paper";
import Theme from "../../Themes";
import { StyleSheet } from "react-native";

type IProps = {
    title: string;
    onPress?: ()=>any;
};

const IconLeft = ()=><List.Icon icon={'text-box-multiple-outline'} color={Theme.colors.accent} />;
const IconRight = ()=><List.Icon icon={'arrow-right'} color={Theme.colors.primary} />;

export default memo(function CustomItemOldRegist(prop: IProps) {
    return(<List.Item
        left={IconLeft}
        right={IconRight}
        title={prop.title}
        style={styles.item}
        onPress={prop.onPress}
    />);
});

const styles = StyleSheet.create({
    item: {
        height: 72
    }
});