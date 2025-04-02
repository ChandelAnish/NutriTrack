import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { getTrendingMovies } from "@/services/appWrite";
import useFetch, { Movies } from "@/services/useFetch";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";

export default function Index() {
  // const [trendingMovies, setTrendingMovies] = useState<Movies[] | undefined>(
  //   undefined
  // );

  // useEffect(() => {
  //   const loadTrendingMovies = async () => {
  //     const data = await getTrendingMovies();
  //     setTrendingMovies(data);
  //     // console.log(data)
  //   };
  //   loadTrendingMovies();
  // }, []);

  // const router = useRouter();
  // const { movies, loading, error } = useFetch<Movies[]>();
  // // console.log(movies);

  return (
    <View className="flex-1 bg-background">

    </View>
  );
}
