const MONGODB_URL = process.env.MONGODB_URL;

console.log(MONGODB_URL);

const connectToMongoDB = async (mongoose) => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("successfully connected to mongo");

    mongoose.connection.on("connected", () => {
      console.log("successfully connected to mongo");
    });

    mongoose.connection.on("error", () => {
      console.log("not connected to mongodb");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

module.exports = connectToMongoDB;
