import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { Picker as RNPicker } from '@react-native-picker/picker';

// For Android compatibility
const Picker = Platform.select({
  ios: RNPicker,
  android: RNPicker,
  default: RNPicker,
});

type Gender = 'male' | 'female' | 'other';

interface UserProfile {
  email: string; // Changed from name to email
  age: number;
  weight: number;
  targetWeight: number;
  height: number;
  gender: Gender;
  activityLevel: string;
  dietaryPreferences: string[];
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
  email: '', // Changed from name to email
  age: 0,
  weight: 0,
  targetWeight: 0,
  height: 0,
  gender: 'male',
  activityLevel: 'Sedentary',
  dietaryPreferences: [],
  allergies: [],
  profilePhoto: 'https://randomuser.me/api/portraits/lego/1.jpg', // Default avatar
};

const STORAGE_KEY = 'userData';

const safeParseNumber = (text: string): number => {
  const num = parseInt(text, 10);
  return isNaN(num) ? 0 : Math.max(0, num);
};

const ProfileSection = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Define theme colors
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

  const handleSave = (): void => {
    saveProfile(profile);
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    loadProfile(); // Reload the saved profile
    setIsEditing(false);
  };

  const addDietaryPreference = (): void => {
    if (newPreference.trim() && !profile.dietaryPreferences.includes(newPreference)) {
      const updatedProfile = {
        ...profile,
        dietaryPreferences: [...profile.dietaryPreferences, newPreference.trim()],
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

  const removeItem = (list: 'dietaryPreferences' | 'allergies', item: string): void => {
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
      <View style={[styles.container, styles.centered, {backgroundColor: colors.background}]}>
        <Text style={[styles.loadingText, {color: colors.text}]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: profile.profilePhoto }} 
            style={[styles.avatar, {borderColor: colors.accent}]}
          />
          {isEditing && (
            <TouchableOpacity style={[styles.editAvatarButton, {backgroundColor: colors.cardBackground, borderColor: colors.border}]}>
              <Feather name="edit" size={16} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.editButton, {backgroundColor: colors.cardBackground, borderColor: colors.border}]}
          onPress={() => isEditing ? handleCancel() : setIsEditing(true)}
        >
          <Text style={[styles.editButtonText, {color: colors.accent}]}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Text>
          <Feather 
            name={isEditing ? "x" : "edit-3"} 
            size={16} 
            color={colors.accent} 
            style={styles.editIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Personal Information Section */}
      <View style={[styles.section, {backgroundColor: colors.cardBackground, borderColor: colors.border}]}>
        <View style={styles.sectionHeader}>
          <Feather name="user" size={20} color={colors.accent} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Personal Information</Text>
        </View>
        
        <ProfileField 
          label="Email"
          value={profile.email || ''}
          editable={isEditing}
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
            <Picker
              selectedValue={profile.gender || 'male'}
              onValueChange={(value: string) => 
                setProfile({...profile, gender: value as Gender})
              }
              style={[styles.picker, {backgroundColor: colors.inputBackground, color: colors.text}]}
              dropdownIconColor={colors.accent}
            >
              <Picker.Item label="Male" value="male" style={{color: colors.text}} />
              <Picker.Item label="Female" value="female" style={{color: colors.text}} />
              <Picker.Item label="Other" value="other" style={{color: colors.text}} />
            </Picker>
          )}
        />
      </View>

      {/* Body Metrics Section */}
      <View style={[styles.section, {backgroundColor: colors.cardBackground, borderColor: colors.border}]}>
        <View style={styles.sectionHeader}>
          <Feather name="activity" size={20} color={colors.accent} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Body Metrics</Text>
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
      <View style={[styles.section, {backgroundColor: colors.cardBackground, borderColor: colors.border}]}>
        <View style={styles.sectionHeader}>
          <Feather name="bar-chart-2" size={20} color={colors.accent} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Activity Level</Text>
        </View>
        <ProfileField 
          label="Activity"
          value={profile.activityLevel || 'Sedentary'}
          editable={isEditing}
          isDarkMode={isDarkMode}
          colors={colors}
          renderEdit={() => (
            <Picker
              selectedValue={profile.activityLevel || 'Sedentary'}
              onValueChange={(value) => setProfile({...profile, activityLevel: value})}
              style={[styles.picker, {backgroundColor: colors.inputBackground, color: colors.text}]}
              dropdownIconColor={colors.accent}
            >
              {ACTIVITY_LEVELS.map(level => (
                <Picker.Item key={level} label={level} value={level} style={{color: colors.text}} />
              ))}
            </Picker>
          )}
        />
      </View>

      {/* Dietary Preferences Section */}
      <View style={[styles.section, {backgroundColor: colors.cardBackground, borderColor: colors.border}]}>
        <View style={styles.sectionHeader}>
          <Feather name="heart" size={20} color={colors.accent} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Dietary Preferences</Text>
        </View>
        {(profile.dietaryPreferences?.length === 0 || !profile.dietaryPreferences) && !isEditing && (
          <Text style={[styles.emptyText, {color: colors.subText}]}>No preferences added</Text>
        )}
        {profile.dietaryPreferences?.map((item, index) => (
          <View key={index} style={[styles.tag, {backgroundColor: isDarkMode ? '#164e63' : '#e0f2fe'}]}>
            <Text style={{color: isDarkMode ? '#7dd3fc' : '#0369a1', marginRight: 4}}>{item}</Text>
            {isEditing && (
              <TouchableOpacity onPress={() => removeItem('dietaryPreferences', item)}>
                <Feather name="x" size={16} color={isDarkMode ? '#7dd3fc' : '#f87171'} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {isEditing && (
          <View style={styles.addItemContainer}>
            <TextInput
              style={[styles.addItemInput, {
                backgroundColor: colors.inputBackground, 
                borderColor: colors.border,
                color: colors.text
              }]}
              value={newPreference}
              onChangeText={setNewPreference}
              placeholder="Add new preference"
              placeholderTextColor={colors.subText}
              onSubmitEditing={addDietaryPreference}
            />
            <TouchableOpacity 
              style={[styles.addButton, {backgroundColor: isDarkMode ? '#164e63' : '#e0f2fe'}]} 
              onPress={addDietaryPreference}
            >
              <Feather name="plus" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Allergies Section */}
      <View style={[styles.section, {backgroundColor: colors.cardBackground, borderColor: colors.border}]}>
        <View style={styles.sectionHeader}>
          <Feather name="alert-triangle" size={20} color={colors.accent} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Allergies</Text>
        </View>
        {(profile.allergies?.length === 0 || !profile.allergies) && !isEditing && (
          <Text style={[styles.emptyText, {color: colors.subText}]}>No allergies added</Text>
        )}
        {profile.allergies?.map((item, index) => (
          <View key={index} style={[styles.tag, styles.allergyTag, {
            backgroundColor: isDarkMode ? '#602A2A' : '#fee2e2'
          }]}>
            <Text style={{color: isDarkMode ? '#fca5a5' : '#b91c1c', marginRight: 4}}>{item}</Text>
            {isEditing && (
              <TouchableOpacity onPress={() => removeItem('allergies', item)}>
                <Feather name="x" size={16} color={isDarkMode ? '#fca5a5' : '#f87171'} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {isEditing && (
          <View style={styles.addItemContainer}>
            <TextInput
              style={[styles.addItemInput, {
                backgroundColor: colors.inputBackground, 
                borderColor: colors.border,
                color: colors.text
              }]}
              value={newAllergy}
              onChangeText={setNewAllergy}
              placeholder="Add new allergy"
              placeholderTextColor={colors.subText}
              onSubmitEditing={addAllergy}
            />
            <TouchableOpacity 
              style={[styles.addButton, {backgroundColor: isDarkMode ? '#164e63' : '#e0f2fe'}]} 
              onPress={addAllergy}
            >
              <Feather name="plus" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Save Button */}
      {isEditing && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={[styles.saveButton, {backgroundColor: colors.accent}]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
            <Feather name="check" size={20} color="white" style={styles.saveIcon} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
  <View style={styles.field}>
    <Text style={[styles.fieldLabel, {color: colors.subText}]}>{label}</Text>
    {editable ? (
      renderEdit ? (
        renderEdit()
      ) : (
        <TextInput
          style={[styles.fieldInput, {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text
          }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={colors.subText}
        />
      )
    ) : (
      <Text style={[styles.fieldValue, {color: colors.text}]}>{value}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontWeight: '600',
    marginRight: 4,
  },
  editIcon: {
    marginLeft: 4,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    paddingVertical: 8,
  },
  fieldInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  tagText: {
    marginRight: 4,
  },
  allergyTag: {
    // Styles in render with dark mode colors
  },
  allergyTagText: {
    marginRight: 4,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonContainer: {
    marginVertical: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  saveIcon: {
    marginLeft: 4,
  },
});

export default ProfileSection;