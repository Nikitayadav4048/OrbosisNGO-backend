import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    area: { type: String },
    state: { type: String },
    pinCode: { type: String },
    typesOfSupport: [{ 
        type: String, 
        enum: ["training", "education", "health", "livelihood"] 
    }],
    governmentIdProof: { type: String },
    specialRequirement: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    memberId: { type: String, unique: true }
}, { timestamps: true });

memberSchema.pre('save', async function(next) {
    if (!this.memberId) {
        const count = await mongoose.model('Member').countDocuments();
        this.memberId = `MEM${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

export default mongoose.model("Member", memberSchema);