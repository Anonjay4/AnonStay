import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";
import { connectDB } from "../config/connectDB.js";

dotenv.config();
connectDB();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadExistingImages = async () => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
        console.log("No uploads directory found");
        return;
    }

    const files = fs.readdirSync(uploadDir);
    for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const { secure_url } = await cloudinary.uploader.upload(filePath, {
            folder: "AnonStay",
        });

        await Hotel.updateMany({ image: file }, { image: secure_url });
        await Room.updateMany({ images: file }, { $set: { "images.$": secure_url } });
        console.log(`Uploaded ${file}`);
    }
    console.log("Migration complete");
};

uploadExistingImages()
    .then(() => process.exit())
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

