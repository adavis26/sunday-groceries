import { ScrollView, View, Text, SafeAreaView } from "react-native";
import { useListStore } from "@/store/useStore";
import { useRouter } from 'expo-router';
import Button from '@/components/Button';

export default function Pantry() {
    const pantry = useListStore(state => state.pantry);
    const router = useRouter();

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-white">
            <View className="p-6">
                <Text className="text-2xl font-bold">Pantry</Text>
                <Text className="text-gray-600 mt-2">Items you've gotten before</Text>
                <Button title="Back to Home" onPress={() => router.back()} color="blue" className="mt-4" />
            </View>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, padding: 20 }}
            >
                {pantry.length === 0 ? (
                    <Text className="text-gray-500">No items in pantry yet. Complete items and refresh the list to add them here.</Text>
                ) : (
                    pantry.map((item, i) => (
                        <View key={i} className="p-3 bg-gray-50 rounded-lg mb-2">
                            <Text className="text-lg">{item}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
