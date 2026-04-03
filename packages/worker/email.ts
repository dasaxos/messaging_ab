import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
const FROM_EMAIL = process.env.FROM_EMAIL || 'results@predictor.app';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendResultsEmail(
  email: string,
  jobId: string
): Promise<void> {
  const resultsUrl = `${APP_URL}/results/${jobId}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your A/B simulation is complete`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; color: #e5e2e3; background: #131314; padding: 32px; border-radius: 12px;">
        <p style="font-size: 16px; line-height: 1.6; color: #c2c6d6; margin-bottom: 24px;">
          Your results are ready to view!
        </p>
        <a href="${resultsUrl}" style="display: inline-block; background: #adc6ff; color: #002e6a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
          View Results
        </a>
        <p style="font-size: 12px; color: #8c909f; margin-top: 32px;">
          Powered by MiroFish
        </p>
      </div>
    `,
  });
}

export async function sendErrorEmail(
  email: string,
  jobId: string
): Promise<void> {
  const homeUrl = APP_URL;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your A/B simulation encountered an issue`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; color: #e5e2e3; background: #131314; padding: 32px; border-radius: 12px;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #fff;">
          Simulation Issue
        </h1>
        <p style="font-size: 16px; line-height: 1.6; color: #c2c6d6; margin-bottom: 24px;">
          Your simulation (${jobId}) ran into a problem. This sometimes happens with complex simulations.
          Please try again — it's free.
        </p>
        <a href="${homeUrl}" style="display: inline-block; background: #adc6ff; color: #002e6a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
          Try Again
        </a>
        <p style="font-size: 12px; color: #8c909f; margin-top: 32px;">
          Powered by MiroFish
        </p>
      </div>
    `,
  });
}
