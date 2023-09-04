const mongoose=require('mongoose')
const colors=require('colors')

const connectDB=async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log(`Connect To Mongodb Database ${mongoose.connection.host}`);
    } catch (error) {
        console.log(`Mongodb database Error${error}`.bgMagenta.white)
    }
}

module.exports=connectDB