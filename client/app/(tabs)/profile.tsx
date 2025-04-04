import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  useColorScheme,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { Picker as RNPicker } from '@react-native-picker/picker';
import axios from 'axios';
import { getMealPlanData } from '@/api/api';

// For Android compatibility
const Picker = Platform.select({
  ios: RNPicker,
  android: RNPicker,
  default: RNPicker,
});

type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  email: string;
  age: number;
  weight: number;
  targetWeight: number;
  height: number;
  gender: Gender;
  daily_physical_activity: string;
  dietary_preferences: string[];
  allergies: string[];
  profilePhoto?: string;
}

const ACTIVITY_LEVELS = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
  'Extremely Active'
];

const DEFAULT_PROFILE: UserProfile = {
  email: '',
  age: 0,
  weight: 0,
  targetWeight: 0,
  height: 0,
  gender: 'male',
  daily_physical_activity: 'Sedentary',
  dietary_preferences: [],
  allergies: [],
  profilePhoto: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
};

const STORAGE_KEY = 'userData';

const safeParseNumber = (text: string): number => {
  const num = parseInt(text, 10);
  return isNaN(num) ? 0 : Math.max(0, num);
};

const ProfileSection = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Define theme colors based on dark/light mode
  const colors = {
    background: isDarkMode ? '#0f0D23' : '#f9fafb',
    cardBackground: isDarkMode ? '#1a1830' : 'white',
    text: isDarkMode ? 'white' : '#1f2937',
    subText: isDarkMode ? '#a0aec0' : '#6b7280',
    border: isDarkMode ? '#2d3748' : '#e5e7eb',
    accent: '#06b6d4', // Cyan-500 for both modes
    inputBackground: isDarkMode ? '#2d3748' : '#f9fafb',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [newPreference, setNewPreference] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Load profile data from AsyncStorage on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedProfile !== null) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSave = async () => {
    console.log("🚀 handleSave triggered!");
    setIsSaving(true);
  
    try {
      saveProfile(profile);
      console.log("Profile data before API call:", profile);
      
      if (!profile.email) {
        console.error("❌ Error: Email is missing!");
        setIsSaving(false);
        return;
      }
  
      const { data } = await axios.put(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/user/edit/${profile.email}`,
        profile,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if(data){
        const mealPlan = await getMealPlanData(data.email, profile, true);
        await AsyncStorage.setItem("meal_plan_data", JSON.stringify(mealPlan));
        console.log("✅ UPDATED:", data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("❌ Error updating user:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = (): void => {
    loadProfile(); // Reload the saved profile
    setIsEditing(false);
  };

  const addDietaryPreference = (): void => {
    if (newPreference.trim() && !profile.dietary_preferences.includes(newPreference)) {
      const updatedProfile = {
        ...profile,
        dietary_preferences: [...profile.dietary_preferences, newPreference.trim()],
      };
      setProfile(updatedProfile);
      setNewPreference('');
    }
  };

  const addAllergy = (): void => {
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy)) {
      const updatedProfile = {
        ...profile,
        allergies: [...profile.allergies, newAllergy.trim()],
      };
      setProfile(updatedProfile);
      setNewAllergy('');
    }
  };

  const removeItem = (list: 'dietary_preferences' | 'allergies', item: string): void => {
    setProfile({
      ...profile,
      [list]: profile[list].filter(i => i !== item),
    });
  };

  const handleNumberChange = (field: keyof UserProfile, text: string): void => {
    setProfile({
      ...profile,
      [field]: safeParseNumber(text)
    });
  };

  const handleTextChange = (field: keyof UserProfile, text: string): void => {
    setProfile({
      ...profile,
      [field]: text
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{backgroundColor: colors.background}}>
        <Text className="text-base" style={{color: colors.text}}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{backgroundColor: colors.background}}
    >
      <ScrollView 
        className="flex-1 px-4 pb-40"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={keyboardVisible ? {paddingBottom: 200} : {}}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <View className="relative">
            <Image 
              source={{ uri: 'https://static.vecteezy.com/system/resources/previews/023/465/688/non_2x/contact-dark-mode-glyph-ui-icon-address-book-profile-page-user-interface-design-white-silhouette-symbol-on-black-space-solid-pictogram-for-web-mobile-isolated-illustration-vector.jpg' }} 
              className="w-20 h-20 rounded-full border-2"
              style={{borderColor: colors.accent}}
            />
            {isEditing && (
              <TouchableOpacity 
                className="absolute right-0 bottom-0 rounded-xl p-1 border"
                style={{backgroundColor: colors.cardBackground, borderColor: colors.border}}
              >
                <Feather name="edit" size={16} color={colors.accent} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            className="flex-row items-center px-3 py-2 rounded-full border"
            style={{backgroundColor: colors.cardBackground, borderColor: colors.border}}
            onPress={() => isEditing ? handleCancel() : setIsEditing(true)}
          >
            <Text className="font-semibold mr-1" style={{color: colors.accent}}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Text>
            <Feather 
              name={isEditing ? "x" : "edit-3"} 
              size={16} 
              color={colors.accent} 
              className="ml-1"
            />
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View 
          className="rounded-xl mb-4 p-4 shadow-sm"
          style={{backgroundColor: colors.cardBackground, borderColor: colors.border}}
        >
          <View className="flex-row items-center mb-3">
            <Feather name="user" size={20} color={colors.accent} />
            <Text className="text-lg font-semibold ml-2" style={{color: colors.text}}>Personal Information</Text>
          </View>
          
          <ProfileField
            label="Email"
            value={profile.email || ''}
            editable={false}
            onChangeText={(text: string) => handleTextChange('email', text)}
            keyboardType="email-address"
            isDarkMode={isDarkMode}
            colors={colors}
          />
          
          <ProfileField 
            label="Age"
            value={profile.age?.toString() || '0'}
            editable={isEditing}
            keyboardType="numeric"
            onChangeText={(text: string) => handleNumberChange('age', text)}
            isDarkMode={isDarkMode}
            colors={colors}
          />
          
          <ProfileField 
            label="Gender"
            value={profile.gender || 'male'}
            editable={isEditing}
            isDarkMode={isDarkMode}
            colors={colors}
            renderEdit={() => (
              <View className="border rounded-lg" style={{borderColor: colors.border, backgroundColor: colors.inputBackground}}>
                <Picker
                  selectedValue={profile.gender || 'male'}
                  onValueChange={(value: string) => 
                    setProfile({...profile, gender: value as Gender})
                  }
                  className="text-base"
                  dropdownIconColor={colors.accent}
                  style={{color: colors.text}}
                >
                  <Picker.Item label="Male" value="male" style={{color: colors.text}} />
                  <Picker.Item label="Female" value="female" style={{color: colors.text}} />
                  <Picker.Item label="Other" value="other" style={{color: colors.text}} />
                </Picker>
              </View>
            )}
          />
        </View>

        {/* Body Metrics Section */}
        <View 
          className="rounded-xl mb-4 p-4 shadow-sm"
          style={{backgroundColor: colors.cardBackground, borderColor: colors.border}}
        >
          <View className="flex-row items-center mb-3">
            <Feather name="activity" size={20} color={colors.accent} />
            <Text className="text-lg font-semibold ml-2" style={{color: colors.text}}>Body Metrics</Text>
          </View>
          
          <ProfileField 
            label="Height (cm)"
            value={profile.height?.toString() || '0'}
            editable={isEditing}
            keyboardType="numeric"
            onChangeText={(text: string) => handleNumberChange('height', text)}
            isDarkMode={isDarkMode}
            colors={colors}
          />
          
          <ProfileField 
            label="Weight (kg)"
            value={profile.weight?.toString() || '0'}
            editable={isEditing}
            keyboardType="numeric"
            onChangeText={(text: string) => handleNumberChange('weight', text)}
            isDarkMode={isDarkMode}
            colors={colors}
          />
          
          <ProfileField 
            label="Target Weight (kg)"
            value={profile.targetWeight?.toString() || '0'}
            editable={isEditing}
            keyboardType="numeric"
            onChangeText={(text: string) => handleNumberChange('targetWeight', text)}
            isDarkMode={isDarkMode}
            colors={colors}
          />
        </View>

        {/* Activity Level Section */}
        <View 
          className="rounded-xl mb-4 p-4 shadow-sm"
          style={{backgroundColor: colors.cardBackground, borderColor: colors.border}}
        >
          <View className="flex-row items-center mb-3">
            <Feather name="bar-chart-2" size={20} color={colors.accent} />
            <Text className="text-lg font-semibold ml-2" style={{color: colors.text}}>Activity Level</Text>
          </View>
          <ProfileField 
            label="Activity"
            value={profile.daily_physical_activity || 'Sedentary'}
            editable={isEditing}
            isDarkMode={isDarkMode}
            colors={colors}
            renderEdit={() => (
              <View className="border rounded-lg" style={{borderColor: colors.border, backgroundColor: colors.inputBackground}}>
                <Picker
                  selectedValue={profile.daily_physical_activity || 'Sedentary'}
                  onValueChange={(value) => setProfile({...profile, daily_physical_activity: value})}
                  className="text-base"
                  dropdownIconColor={colors.accent}
                  style={{color: colors.text}}
                >
                  {ACTIVITY_LEVELS.map(level => (
                    <Picker.Item key={level} label={level} value={level} style={{color: "black"}} />
                  ))}
                </Picker>
              </View>
            )}
          />
        </View>

        {/* Dietary Preferences Section */}
        <View 
          className="rounded-xl mb-4 p-4 shadow-sm"
          style={{backgroundColor: colors.cardBackground, borderColor: colors.border}}
        >
          <View className="flex-row items-center mb-3">
            <Feather name="heart" size={20} color={colors.accent} />
            <Text className="text-lg font-semibold ml-2" style={{color: colors.text}}>Dietary Preferences</Text>
          </View>
          {(profile.dietary_preferences?.length === 0 || !profile.dietary_preferences) && !isEditing && (
            <Text className="text-sm italic" style={{color: colors.subText}}>No preferences added</Text>
          )}
          <View className="flex-row flex-wrap">
            {profile.dietary_preferences?.map((item, index) => (
              <View 
                key={index} 
                className="flex-row items-center px-3 py-1.5 rounded-2xl mr-2 mb-2"
                style={{backgroundColor: isDarkMode ? '#164e63' : '#e0f2fe'}}
              >
                <Text style={{color: isDarkMode ? '#7dd3fc' : '#0369a1', marginRight: 4}}>{item}</Text>
                {isEditing && (
                  <TouchableOpacity onPress={() => removeItem('dietary_preferences', item)}>
                    <Feather name="x" size={16} color={isDarkMode ? '#7dd3fc' : '#f87171'} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {isEditing && (
            <View className="flex-row items-center mt-2">
              <TextInput
                className="flex-1 border rounded-lg p-2.5 mr-2"
                style={{
                  backgroundColor: colors.inputBackground, 
                  borderColor: colors.border,
                  color: colors.text
                }}
                value={newPreference}
                onChangeText={setNewPreference}
                placeholder="Add new preference"
                placeholderTextColor={colors.subText}
                onSubmitEditing={addDietaryPreference}
              />
              <TouchableOpacity 
                className="w-10 h-10 rounded-full justify-center items-center"
                style={{backgroundColor: isDarkMode ? '#164e63' : '#e0f2fe'}}
                onPress={addDietaryPreference}
              >
                <Feather name="plus" size={20} color={colors.accent} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Allergies Section */}
        <View 
          className="rounded-xl p-4 shadow-sm mb-32"
          style={{backgroundColor: colors.cardBackground, borderColor: colors.border}}
        >
          <View className="flex-row items-center mb-3">
            <Feather name="alert-triangle" size={20} color={colors.accent} />
            <Text className="text-lg font-semibold ml-2" style={{color: colors.text}}>Allergies</Text>
          </View>
          {(profile.allergies?.length === 0 || !profile.allergies) && !isEditing && (
            <Text className="text-sm italic" style={{color: colors.subText}}>No allergies added</Text>
          )}
          <View className="flex-row flex-wrap">
            {profile.allergies?.map((item, index) => (
              <View 
                key={index} 
                className="flex-row items-center px-3 py-1.5 rounded-2xl mr-2 mb-2"
                style={{backgroundColor: isDarkMode ? '#602A2A' : '#fee2e2'}}
              >
                <Text style={{color: isDarkMode ? '#fca5a5' : '#b91c1c', marginRight: 4}}>{item}</Text>
                {isEditing && (
                  <TouchableOpacity onPress={() => removeItem('allergies', item)}>
                    <Feather name="x" size={16} color={isDarkMode ? '#fca5a5' : '#f87171'} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {isEditing && (
            <View className="flex-row items-center mt-2">
              <TextInput
                className="flex-1 border rounded-lg p-2.5 mr-2"
                style={{
                  backgroundColor: colors.inputBackground, 
                  borderColor: colors.border,
                  color: colors.text
                }}
                value={newAllergy}
                onChangeText={setNewAllergy}
                placeholder="Add new allergy"
                placeholderTextColor={colors.subText}
                onSubmitEditing={addAllergy}
              />
              <TouchableOpacity 
                className="w-10 h-10 rounded-full justify-center items-center"
                style={{backgroundColor: isDarkMode ? '#164e63' : '#e0f2fe'}}
                onPress={addAllergy}
              >
                <Feather name="plus" size={20} color={colors.accent} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Save Button */}
        {isEditing && (
          <View className="my-6 mb-32">
            <TouchableOpacity 
              className="flex-row items-center justify-center py-3.5 rounded-lg"
              style={{backgroundColor: colors.accent}}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text className="text-white text-base font-semibold mr-2">Save Changes</Text>
                  <Feather name="check" size={20} color="white" className="ml-1" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Define the ProfileField component prop types
interface ProfileFieldProps {
  label: string;
  value: string;
  editable: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  renderEdit?: () => React.ReactNode;
  isDarkMode: boolean;
  colors: {
    text: string;
    subText: string;
    border: string;
    inputBackground: string;
    [key: string]: string;
  };
}

const ProfileField = ({ 
  label, 
  value, 
  editable, 
  onChangeText, 
  keyboardType = 'default', 
  renderEdit,
  colors
}: ProfileFieldProps) => (
  <View className="mb-3">
    <Text className="text-sm mb-1" style={{color: colors.subText}}>{label}</Text>
    {editable ? (
      renderEdit ? (
        renderEdit()
      ) : (
        <TextInput
          className="text-base border rounded-lg p-2.5"
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text
          }}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={colors.subText}
        />
      )
    ) : (
      <Text className="text-base py-2" style={{color: colors.text}}>{value}</Text>
    )}
  </View>
);

export default ProfileSection;