import Certificate from "../../model/Certificate/certificate.js";
import QRCode from "qrcode";

export const generateCertificate = async (req, res) => {
    try {
        const { recipientName, certificateType, issueDate, description } = req.body;
        
        const certificate = new Certificate({
            recipientName,
            certificateType,
            issueDate,
            description
        });
        
        // Generate QR code for verification
        const qrData = `${process.env.FRONTEND_URL}/verify-certificate/${certificate._id}`;
        const qrCode = await QRCode.toDataURL(qrData);
        certificate.qrCode = qrCode;
        
        await certificate.save();
        res.status(201).json({ success: true, certificate });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const getAllCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find().sort({ createdAt: -1 });
        res.json({ success: true, certificates });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const verifyCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const certificate = await Certificate.findById(id);
        if (!certificate) {
            return res.status(404).json({ success: false, message: "Certificate not found" });
        }
        res.json({ success: true, certificate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};