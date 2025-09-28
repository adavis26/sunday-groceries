import { useListStore } from "@/store/useStore";
import { useState, useRef } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import Button from '@/components/Button';

export default function Shopping() {
    const list = useListStore(state => state.list);
    const router = useRouter();

    const total = list.reduce((acc, curr) => acc += curr.items.length, 0);
    const complete = list.reduce((acc, curr) => acc += curr.items.filter(item => item.complete).length, 0);

    const colorThemes: { [key: string]: string } = {
        'Produce': '#d4edda',
        'Dairy': '#cce5ff',
        'Protein': '#ffeaa7',
        'Pantry': '#fff3cd',
        'Frozen': '#e2e3e5'
    }

    return <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <View style={{ padding: 20, backgroundColor: '#c7edd1', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2d5a27' }}>Shopping Mode</Text>
            <Text style={{ fontSize: 20, marginTop: 5 }}>{complete} / {total} items completed</Text>
            <Text style={{ fontSize: 16, color: '#6c757d', marginTop: 5 }}>Double tap items to mark complete</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
            {list.map((category, i) => (
                <View key={category.name} style={{ backgroundColor: colorThemes[category.name], margin: 10, borderRadius: 10, padding: 20 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 15 }}>{category.name}</Text>
                    {category.items.map((item, j) => (
                        <ShoppingItem key={j} categoryName={category.name} item={item} />
                    ))}
                    {category.items.length === 0 && <Text style={{ fontSize: 18, color: 'gray', fontStyle: 'italic', textAlign: 'center', margin: 20 }}>No items in this category</Text>}
                </View>
            ))}
        </ScrollView>
        <View style={{ padding: 20 }}>
            <Button title="Back to List" onPress={() => router.back()} color="blue" />
        </View>
    </SafeAreaView>
}

const ShoppingItem = ({ categoryName, item }: { categoryName: string; item: { name: string; complete: boolean } }) => {
    const completeItem = useListStore(state => state.completeItem);
    const lastTap = useRef<number>(0);

    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) { // 300ms window for double tap
            completeItem(categoryName, item.name);
        }
        lastTap.current = now;
    };

    return (
        <TouchableOpacity
            onPress={handleDoubleTap}
            style={{
                paddingVertical: 12,
                paddingHorizontal: 8,
                marginVertical: 4,
                backgroundColor: item.complete ? '#28a745' : '#ffffff',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: item.complete ? '#28a745' : '#dee2e6'
            }}
        >
            <Text style={{
                fontSize: 20,
                textDecorationLine: item.complete ? 'line-through' : 'none',
                color: item.complete ? '#ffffff' : '#212529'
            }}>
                • {item.name}
            </Text>
        </TouchableOpacity>
    );
};