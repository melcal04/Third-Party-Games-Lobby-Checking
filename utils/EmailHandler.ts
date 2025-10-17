import * as dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

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

function getCurrentDateTime(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  return new Intl.DateTimeFormat("en-GB", options).format(now).replace(",", "");
}

export async function sendEmail(folderDir: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_ACCOUNT,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const attachments: { filename: string; path: string }[] = fs.readdirSync(folderDir).map((file) => ({
    filename: file,
    path: path.join(folderDir, file), // Full path to the file
  }));

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.EMAIL_ACCOUNT, // sender address
    to: process.env.EMAIL_RECEIVER, // list of receivers
    subject: emailReportFormat.subject, // Subject line
    html: emailReportFormat.htmlContent, // plain text body
    attachments: attachments,
  });

  console.log(`From: ${emailReportFormat.auth.user}`);
  console.log(`To: ${emailReportFormat.receiver}`);
  console.log(`Subject: ${emailReportFormat.subject}`);
  console.log("Message sent: %s", info.messageId);
}
