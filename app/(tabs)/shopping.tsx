import { useListStore } from "@/store/useStore";
import { useState } from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";

export default function Shopping() {
    const list = useListStore(state => state.list);

    const total = list.reduce((acc, curr) => acc += curr.items.length, 0);
    const complete = list.reduce((acc, curr) => acc += curr.items.filter(item => item.complete).length, 0);

    const colorThemes: { [key: string]: string } = {
        'Produce': 'lightgreen',
        'Dairy': 'lightblue',
        'Protein': 'orange',
        'Pantry': 'lightyellow',
        'Frozen': 'light'
    }

    return <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingLeft: 20, paddingVertical: 5, backgroundColor: '#c7edd1' }}>
            <Text>{complete} / {total} complete</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
            {list.map((category, i) => (
                <View key={category.name} style={{ backgroundColor: colorThemes[category.name], padding: 20 }}>
                    <Text style={{ fontSize: 22 }}>{category.name}</Text>
                    {category.items.map((item, j) => (
                        <Text key={j} style={{ color: item.complete ? 'green' : '', height: 50, }}>- {item.name}</Text>
                    ))}
                </View>
            ))}
        </ScrollView>
    </SafeAreaView>
}