import express from "express";
import { registerBeneficiary, getAllBeneficiaries, updateBeneficiaryStatus } from "../../controller/Beneficiary/beneficiary.js";

const router = express.Router();

router.post("/register", registerBeneficiary);
router.get("/all", getAllBeneficiaries);
router.put("/status/:id", updateBeneficiaryStatus);

export default router;