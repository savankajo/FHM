import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const passwordResetFrom = process.env.PASSWORD_RESET_FROM || 'FHM Church <Media@fathersheartministry.ca>';

export function isPasswordResetEmailConfigured() {
    return Boolean(resendApiKey);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
    if (!resendApiKey) {
        throw new Error('RESEND_API_KEY is not configured. Password reset email was not sent.');
    }

    const resend = new Resend(resendApiKey);

    await resend.emails.send({
        from: passwordResetFrom,
        to,
        subject: 'Reset your FHM Church password',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
                <h1 style="font-size: 20px;">Reset your password</h1>
                <p>We received a request to reset your FHM Church account password.</p>
                <p>
                    <a href="${resetUrl}" style="display: inline-block; background: #111827; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">
                        Reset password
                    </a>
                </p>
                <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
            </div>
        `,
        text: `Reset your FHM Church password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.`,
    });
}
