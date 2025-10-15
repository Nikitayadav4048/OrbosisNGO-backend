import User from "../../model/Auth/auth.js";
import Certificate from "../../model/Certificate/certificate.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getLocalFileUrl } from "../../utils/multer.js";
import { uploadToCloudinary } from "../../utils/uploader.js";
import { sendVolunteerWelcomeEmail, sendMemberWelcomeEmail, sendPasswordResetOtpEmail, sendContactUsEmail } from "../../utils/mail.js";
import Donation from "../../model/Donation/donation.js";


export const register = async (req, res) => {

    try {
        console.log('Registration attempt:', req.body);
        const { fullName, organisationName, contactNumber, address, area, state, panNumber, gstNumber, modeofDonation, consentForUpdate, email, password, role } = req.body;

        // Validate required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'fullName, email, and password are required' });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });

        if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

        const hash = await bcrypt.hash(password, 10);

        const cleanName = (fullName || 'user').toLowerCase().replace(/\s+/g, '');
        const randomNumbers = Math.floor(Math.random() * 900) + 100;
        let memberId = cleanName + randomNumbers;

        const existingMemberId = await User.findOne({ memberId });
        if (existingMemberId) {
            const newRandomNumbers = Math.floor(Math.random() * 900) + 100;
            memberId = cleanName + newRandomNumbers;
        }

        const user = await User.create({
            fullName,
            organisationName,
            contactNumber,
            address,
            area,
            state,
            panNumber,
            gstNumber,
            modeofDonation,
            consentForUpdate,
            email,
            password: hash,
            role,
            memberId
        });

        res.status(200).json({
            message: "register successfully",
        });

    } catch (err) {
        console.error('Registration error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name,
            code: err.code
        });
        res.status(500).json({ 
            message: 'Server error: 500',
            details: err.message,
            timestamp: new Date().toISOString()
        });
    }
};



