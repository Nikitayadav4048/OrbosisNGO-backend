import express from "express";
import { 
    createDonationOrder, 
    getUserDonations, 
    verifyDonationPayment,
    getDonorStats,
    getRecentDonations,
    emitDonorUpdate
} from "../../controller/Donation/donation.js";
import { requireAuth } from "../../middleware/auth.js";

const donationRouter = express.Router();

// Create Razorpay order for online payments (bankTransfer, upi)
donationRouter.post("/createOrder", createDonationOrder);

// Verify Razorpay payment
donationRouter.post("/verifyPayment", verifyDonationPayment);


// Get user donations with total amount
donationRouter.get("/user-donations", requireAuth, getUserDonations);

// Real-time donor statistics
donationRouter.get("/donor-stats", requireAuth, getDonorStats);
donationRouter.get("/recent-donations", requireAuth, getRecentDonations);

// Test endpoint to simulate real-time updates
donationRouter.post("/test-update", requireAuth, (req, res) => {
    const io = req.app?.get('io');
    if (io) {
        emitDonorUpdate(io, req.user._id, 'donation-completed', {
            donationId: 'test-' + Date.now(),
            amount: 1000,
            status: 'completed'
        });
    }
    res.json({ success: true, message: 'Test update sent' });
});

export default donationRouter;
