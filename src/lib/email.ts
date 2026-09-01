import { Resend } from 'resend';
import { SUPPORT_EMAIL } from '@/lib/support';

const resendApiKey = process.env.RESEND_API_KEY;
const passwordResetFrom = process.env.PASSWORD_RESET_FROM || 'FHM Church <Media@fathersheartministry.ca>';
const moderationAlertTo = process.env.MODERATION_ALERT_TO || SUPPORT_EMAIL;
const moderationAlertFrom = process.env.MODERATION_ALERT_FROM || passwordResetFrom;

export function isPasswordResetEmailConfigured() {
    return Boolean(resendApiKey);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
    if (!resendApiKey) {
        throw new Error('RESEND_API_KEY is not configured. Password reset email was not sent.');
    }

    const resend = new Resend(resendApiKey);

    const result = await resend.emails.send({
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
    if (result.error) throw new Error(result.error.message);
}

export function isModerationAlertConfigured() {
    return Boolean(resendApiKey && moderationAlertTo && moderationAlertFrom);
}

export async function sendModerationAlertEmail(input: { reportId: string; reason: string; deadlineAt: Date; escalation: boolean }) {
    if (!resendApiKey) throw new Error('RESEND_API_KEY is not configured.');
    if (!moderationAlertTo) throw new Error('MODERATION_ALERT_TO is not configured.');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fhmapp.netlify.app';
    const adminUrl = `${appUrl.replace(/\/$/, '')}/admin/reports`;
    const subject = input.escalation ? 'Urgent: FHM safety report nearing deadline' : 'New FHM safety report';
    const body = [
        input.escalation ? 'A safety report is approaching its 24-hour review deadline.' : 'A new safety report requires moderator review.',
        `Report ID: ${input.reportId}`,
        `Reason: ${input.reason}`,
        `Review deadline: ${input.deadlineAt.toISOString()}`,
        `Open the protected moderation queue: ${adminUrl}`,
        '',
        'For privacy, message content and reporter identity are not included in this email.',
    ].join('\n');

    const result = await new Resend(resendApiKey).emails.send({
        from: moderationAlertFrom,
        to: moderationAlertTo,
        subject,
        text: body,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827"><h1 style="font-size:20px">${subject}</h1><p>${input.escalation ? 'A safety report is approaching its 24-hour review deadline.' : 'A new safety report requires moderator review.'}</p><p><strong>Report ID:</strong> ${input.reportId}<br><strong>Reason:</strong> ${input.reason}<br><strong>Review deadline:</strong> ${input.deadlineAt.toISOString()}</p><p><a href="${adminUrl}">Open the protected moderation queue</a></p><p>For privacy, message content and reporter identity are not included in this email.</p></div>`,
    });
    if (result.error) throw new Error(result.error.message);
}
