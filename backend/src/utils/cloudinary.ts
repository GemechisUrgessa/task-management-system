import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ||"dw5hts1jq" ,
    api_key: process.env.CLOUDINARY_API_KEY ||"342699666849659" ,
    api_secret: process.env.CLOUDINARY_API_SECRET || "QMY5rZRJ8p9zgpXGh7G4Xr8pryI",
});

export default cloudinary;