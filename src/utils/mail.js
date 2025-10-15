import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a reusable transporter using environment variables
// Required envs: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT || 587),
	secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export async function sendVolunteerWelcomeEmail({ toEmail, fullName, email, password }) {
	const from = process.env.MAIL_FROM || process.env.SMTP_USER;
	const subject = "Welcome to Orbosis NGO - Your Volunteer Account";
	const html = `
		<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
			<h2>Welcome to Orbosis NGO, ${fullName || "Volunteer"}!</h2>
			<p>Your volunteer account has been created by the admin. You can now log in using the credentials below:</p>
			<ul>
				<li><strong>Email:</strong> ${email}</li>
				<li><strong>Password:</strong> ${password}</li>
			</ul>
			<p>For security, please log in and change your password immediately.</p>
			<p>Best regards,<br/>Orbosis NGO</p>
		</div>
	`;

	await transporter.sendMail({
		from,
		to: toEmail,
		subject,
		html,
	});
}

export async function sendMemberWelcomeEmail({ toEmail, fullName, email, password }) {
	const from = process.env.MAIL_FROM || process.env.SMTP_USER;
	const subject = "Welcome to Orbosis NGO - Your Member Account";
	const html = `
		<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
			<h2>Welcome to Orbosis NGO, ${fullName || "Member"}!</h2>
			<p>Your member account has been created by the admin. You can log in using the credentials below:</p>
			<ul>
				<li><strong>Email:</strong> ${email}</li>
				<li><strong>Password:</strong> ${password}</li>
			</ul>
			<p>Please change your password after first login for security.</p>
			<p>Best regards,<br/>Orbosis NGO</p>
		</div>
	`;

	await transporter.sendMail({
		from,
		to: toEmail,
		subject,
		html,
	});
}

export async function sendPasswordResetOtpEmail({ toEmail, fullName, otp }) {
	const from = process.env.MAIL_FROM || process.env.SMTP_USER;
	const subject = "Orbosis NGO - Password Reset OTP";
	const html = `
		<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
			<h2>Password Reset Request</h2>
			<p>Hi ${fullName || "there"},</p>
			<p>Your One-Time Password (OTP) to reset your account password is:</p>
			<h1 style="letter-spacing: 6px;">${otp}</h1>
			<p>This OTP Do not share it with anyone.</p>
			<p>If you did not request this, please ignore this email.</p>
			<p>— Orbosis NGO</p>
		</div>
	`;

	await transporter.sendMail({
		from,
		to: toEmail,
		subject,
		html,
	});
}

export async function sendContactUsEmail({ fullName, email, contactNumber, message }) {
	const from = process.env.MAIL_FROM || process.env.SMTP_USER;
	const to = process.env.CONTACT_US_TO || from;
	const subject = `New Contact Us message from ${fullName || email}`;
	const html = `
		<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
			<h2>Contact Us Submission</h2>
			<p><strong>Name:</strong> ${fullName || ''}</p>
			<p><strong>Email:</strong> ${email || ''}</p>
			<p><strong>Contact Number:</strong> ${contactNumber || ''}</p>
			<p><strong>Message:</strong></p>
			<p>${(message || '').replace(/\n/g, '<br/>')}</p>
		</div>
	`;

	await transporter.sendMail({
		from,
		to,
		subject,
		html,
	});
}

export async function sendEmail(to, subject, text) {
	const from = process.env.MAIL_FROM || process.env.SMTP_USER;
	await transporter.sendMail({
		from,
		to,
		subject,
		text
	});
}


