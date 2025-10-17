import * as dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

/**
 * Defines the static configuration for the email report, including SMTP details,
 * sender/receiver from environment variables, and the email's HTML body content.
 */
const emailReportFormat: Record<string, any> = {
  // Subject line, dynamically generated with the current date/time
  subject: `Third Party Lobby Checking - ` + getCurrentDateTime(),
  // SMTP host for Outlook/Office 365
  host: "smtp-mail.outlook.com",
  // Standard non-secure port for Outlook/Office 365 SMTP (StartTLS is used)
  port: 587,
  // Indicates whether to use SSL/TLS. False because we use STARTTLS on port 587.
  secure: false,
  // Authentication credentials pulled from environment variables
  auth: {
    user: process.env.SENDER_EMAIL_USERNAME,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
  // The primary recipient's email address from environment variables
  receiver: process.env.RECEIVER_EMAIL_USERNAME,
  // The HTML content of the email body
  htmlContent: `
    <h4>Hello Team,</h4>
    <p>The attached Excel files contain the results from the **Third-Party Lobby Checking** for each provider.</p>
    <p>Every category has its own sheet, and each sheet features three key columns for comparison: **Expected List**, **Added List**, and **Removed List**.</p>
    <ul>
        <li><b>Expected Tables</b>: Is the list of the tables that will be compared to by the tables inside the Game Lobby</li>
        <li><b>Added Tables</b>: List of the tables that are added inside the game and not found in the Base List</li>
        <li><b>Removed Tables</b>: Lost of the tables that are inside the Base List, but cannot be found in Game Lobby</li>
    </ul>
    <p>Please review the attached reports. Thank you! - <b>Automation Team</b></p>
    `,
};

/**
 * Generates a formatted date and time string for the email subject.
 * Format: DD Mon YY HH:MM:SS (e.g., 17 Oct 25 15:49:39)
 * @returns {string} The formatted date/time string.
 */
function getCurrentDateTime(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Use 24-hour format
  };
  // Format the date using a locale (en-GB) and remove the comma separator
  return new Intl.DateTimeFormat("en-GB", options).format(now).replace(",", "");
}

/**
 * Connects to the SMTP server, prepares the email, reads files from the specified
 * directory as attachments, and sends the email.
 * @param {string} folderDir The path to the directory containing the attachment files.
 * @returns {Promise<void>} A promise that resolves when the email has been sent.
 */
export async function sendEmail(folderDir: string): Promise<void> {
  // Create a reusable SMTP transporter object using the configuration
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // STARTTLS will be automatically used on port 587
    auth: {
      user: process.env.SENDER_EMAIL_USERNAME,
      pass: process.env.SENDER_EMAIL_PASSWORD,
    },
  });

  // Read all files in the directory and map them to nodemailer attachment format
  const attachments: { filename: string; path: string }[] = fs.readdirSync(folderDir).map((file) => ({
    filename: file, // The name of the file as it appears in the email
    path: path.join(folderDir, file), // Full path to the file on the local file system
  }));

  // Send the mail with the defined transport object, content, and attachments
  const info = await transporter.sendMail({
    from: process.env.SENDER_EMAIL_USERNAME, // sender address
    to: process.env.RECEIVER_EMAIL_USERNAME, // list of receivers
    subject: emailReportFormat.subject, // Subject line from the config
    html: emailReportFormat.htmlContent, // HTML content of the email
    attachments: attachments, // Array of file attachments
  });

  // Log the sending details for confirmation
  console.log(`From: ${emailReportFormat.auth.user}`);
  console.log(`To: ${emailReportFormat.receiver}`);
  console.log(`Subject: ${emailReportFormat.subject}`);
  console.log("Message sent: %s", info.messageId); // Log the unique message ID
}
