import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection FAILED: ", error.message);
    if (error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
      console.error("TIP: This usually means the DNS lookup failed or your IP is NOT whitelisted in MongoDB Atlas.");
    }
    process.exit(1);
  }
};

export default connectDB;
