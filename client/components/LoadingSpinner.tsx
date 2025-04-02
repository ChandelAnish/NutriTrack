import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

const LoadingSpinner: React.FC = () => {
  return (
    <View className="flex-1 bg-[#0f0D23] justify-center items-center">
      <ActivityIndicator size="large" color="#06b6d4" />
      <Text className="text-white mt-4">Loading your meal plan...</Text>
    </View>
  );
};

export default LoadingSpinner;