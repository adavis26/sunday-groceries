import { Colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: Colors.light.tint }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'List',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => <FontAwesome size={28} name="list-ul" color={focused ? Colors.light.tint : ''} />,
                }}
            />
            <Tabs.Screen
                name="shopping"
                options={{
                    title: 'Shop',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => <FontAwesome size={28} name="shopping-cart" color={focused ? Colors.light.tint : ''} />,
                }}
            />
        </Tabs>
    );
}