import { TouchableOpacity, Text } from 'react-native';
import { forwardRef } from 'react';

interface ButtonProps {
    title: string;
    onPress: () => void;
    color: 'green' | 'purple' | 'blue';
    className?: string;
}

const Button = forwardRef<any, ButtonProps>(({ title, onPress, color, className = '' }, ref) => {
    const colorClasses = {
        green: 'border-green-600 text-green-600',
        purple: 'border-purple-600 text-purple-600',
        blue: 'border-blue-600 text-blue-600',
    };

    return (
        <TouchableOpacity
            ref={ref}
            onPress={onPress}
            className={`border-2 p-3 rounded-xl items-center ${colorClasses[color]} ${className}`}
        >
            <Text className={`font-semibold ${colorClasses[color]}`}>{title}</Text>
        </TouchableOpacity>
    );
});

Button.displayName = 'Button';

export default Button;
