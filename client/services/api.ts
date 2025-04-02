import axios from "axios"

export const fetchMovieDetails = async(id: string)=>{
    try {
        const {data} = await axios.get(`http://192.168.29.11:5000/movies/${id}`)
        return data
    } catch (error) {
        console.log("Error: ",error)
    }

}