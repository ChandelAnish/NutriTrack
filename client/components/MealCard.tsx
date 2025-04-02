import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MealData } from '../Types';
import { mealIcons } from '../Constants';
import FoodItemsList from './FoodItemsList';
import MacroNutrients from './MacroNutrients';

interface MealCardProps {
  mealKey: string;
  meal: MealData;
  isCompleted: boolean;
  onToggleCompletion: (mealKey: string) => void;
}

const MealCard: React.FC<MealCardProps> = ({ 
  mealKey, 
  meal, 
  isCompleted, 
  onToggleCompletion 
}) => {
  const icon = mealIcons[mealKey] || 'disc';
  
  // Format meal key for display
  const formatMealKey = (key: string) => {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <Feather name={icon} size={20} color="#06b6d4" />
        <Text className="text-white text-lg font-bold ml-2">
          {formatMealKey(mealKey)}
        </Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => onToggleCompletion(mealKey)}
        className={`bg-[#1a1933] rounded-xl p-4 border ${isCompleted ? 'border-cyan-500' : 'border-gray-700'}`}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-bold text-lg">{meal.name}</Text>
          <View className={`w-6 h-6 rounded-full ${isCompleted ? 'bg-cyan-500' : 'border border-gray-500'} justify-center items-center`}>
            {isCompleted && <Feather name="check" size={16} color="white" />}
          </View>
        </View>
        
        <View className="mb-3">
          <FoodItemsList foods={meal.foods} />
        </View>
        
        <MacroNutrients meal={meal} />
      </TouchableOpacity>
    </View>
  );
};

export default MealCard;