import nodemailer from "nodemailer";

export async function sendActivationEmail(to: string, name: string, token: string) {
  const activationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`;
  
  // Local console log backup (for easy local testing without SMTP setup)
  console.log("\n=======================================================");
  console.log(`[MAILER MOCK LOG] Sending activation email to: ${to}`);
  console.log(`[MAILER MOCK LOG] User Name: ${name}`);
  console.log(`[MAILER MOCK LOG] Activation Link: ${activationLink}`);
  console.log("=======================================================\n");

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: parseInt(port) === 465,
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: `"Daily Manarah" <${user}>`,
        to,
        subject: "ডেইলি মানারাহ - এডিটর অ্যাকাউন্ট অ্যাক্টিভেশন",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #059669; text-align: center;">অফিসিয়াল এডিটর অ্যাকাউন্ট অ্যাক্টিভেশন</h2>
            <p>আসসালামু আলাইকুম <strong>${name}</strong>,</p>
            <p>ডেইলি মানারাহ্ নিউজ পোর্টালে আপনাকে এডিটর হিসেবে যুক্ত করা হয়েছে। আপনার অ্যাকাউন্টটি সচল করতে নিচে থাকা লিঙ্কে বা বাটনে ক্লিক করুন:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationLink}" style="background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">অ্যাকাউন্ট অ্যাক্টিভেট করুন</a>
            </div>
            <p style="color: #666; font-size: 12px; text-align: center;">বাটনটি কাজ না করলে সরাসরি এই লিঙ্কটি ব্রাউজ করুন: <br/> <a href="${activationLink}">${activationLink}</a></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #999; text-align: center;">এটি একটি স্বয়ংক্রিয় মেইল। দয়া করে এখানে রিপ্লাই করবেন না।</p>
          </div>
        `
      });
      console.log(`[SMTP Mailer] Activation email sent successfully to ${to}`);
    } catch (error) {
      console.error("[SMTP Mailer Error] Failed to send email via SMTP:", error);
    }
  }
}
