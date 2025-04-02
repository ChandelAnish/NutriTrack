import { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export const mealIcons: Record<string, FeatherIconName> = {
  breakfast: 'sunrise',
  morning_snack: 'coffee',
  lunch: 'sun',
  afternoon_snack: 'sunset',
  dinner: 'moon',
};