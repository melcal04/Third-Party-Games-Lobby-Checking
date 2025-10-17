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
  subject: `Third Party Lobby Checking - ` + getCurrentDateTime(),
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SENDER_EMAIL_USERNAME,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
  receiver: process.env.RECEIVER_EMAIL_USERNAME,
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
  return new Intl.DateTimeFormat("en-GB", options).format(now).replace(",", "");
}

/**
 * Connects to the SMTP server, prepares the email, reads files from the specified
 * directory as attachments, and sends the email.
 * @param {string} inputDir The path to the directory containing the attachment files.
 * @returns {Promise<void>} A promise that resolves when the email has been sent.
 */
export async function sendEmail(inputDir: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // STARTTLS will be automatically used on port 587
    auth: {
      user: process.env.SENDER_EMAIL_USERNAME,
      pass: process.env.SENDER_EMAIL_PASSWORD,
    },
  });

  const attachments: { filename: string; path: string }[] = fs.readdirSync(inputDir).map((file) => ({
    filename: file,
    path: path.join(inputDir, file),
  }));

  const info = await transporter.sendMail({
    from: process.env.SENDER_EMAIL_USERNAME, // sender address
    to: process.env.RECEIVER_EMAIL_USERNAME, // list of receivers
    subject: emailReportFormat.subject, // Subject line from the config
    html: emailReportFormat.htmlContent, // HTML content of the email
    attachments: attachments, // Array of file attachments
  });

  console.log(`From: ${emailReportFormat.auth.user}`);
  console.log(`To: ${emailReportFormat.receiver}`);
  console.log(`Subject: ${emailReportFormat.subject}`);
  console.log("Message sent: %s", info.messageId); // Log the unique message ID
}
