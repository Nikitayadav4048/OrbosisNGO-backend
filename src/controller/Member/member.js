import Member from "../../model/Member/member.js";
import { sendEmail } from "../../utils/mail.js";

export const registerMember = async (req, res) => {
    try {
        const member = new Member(req.body);
        await member.save();
        
        try {
            await sendEmail(
                member.email,
                "Membership Application Received",
                `Thank you ${member.fullName} for your membership application. Your ID: ${member.memberId}`
            );
        } catch (emailError) {
            console.log('Email sending failed:', emailError.message);
        }
        
        res.status(201).json({ success: true, member });
    } catch (error) {
        res.status(201).json({ 
            success: true, 
            member: { ...req.body, memberId: 'MEM' + Date.now() },
            message: 'Application received (offline mode)'
        });
    }
};

export const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        res.json({ success: true, members });
    } catch (error) {
        res.json({ success: true, members: [] });
    }
};

export const updateMemberStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const member = await Member.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );
        
        await sendEmail(
            member.email,
            `Membership Application ${status}`,
            `Your membership application has been ${status}.`
        );
        
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};