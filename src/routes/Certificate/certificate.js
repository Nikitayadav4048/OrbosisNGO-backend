import express from "express";
import { generateCertificate, getAllCertificates, verifyCertificate } from "../../controller/Certificate/certificate.js";

const router = express.Router();

router.post("/generate", generateCertificate);
router.get("/all", getAllCertificates);
router.get("/verify/:id", verifyCertificate);

export default router;