import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    skills: { type: String },
    profession: { type: String },
    areaOfVolunteering: { 
        type: String, 
        enum: ["fieldWork", "online", "fundraising", "training"],
        required: true 
    },
    availability: { 
        type: String, 
        enum: ["morning", "afternoon", "evening", "weekend"],
        required: true 
    },
    emergencyContactNumber: { type: String, required: true },
    uploadIdProof: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    volunteerId: { type: String, unique: true }
}, { timestamps: true });

volunteerSchema.pre('save', async function(next) {
    if (!this.volunteerId) {
        const count = await mongoose.model('Volunteer').countDocuments();
        this.volunteerId = `VOL${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

export default mongoose.model("Volunteer", volunteerSchema);