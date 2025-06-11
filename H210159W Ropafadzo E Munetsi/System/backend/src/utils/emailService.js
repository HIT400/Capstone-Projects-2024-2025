// import nodemailer from "nodemailer";
// import { config } from "dotenv";

// config();

// // Email configuration from environment variables
// const EMAIL_HOST = process.env.EMAIL_HOST;
// const EMAIL_PORT = process.env.EMAIL_PORT;
// const EMAIL_USER = process.env.EMAIL_USER;
// const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
// const EMAIL_FROM = process.env.EMAIL_FROM;
// const APP_URL = process.env.APP_URL || "http://localhost:3000";

// // Create reusable transporter object using the default SMTP transport
// const transporter = nodemailer.createTransport({
//     host: EMAIL_HOST,
//     port: EMAIL_PORT,
//     secure: EMAIL_PORT === 465, // true for 465, false for other ports
//     auth: {
//         user: EMAIL_USER,
//         pass: EMAIL_PASSWORD,
//     },
// });

// // Verify connection configuration
// transporter.verify((error) => {
//     if (error) {
//         console.error("Error with email configuration:", error);
//     } else {
//         console.log("Email server is ready to send messages");
//     }
// });

// /**
//  * Send password reset email
//  * @param {string} email - Recipient email address
//  * @param {string} token - Password reset token
//  * @returns {Promise} Promise that resolves when email is sent
//  */
// export const sendPasswordResetEmail = async (email, token) => {
//     try {
//         const resetUrl = `${APP_URL}/reset-password/${token}`;
        
//         const mailOptions = {
//             from: `"Application System" <${EMAIL_FROM}>`,
//             to: email,
//             subject: "Password Reset Request",
//             html: `
//                 <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
//                     <h2 style="color: #333;">Password Reset Request</h2>
//                     <p>You recently requested to reset your password for your account. Click the button below to reset it.</p>
//                     <p style="text-align: center; margin: 30px 0;">
//                         <a href="${resetUrl}" 
//                            style="background-color: #4CAF50; color: white; padding: 12px 24px; 
//                                   text-decoration: none; border-radius: 4px; font-weight: bold;">
//                             Reset Password
//                         </a>
//                     </p>
//                     <p>If you didn't request a password reset, please ignore this email or contact support if you have questions.</p>
//                     <p>This password reset link is only valid for the next 60 minutes.</p>
//                     <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//                     <p style="font-size: 12px; color: #777;">
//                         If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:
//                         <br>${resetUrl}
//                     </p>
//                 </div>
//             `,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Password reset email sent to ${email}`);
//     } catch (error) {
//         console.error("Error sending password reset email:", error);
//         throw new Error("Failed to send password reset email");
//     }
// };

// /**
//  * Send account confirmation email
//  * @param {string} email - Recipient email address
//  * @param {string} name - User's name
//  * @returns {Promise} Promise that resolves when email is sent
//  */
// export const sendAccountConfirmationEmail = async (email, name) => {
//     try {
//         const loginUrl = `${APP_URL}/login`;
        
//         const mailOptions = {
//             from: `"Application System" <${EMAIL_FROM}>`,
//             to: email,
//             subject: "Account Registration Confirmation",
//             html: `
//                 <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
//                     <h2 style="color: #333;">Welcome to Our System, ${name}!</h2>
//                     <p>Your account has been successfully created with the role of <strong>applicant</strong>.</p>
//                     <p>You can now log in to your account using the email and password you provided during registration.</p>
//                     <p style="text-align: center; margin: 30px 0;">
//                         <a href="${loginUrl}" 
//                            style="background-color: #4CAF50; color: white; padding: 12px 24px; 
//                                   text-decoration: none; border-radius: 4px; font-weight: bold;">
//                             Log In Now
//                         </a>
//                     </p>
//                     <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
//                     <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//                     <p style="font-size: 12px; color: #777;">
//                         This is an automated message, please do not reply directly to this email.
//                     </p>
//                 </div>
//             `,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Account confirmation email sent to ${email}`);
//     } catch (error) {
//         console.error("Error sending account confirmation email:", error);
//         throw new Error("Failed to send account confirmation email");
//     }
// };

// /**
//  * Send role update notification email
//  * @param {string} email - Recipient email address
//  * @param {string} name - User's name
//  * @param {string} newRole - User's new role
//  * @returns {Promise} Promise that resolves when email is sent
//  */
// export const sendRoleUpdateEmail = async (email, name, newRole) => {
//     try {
//         const loginUrl = `${APP_URL}/login`;
        
//         const mailOptions = {
//             from: `"Application System" <${EMAIL_FROM}>`,
//             to: email,
//             subject: "Account Role Update",
//             html: `
//                 <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
//                     <h2 style="color: #333;">Account Role Updated</h2>
//                     <p>Dear ${name},</p>
//                     <p>Your account role has been updated to <strong>${newRole}</strong>.</p>
//                     <p>This change affects your access privileges in the system. If you believe this is a mistake, please contact the administrator immediately.</p>
//                     <p style="text-align: center; margin: 30px 0;">
//                         <a href="${loginUrl}" 
//                            style="background-color: #4CAF50; color: white; padding: 12px 24px; 
//                                   text-decoration: none; border-radius: 4px; font-weight: bold;">
//                             Log In to Your Account
//                         </a>
//                     </p>
//                     <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//                     <p style="font-size: 12px; color: #777;">
//                         This is an automated message, please do not reply directly to this email.
//                     </p>
//                 </div>
//             `,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Role update email sent to ${email}`);
//     } catch (error) {
//         console.error("Error sending role update email:", error);
//         throw new Error("Failed to send role update email");
//     }
// };

// /**
//  * Send account deletion notification email
//  * @param {string} email - Recipient email address
//  * @param {string} name - User's name
//  * @returns {Promise} Promise that resolves when email is sent
//  */
// export const sendAccountDeletionEmail = async (email, name) => {
//     try {
//         const mailOptions = {
//             from: `"Application System" <${EMAIL_FROM}>`,
//             to: email,
//             subject: "Account Deletion Notification",
//             html: `
//                 <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
//                     <h2 style="color: #333;">Account Deletion Confirmation</h2>
//                     <p>Dear ${name},</p>
//                     <p>Your account has been successfully deleted from our system.</p>
//                     <p>All your personal data has been removed in accordance with our privacy policy.</p>
//                     <p>If you did not request this action or believe this was done in error, please contact our support team immediately.</p>
//                     <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//                     <p style="font-size: 12px; color: #777;">
//                         This is an automated message, please do not reply directly to this email.
//                     </p>
//                 </div>
//             `,
//         };

//         await transporter.sendMail(mailOptions);
//         console.log(`Account deletion email sent to ${email}`);
//     } catch (error) {
//         console.error("Error sending account deletion email:", error);
//         throw new Error("Failed to send account deletion email");
//     }
// };