export const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email' });
        }

        // 2. Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const needsPasswordChange = user.tempPassword === false;

        if(needsPasswordChange) {
            return res.status(401).json({ error: 'Please change your password' });
        }


        // 5. Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '2d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            role: user.role
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const getUserDetails = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // User ko role ke saath fetch karna
        const user = await User.findById(userId)
            .select('-password'); // Password ko hamesha exclude karna

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Role ke hisaab se fields ko exclude karna
        let selectFields = '-password'; // Default fields jo hamesha exclude karenge

        if (user.role === 'volunteer') {
            // Volunteers ke liye specific fields ko exclude karna
            selectFields += ' -TypesOfSupport -modeofDonation -consentForUpdate';
        } else if (user.role === 'member') {
            // Members ke liye specific fields ko exclude karna
            selectFields += ' -skills -areaOfVolunteering -availability -modeofDonation -consentForUpdate';
        }

        // User ko updated selectFields ke saath dobara fetch karna
        const detailedUser = await User.findById(userId).select(selectFields);

        return res.status(200).json({
            message: 'User details fetched successfully',
            user: detailedUser
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const updateUserDetails = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const {
            fullName,
            gender,
            dob,
            age,
            contactNumber,
            address,
            area,
            state,
            pinCode,
            profession,
            skills,
            areaOfVolunteering,
            availability,
            emergencyContactNumber,
            organisationName,
            panNumber,
            gstNumber,
            modeofDonation,
            consentForUpdate,
            TypesOfSupport,
            email
        } = req.body;

        const updates = {};
        if (fullName !== undefined) updates.fullName = fullName;
        if (gender !== undefined) updates.gender = gender;
        if (dob !== undefined) updates.dob = dob;
        if (age !== undefined) updates.age = age;
        if (contactNumber !== undefined) updates.contactNumber = contactNumber;
        if (address !== undefined) updates.address = address;
        if (area !== undefined) updates.area = area;
        if (state !== undefined) updates.state = state;
        if (pinCode !== undefined) updates.pinCode = pinCode;
        if (profession !== undefined) updates.profession = profession;
        if (areaOfVolunteering !== undefined) updates.areaOfVolunteering = areaOfVolunteering;
        if (availability !== undefined) updates.availability = availability;
        if (emergencyContactNumber !== undefined) updates.emergencyContactNumber = emergencyContactNumber;
        if (organisationName !== undefined) updates.organisationName = organisationName;
        if (panNumber !== undefined) updates.panNumber = panNumber;
        if (gstNumber !== undefined) updates.gstNumber = gstNumber;
        if (modeofDonation !== undefined) updates.modeofDonation = modeofDonation;
        if (consentForUpdate !== undefined) updates.consentForUpdate = consentForUpdate;

        // Skills: accept string (comma-separated) or array
        if (skills !== undefined) {
            if (typeof skills === 'string') {
                updates.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
            } else if (Array.isArray(skills)) {
                updates.skills = skills;
            }
        }

        // TypesOfSupport: accept string (comma-separated) or array
        if (TypesOfSupport !== undefined) {
            if (typeof TypesOfSupport === 'string') {
                updates.TypesOfSupport = TypesOfSupport.split(',').map(s => s.trim()).filter(Boolean);
            } else if (Array.isArray(TypesOfSupport)) {
                updates.TypesOfSupport = TypesOfSupport;
            }
        }

        // Optional: update email with uniqueness check
        if (email !== undefined) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
            updates.email = email;
        }

        // Handle upload via Cloudinary for profilePic only
        if (req.file && req.file.fieldname === 'profilePic') {
            const url = await uploadToCloudinary(req.file, 'profile-pics');
            if (url) updates.profilePic = url;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true })
            .select('-password');

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const changePassword = async (req, res) => {
	try {
		// const userId = req.user?._id;
		const { email, oldPassword, newPassword } = req.body;

		// if (!userId) return res.status(401).json({ message: 'Unauthorized' });
		if (!oldPassword || !newPassword) {
			return res.status(400).json({ message: 'oldPassword and newPassword are required' });
		}
		if (newPassword.length < 6) {
			return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
		}

		// const user = await User.findById(userId).select('+password');

		const user = await User.findOne({email}).select('+password');

		if (!user) return res.status(404).json({ message: 'User not found' });

		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Old password is incorrect' });
		}

		const newHash = await bcrypt.hash(newPassword, 10);
		user.password = newHash;

        user.tempPassword = true
		await user.save();

		return res.status(200).json({ message: 'Password changed successfully' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
}

export const createVolunteerByAdmin = async (req, res) => {
    try {
        const { fullName, gender, dob, age, contactNumber, address, area, state, profession, skills, areaOfVolunteering, availability, emergencyContactNumber, email, password } = req.body;
        const adminId = req.user._id;
        const adminName = req.user.fullName;

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const cleanName = (fullName || 'volunteer').toLowerCase().replace(/\s+/g, '');
        const randomNumbers = Math.floor(Math.random() * 900) + 100;
        let memberId = cleanName + randomNumbers;

        const existingMemberId = await User.findOne({ memberId });
        if (existingMemberId) {
            const newRandomNumbers = Math.floor(Math.random() * 900) + 100;
            memberId = cleanName + newRandomNumbers;
        }

        // Hash the password
        const hash = await bcrypt.hash(password, 10);

        // Process skills - convert to array if it's a string
        let skillsArray = [];
        if (skills) {
            if (typeof skills === 'string') {
                // If skills is a string, split by comma and trim each skill
                skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
            } else if (Array.isArray(skills)) {
                // If skills is already an array, use it directly
                skillsArray = skills;
            }
        }

        // Process uploaded ID proof image with Cloudinary
        let uploadIdProof = null;
        if (req.file) {
            try {
                uploadIdProof = await uploadToCloudinary(req.file, 'volunteer-id-proofs');
            } catch (error) {
                return res.status(500).json({ 
                    message: 'Error uploading ID proof to Cloudinary: ' + error.message 
                });
            }
        }

        // Create the volunteer
        const volunteer = await User.create({
            fullName,
            gender,
            dob,
            age,
            contactNumber,
            address,
            area,
            state,
            profession,
            skills: skillsArray,
            areaOfVolunteering,
            availability,
            emergencyContactNumber,
            uploadIdProof,
            email,
            password: hash,
            memberId,
            role: 'volunteer',
            createdBy: adminId
        });

        // Send welcome email with credentials (best-effort)
        try {
            await sendVolunteerWelcomeEmail({
                toEmail: email,
                fullName,
                email,
                password

                
            });
        } catch (mailErr) {
            // Do not fail the request if mail fails
        }

        res.status(201).json({
            message: "Volunteer created successfully",
            volunteer
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const createMemberByAdmin = async (req, res) => {
    try {
        const { fullName, gender, dob, age, contactNumber, address, area, pinCode, TypesOfSupport, govermentIdProof, specialRequirement,  email, password } = req.body;
        const adminId = req.user._id;
        const adminName = req.user.fullName;

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const cleanName = (fullName || 'member').toLowerCase().replace(/\s+/g, '');
        const randomNumbers = Math.floor(Math.random() * 900) + 100;
        let memberId = cleanName + randomNumbers;

        const existingMemberId = await User.findOne({ memberId });
        if (existingMemberId) {
            const newRandomNumbers = Math.floor(Math.random() * 900) + 100;
            memberId = cleanName + newRandomNumbers;
        }

        // Hash the password
        const hash = await bcrypt.hash(password, 10);

        // Process TypesOfSupport - convert to array if it's a string
        let typesOfSupportArray = [];
        if (TypesOfSupport) {
            if (typeof TypesOfSupport === 'string') {
                // If TypesOfSupport is a string, split by comma and trim each type
                typesOfSupportArray = TypesOfSupport.split(',').map(type => type.trim()).filter(type => type.length > 0);
            } else if (Array.isArray(TypesOfSupport)) {
                // If TypesOfSupport is already an array, use it directly
                typesOfSupportArray = TypesOfSupport;
            }
        }

        // Create the member
        const member = await User.create({
            fullName,
            gender,
            dob,
            age,
            contactNumber,
            address,
            area,
            pinCode,
            TypesOfSupport: typesOfSupportArray,
            govermentIdProof,
            specialRequirement,
            email,
            password: hash,
            memberId,
            role: 'member',
            createdBy: adminId
        });

        // Send welcome email with credentials (best-effort)
        try {
            await sendMemberWelcomeEmail({
                toEmail: email,
                fullName,
                email,
                password
            });
        } catch (mailErr) {
            // Do not fail the request if mail fails
        }

        res.status(201).json({
            message: "Member created successfully",
            member
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await User.find({ role: 'volunteer' })
            .select('-password -TypesOfSupport -modeofDonation -consentForUpdate')
            .populate('createdBy', 'fullName _id')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Volunteers fetched successfully",
            count: volunteers.length,
            volunteers: volunteers
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getAllMembers = async (req, res) => {
    try {
        const members = await User.find({ role: 'member' })
            .select('-password -skills -areaOfVolunteering -availability -modeofDonation -consentForUpdate')
            .populate('createdBy', 'fullName _id')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Members fetched successfully",
            count: members.length,
            members: members
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}




export const givenCerification = async (req, res) => {
    try {
        const { userId } = req.params;
        const createdBy = req.user._id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if certificate file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Certificate file is required' });
        }

        // Upload certificate file (image or PDF) to Cloudinary
        let certificationDestribute = null;
        try {
            certificationDestribute = await uploadToCloudinary(req.file, 'certificates');
        } catch (error) {
            return res.status(500).json({ 
                message: 'Error uploading certificate to Cloudinary: ' + error.message 
            });
        }

        // Create the certificate
        const certificate = await Certificate.create({
            userId: userId,
            certificationDestribute: certificationDestribute,
            createdBy: createdBy
        });

        res.status(201).json({
            message: "Certificate distributed successfully",
            certificate: {
                _id: certificate._id,
                userId: certificate.userId,
                userDetails: {
                    fullName: user.fullName,
                    memberId: user.memberId,
                    dob: user.dob
                },
                certificationDestribute: certificate.certificationDestribute,
                createdBy: certificate.createdBy,
                createdAt: certificate.createdAt
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getCertificateByMemberDetails = async (req, res) => {
    try {
        const { memberId, dob } = req.body;

        // Validate required parameters
        if (!memberId || !dob) {
            return res.status(400).json({ 
                message: 'Both memberId and dob are required' 
            });
        }

        // Find user by memberId and dob
        const user = await User.findOne({ 
            memberId: memberId, 
            dob: dob 
        });

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found with the provided memberId and dob' 
            });
        }

        // Find certificates for this user
        const certificates = await Certificate.find({ userId: user._id })
            .populate('createdBy', 'fullName _id')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Certificates retrieved successfully",
            userDetails: {
                _id: user._id,
                fullName: user.fullName,
                memberId: user.memberId,
                dob: user.dob,
                contactNumber: user.contactNumber,
                email: user.email
            },
            certificates: certificates.map(cert => ({
                _id: cert._id,
                certificationDestribute: cert.certificationDestribute,
                createdBy: cert.createdBy,
                createdAt: cert.createdAt,
                updatedAt: cert.updatedAt
            })),
            totalCertificates: certificates.length
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getAllCertification = async (req, res) => {
    try {
        // Get all certificates with user details and creator details
        const certificates = await Certificate.find()
            .populate('userId', 'fullName memberId dob contactNumber email role')
            .populate('createdBy', 'fullName _id role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All certificates retrieved successfully",
            count: certificates.length,
            certificates: certificates.map(cert => ({
                _id: cert._id,
                userId: cert.userId,
                certificationDestribute: cert.certificationDestribute,
                createdBy: cert.createdBy,
                createdAt: cert.createdAt,
                updatedAt: cert.updatedAt
            }))
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getAdminDashboard = async (req, res) => {
    try {
        // Get counts for dashboard
        const totalMembers = await User.countDocuments({ role: 'member' });
        const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
        const totalCertificates = await Certificate.countDocuments();

        // Calculate total donation amount from completed donations
        const completedDonations = await Donation.find({ paymentStatus: 'completed' });
        const donationAmount = completedDonations.reduce((total, donation) => total + donation.amount, 0);

        res.status(200).json({
            message: "Admin dashboard data retrieved successfully",
            dashboard: {
                totalMembers,
                totalVolunteers,
                totalCertificates,
                donationAmount
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getRecentActivity = async (req, res) => {
    try {
        const recentUsers = await User.find({ role: { $ne: 'admin' } })
            .select('email role createdAt')
            .sort({ createdAt: -1 })
            .limit(10); // Limit to 10 most recent users

        res.status(200).json({
            message: "Recent activity retrieved successfully",
            recentActivity: recentUsers.map(user => ({
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }))
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const contactUs = async (req, res) => {
	try {
		const { fullName, email, contactNumber, message } = req.body;
		if (!fullName || !email || !contactNumber || !message) {
			return res.status(400).json({ message: 'fullName, email, contactNumber, message are required' });
		}

		await sendContactUsEmail({ fullName, email, contactNumber, message });
		return res.status(200).json({ message: 'Thanks for contacting us. We will get back to you soon.' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
}

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ message: 'Email is required' });

		const user = await User.findOne({ email });
		if (!user) return res.status(200).json({ message: 'email not found' });

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

		user.resetOtp = otp;
		user.resetOtpExpiresAt = expires;
		await user.save();

		try {
			await sendPasswordResetOtpEmail({ toEmail: user.email, fullName: user.fullName, otp });
		} catch (_) {}

		return res.status(200).json({ message: 'If the email exists, OTP has been sent' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
}

export const verifyResetOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;
		if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

		const user = await User.findOne({ email });
		if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
			return res.status(400).json({ message: 'Invalid or expired OTP' });
		}


		if (user.resetOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
		if (new Date() > new Date(user.resetOtpExpiresAt)) return res.status(400).json({ message: 'OTP expired' });

		// Clear OTP on successful verification
		user.resetOtp = undefined;
		user.resetOtpExpiresAt = undefined;
		await user.save();

		return res.status(200).json({ message: 'OTP verified successfully' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
}

export const resetPassword = async (req, res) => {
	try {
		const { email, newPassword, confirm_password } = req.body;
		if (!email || !newPassword || !confirm_password) return res.status(400).json({ message: 'Email, newPassword and confirm_password are required' });
		if (newPassword.length < 6) return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
		if (newPassword !== confirm_password) return res.status(400).json({ message: 'newPassword and confirm_password do not match' });

		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found' });

		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		return res.status(200).json({ message: 'Password reset successful' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
}