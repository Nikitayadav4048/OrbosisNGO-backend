import express from "express";
import { registerVolunteer, getAllVolunteers, updateVolunteerStatus } from "../../controller/Volunteer/volunteer.js";

const router = express.Router();

router.post("/register", registerVolunteer);
router.get("/all", getAllVolunteers);
router.put("/status/:id", updateVolunteerStatus);

export default router;