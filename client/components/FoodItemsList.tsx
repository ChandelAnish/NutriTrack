import React from 'react';
import { View, Text } from 'react-native';
import { FoodItem } from '@/types';

interface FoodItemsListProps {
  foods: FoodItem[];
}

const FoodItemsList: React.FC<FoodItemsListProps> = ({ foods }) => {
  return (
    <>
      {foods.map((food, index) => {
        return (
          <View key={index} className="flex-row items-center mb-2">
            <Text className="text-lg mr-2">{food.emoji}</Text>
            <Text className="text-white text-base flex-1">{food.name}</Text>
            <Text className="text-gray-400">{food.portion_size}</Text>
          </View>
        );
      })}
    </>
  );
};

export default FoodItemsList;