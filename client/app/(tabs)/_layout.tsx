import { StyleSheet, Text, View } from "react-native";
import React, { Children, ReactNode } from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          // tabBarItemStyle is a style property inside screenOptions in Tabs (from expo-router). It allows you to customize the style of 'individual' tab items in the bottom navigation bar.
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          // backgroundColor:'red',
          // margin:10,
        },
        tabBarStyle: {
          // this affects the tab bar style
          backgroundColor: "#0f0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          borderWidth: 1,
          borderColor: "#0f0D23",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="home"
              size={24}
              color={focused ? "#00BCD4" : "grey"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mealPlan"
        options={{
          title: "Meal-Plan",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="fast-food"
              size={24}
              color={focused ? "#00BCD4" : "grey"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="user"
              size={24}
              color={focused ? "#00BCD4" : "grey"}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({});
