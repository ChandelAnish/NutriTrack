const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!; // The ! at the end of the expression is called the non-null assertion operator in TypeScript. It tells the TypeScript compiler that you, as the developer, are certain that the value is not null or undefined, even if TypeScript cannot infer that from the code.
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

import { Client, Account, ID, Databases, Query } from "react-native-appwrite";
import { Movies } from "./useFetch";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movies) => {
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
      console.log("document updated");
    } else {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        id: movie.id,
        name: movie.name,
        theme: movie.theme,
        image: movie.image,
        count: 1,
      });
      console.log("document created");
    }
  } catch (error) {
    console.log(error);
  }
};

export const getTrendingMovies = async ():Promise<Movies[] | undefined> => {
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.limit(5),
        Query.orderDesc('count'),
      ]);
      return result.documents as unknown as Movies[]
      /*
            1. result.documents → This might not be Movies[] directly. TypeScript isn't sure of its exact type.
            2. as unknown → Converts it into a general type (unknown), meaning "trust me, this is something, but I won’t specify what."
            3. as Movies[] → Now, we tell TypeScript "Actually, treat this as an array of Movies."
            4. Instead of forcing a direct cast (as Movies[]), using as unknown first makes TypeScript more flexible.
      */
  } catch (error) {
    console.log("Error: ",error)
  }
};
