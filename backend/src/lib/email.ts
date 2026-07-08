import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

// You can use a verified domain here if configured in Resend (e.g., 'onboarding@resend.dev' is for testing)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'IP COS <onboarding@resend.dev>';

export const sendOTP = async (to: string, otp: string) => {
  if (process.env.NODE_ENV === 'test' || !process.env.RESEND_API_KEY) {
    console.log(`[TEST MODE] Mock email to ${to}: Your OTP is ${otp}`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Verify your email address - IP COS',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Welcome to IP Commercialization OS</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 16px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 8px;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send OTP email via Resend:', error);
    // Don't throw to prevent blocking the flow if email fails
  }
};

export const sendPasswordReset = async (to: string, otp: string) => {
  if (process.env.NODE_ENV === 'test' || !process.env.RESEND_API_KEY) {
    console.log(`[TEST MODE] Mock password reset to ${to}: Your reset OTP is ${otp}`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Password Reset Request - IP COS',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>We received a request to reset your password. Here is your code:</p>
          <div style="background-color: #f3f4f6; padding: 16px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 8px;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email via Resend:', error);
  }
};
