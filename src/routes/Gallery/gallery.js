import express from "express";
import { createGallery, getAllGallery, deleteGallery } from "../../controller/Gallery/gallery.js";
import { cloudinaryImageUpload } from "../../utils/multer.js";
import { requireAdminOrVolunteer, requireAuth } from "../../middleware/auth.js";

const galleryRouter = express.Router();

// Create gallery with multiple image uploads
galleryRouter.post("/createGallery", requireAuth, requireAdminOrVolunteer, cloudinaryImageUpload.array('galleryImages', 10), createGallery);

// Get all galleries with pagination
galleryRouter.get("/getAllGallery", getAllGallery);

// Delete a gallery by id (Admin or Volunteer)
galleryRouter.delete("/deleteGallery/:id", requireAuth, requireAdminOrVolunteer, deleteGallery);

export default galleryRouter; 