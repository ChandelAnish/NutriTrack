import React from 'react';
import { View, Text } from 'react-native';
import { MealData } from '../Types';

interface MacroNutrientsProps {
  meal: MealData;
}

const MacroNutrients: React.FC<MacroNutrientsProps> = ({ meal }) => {
  return (
    <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-700">
      <View className="items-center">
        <Text className="text-cyan-500 font-bold">{meal.protein}g</Text>
        <Text className="text-gray-400 text-xs">Protein</Text>
      </View>
      <View className="items-center">
        <Text className="text-cyan-500 font-bold">{meal.carbs}g</Text>
        <Text className="text-gray-400 text-xs">Carbs</Text>
      </View>
      <View className="items-center">
        <Text className="text-cyan-500 font-bold">{meal.fats}g</Text>
        <Text className="text-gray-400 text-xs">Fats</Text>
      </View>
      <View className="items-center">
        <Text className="text-cyan-500 font-bold">{meal.calories}</Text>
        <Text className="text-gray-400 text-xs">Calories</Text>
      </View>
    </View>
  );
};

export default MacroNutrients;