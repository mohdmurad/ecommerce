import mongoose from 'mongoose'
import colors from "colors"

const connectDB = async()=>{
try {
    const conn  = await mongoose.connect(process.env.MONGO_URL)
    console.log(`connected to mongodb ${conn.connection.host} successfully`)
} catch (error) {
    console.log(`error in mongodb ${error.message}`.bgRed.white)
}
}

export default connectDB