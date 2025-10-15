import mongoose from "mongoose";


const certificateSchema = new mongoose.Schema({


    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    certificationDestribute : {
        type : String
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Not required for initial admin users
    },


}, {timestamps: true});



const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;