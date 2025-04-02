import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <View className="h-2 bg-gray-700 rounded-full w-full my-2">
    <View 
      className="h-2 bg-cyan-500 rounded-full" 
      style={{ width: `${progress}%` }} 
    />
  </View>
);

export default ProgressBar;