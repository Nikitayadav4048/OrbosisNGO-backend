import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    // for member

    fullName: {
        type: String,
    },

    gender: {
        type: String
    },

    age: {
        type: Number
    },

    contactNumber: {
        type: String
    },

    address: {
        type: String
    },

    area: {
        type: String
    },

    state: {
        type : String
    },

    pinCode: {
        type: String
    },

    TypesOfSupport: [{
        type: String,
        enum: ["training", "education", "health", "livelihood"]
    }],

    govermentIdProof: {
        type: String
    },

    specialRequirement: {
        type: String
    },

    email: {
        type: String,
    },
    password: {
        type: String,
    },

    dob: {
        type: String,
    },

    memberId: {
        type: String,
    },

    role: {
        type: String,
        enum: ["admin", "volunteer", "donor", "member"],
        default: "donor"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Not required for initial admin users
    },


    // for volunteer

    profession: {
        type: String
    },

    skills: {
        type: Array
    },

    areaOfVolunteering: {
        type: String,
        enum: ["fieldWork", "online", "fundraising", "training"],
        default: "fieldWork"
    },

    availability: {
        type: String,
        enum: ["morning", "afternoon", "evening", "weekend"],
        default: "morning"
    },

    emergencyContactNumber: {
        type: String
    },

    uploadIdProof: {
        type: String
    },
    
     profilePic: {
        type: String
    },



    //    for doner

    organisationName : {
        type : String
    },

    panNumber: {
        type: String
    },

    gstNumber: {
        type: String
    },

    modeofDonation: {
        type: String,
        enum: ["bankTransfer", "upi", "cheque", "cash"],
        default : "bankTransfer"
    },

    consentForUpdate : {
        type : String,
        enum : ["email", "whatsapp", "none"],
        default : "none"
    },

    // Password reset OTP
    resetOtp: {
        type: String
    },
    resetOtpExpiresAt: {
        type: Date
    },

    tempPassword : {
        type : Boolean,
        default : false
    }



}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;