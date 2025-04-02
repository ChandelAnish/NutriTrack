import axios from "axios";
import { useEffect, useState } from "react";

export interface Movies {
  id: string;
  name: string;
  theme: string;
  image: string;
}

const fetchMovies = async (searchQuery: string) => {
  const query = parseInt(searchQuery);
  if (query) {
    try {
      const { data } = await axios.get(
        `http://192.168.29.11:5000/movies/${query}`
      );
      return [data];
    } catch (error) {
      console.error("Error :", error);
      return [];
    }
  } else if (searchQuery && !query) {
    return [];
  } else {
    const { data } = await axios.get(`http://192.168.29.11:5000/movies`);
    return data;
  }
};

const useFetch = <T>(autoFetch = true, searchQuery = "") => {
  const [movies, setMovies] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setMovies(await fetchMovies(searchQuery));
    } catch (error) {
      setError(error instanceof Error ? error : new Error("An error occured"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMovies(null);
    setLoading(false);
    setError(null);
  };

  useEffect(() => {
    if (autoFetch) fetchData();
  }, []);

  return { movies, loading, error, refetch: fetchData, reset };
};

export default useFetch;
