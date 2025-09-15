import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import { connectDB } from "../config/connectDB.js";
import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";

dotenv.config();

const uploadImage = (filePath, folder) => {
  return cloudinary.uploader.upload(filePath, { folder });
};

const migrate = async () => {
  await connectDB();
  const uploadsDir = path.resolve("uploads");

  const hotels = await Hotel.find();
  for (const hotel of hotels) {
    if (hotel.image && !hotel.image.startsWith("http")) {
      const localPath = path.join(uploadsDir, hotel.image);
      if (fs.existsSync(localPath)) {
        const uploaded = await uploadImage(localPath, "hotels");
        hotel.image = uploaded.secure_url;
        await hotel.save();
        fs.unlinkSync(localPath);
      }
    }
  }

  const rooms = await Room.find();
  for (const room of rooms) {
    const newImages = [];
    let changed = false;
    for (const img of room.images) {
      if (img && !img.startsWith("http")) {
        const localPath = path.join(uploadsDir, img);
        if (fs.existsSync(localPath)) {
          const uploaded = await uploadImage(localPath, "rooms");
          newImages.push(uploaded.secure_url);
          fs.unlinkSync(localPath);
          changed = true;
        }
      } else {
        newImages.push(img);
      }
    }
    if (changed) {
      room.images = newImages;
      await room.save();
    }
  }

  console.log("Migration completed");
  process.exit(0);
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
