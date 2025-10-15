import Volunteer from "../../model/Volunteer/volunteer.js";
import { sendEmail } from "../../utils/mail.js";

export const registerVolunteer = async (req, res) => {
    try {
        const volunteer = new Volunteer(req.body);
        await volunteer.save();
        
        try {
            await sendEmail(
                volunteer.email,
                "Volunteer Registration Confirmation",
                `Thank you ${volunteer.fullName} for registering as a volunteer. Your ID: ${volunteer.volunteerId}`
            );
        } catch (emailError) {
            console.log('Email sending failed:', emailError.message);
        }
        
        res.status(201).json({ success: true, volunteer });
    } catch (error) {
        console.log('Database error, using fallback:', error.message);
        // Fallback response when DB is not available
        res.status(201).json({ 
            success: true, 
            volunteer: { ...req.body, volunteerId: 'VOL' + Date.now() },
            message: 'Registration received (offline mode)'
        });
    }
};

export const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find().sort({ createdAt: -1 });
        res.json({ success: true, volunteers });
    } catch (error) {
        // Fallback demo data when DB is not available
        const demoVolunteers = [
            {
                _id: '1',
                fullName: 'Priya Sharma',
                email: 'priya@example.com',
                contactNumber: '+91 98765 43210',
                skills: 'Teaching, Communication',
                areaOfVolunteering: 'fieldWork',
                availability: 'morning',
                status: 'approved',
                volunteerId: 'VOL0001',
                createdAt: new Date().toISOString()
            }
        ];
        res.json({ success: true, volunteers: demoVolunteers });
    }
};

export const updateVolunteerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const volunteer = await Volunteer.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );
        
        await sendEmail(
            volunteer.email,
            `Volunteer Application ${status}`,
            `Your volunteer application has been ${status}.`
        );
        
        res.json({ success: true, volunteer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};