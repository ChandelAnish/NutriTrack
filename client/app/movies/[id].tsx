import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { fetchMovieDetails } from "@/services/api";
import { Movies } from "@/services/useFetch";

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const [movieDetails, setMovieDetails] = useState<Movies | null>(null);
  useEffect(() => {
    const loadMovieDetails = async () => {
      const data = await fetchMovieDetails(id as string)
      // console.log(data)
      setMovieDetails(data)
    };
    loadMovieDetails()
  }, []);
  return (
    <View className="flex-1 bg-background">
      <Text className="text-white">MovieDetails of : {id}</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="h-screen">
          <Image source={{ uri: movieDetails?.image }} className="w-full h-[550px]" resizeMode="cover" />
          <Text className="text-white text-3xl font-bold mt-6 ml-8">{movieDetails?.name}</Text>
          <Text className="text-gray-400 text-md font-bold ml-8">{movieDetails?.theme}</Text>
          <Text className="text-gray-400 text-md font-bold ml-8 mt-4">Overview</Text>
          <Text className="text-gray-300 text-md font-semibold ml-8 mt-2">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque harum voluptate velit voluptates error sunt molestiae, aut incidunt aperiam optio praesentium magnam eius cumque nihil nam nostrum possimus porro expedita. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maiores delectus iste consequuntur impedit debitis, perferendis sequi voluptates veritatis, ab esse repudiandae expedita architecto nesciunt doloribus a numquam? Quasi, voluptates repellendus.
          {"\n\n"}
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque harum voluptate velit voluptates error sunt molestiae, aut incidunt aperiam optio praesentium magnam eius cumque nihil nam nostrum possimus porro expedita.
          </Text>
          <Text className="text-gray-400 text-md font-bold ml-8 mt-4">Genres</Text>
          <Text className="text-gray-300 text-md font-semibold ml-8">{movieDetails?.theme}</Text>
          <TouchableOpacity className="bg-primary absolute left-0 right-0 bottom-1 mx-8 p-3 rounded-lg" onPress={router.back}>
            <Text className="text-white text-center text-lg font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default MovieDetails;

const styles = StyleSheet.create({});
