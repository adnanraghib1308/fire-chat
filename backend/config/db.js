const mongoose =  require('mongoose');

const connectDB = async () => {
    try {
        const conn = mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log(`Mongo DB connect successfully`)
    } catch (error) {
        console.log("Error :" + error.message);
        process.exit();
    }
}

module.exports = {connectDB};