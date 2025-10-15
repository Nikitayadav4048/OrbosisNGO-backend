import express from "express";
import { registerMember, getAllMembers, updateMemberStatus } from "../../controller/Member/member.js";

const router = express.Router();

router.post("/register", registerMember);
router.get("/all", getAllMembers);
router.put("/status/:id", updateMemberStatus);

export default router;