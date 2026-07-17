import { SITE_ORIGIN } from "@/lib/brand-facts";

/**
 * Welcome email sent to /faster-after-40 squeeze page subscribers
 * immediately after the Beehiiv subscribe succeeds. Wired up in
 * src/app/api/faster-after-40/route.ts.
 *
 * The PDF lives at /downloads/faster-after-40-report.pdf, served from
 * the public directory.
 *
 * Voice: Anthony's first person, peer-to-peer, direct. Dark theme with
 * a coral CTA matching the squeeze page and the PDF cover.
 */

const PDF_PATH = "/downloads/faster-after-40-report.pdf";
const SKOOL_URL = "https://www.skool.com/roadmancycling";
const PLATEAU_PATH = "/go";

export interface FasterAfter40WelcomeEmail {
  subject: string;
  html: string;
  text: string;
}

export function buildFasterAfter40WelcomeEmail(
  firstName?: string,
): FasterAfter40WelcomeEmail {
  const pdfUrl = `${SITE_ORIGIN}${PDF_PATH}`;
  const plateauUrl = `${SITE_ORIGIN}${PLATEAU_PATH}`;
  const logoUrl = `${SITE_ORIGIN}/images/logo-white.png`;

  const greeting = firstName ? `${firstName},` : "Hey,";

  const subject = "Your Faster After 40 guide (PDF inside)";

  const text = [
    greeting,
    "",
    "Thanks for grabbing Faster After 40.",
    "",
    `Download the PDF: ${pdfUrl}`,
    "",
    "What's inside:",
    "  - The polarised model Seiler proved and Lorang applies to Grand Tour winners",
    "  - Why 'eat less, ride more' is making you slower — and the fuelling-first fix",
    "  - 5 S&C movements adapted from Pogačar's programme for riders over 40",
    "  - The recovery equation: sleep, stress, and HRV in plain English",
    "  - Le métier — why the lone wolf cyclist always plateaus",
    "",
    "If you're not sure where you're stuck, the Plateau Diagnostic is",
    "a four-minute audit that returns a specific prescription, free:",
    plateauUrl,
    "",
    "And if you want to train alongside 100+ serious cyclists applying",
    "all five pillars together, Not Done Yet is where that happens:",
    SKOOL_URL,
    "",
    "You're not done yet.",
    "— Anthony",
    "Roadman Cycling",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${subject}</title>
  <style>
    @media (max-width: 600px) {
      .container { width: 100% !important; }
      .px { padding-left: 22px !important; padding-right: 22px !important; }
      h1.hero { font-size: 30px !important; line-height: 1.05 !important; }
    }
    a { color: #F16363; }
    :root { color-scheme: dark; }
  </style>
</head>
<body style="margin:0;padding:0;background:#1a1a1b;color:#FAFAFA;font-family:'Work Sans',-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">
  <!-- Preheader -->
  <div style="display:none;font-size:1px;color:#1a1a1b;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    The PDF is inside — 30 pages of World Tour coaching intelligence for cyclists over 40.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1b;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#252526;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td class="px" style="padding:28px 36px 12px 36px;background:#210140;border-bottom:1px solid rgba(255,255,255,0.08);">
              <img src="${logoUrl}" alt="Roadman Cycling" width="140" height="auto" style="display:block;width:140px;height:auto;border:0;outline:0;" />
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td class="px" style="padding:36px 36px 8px 36px;">
              <p style="margin:0 0 14px 0;font-family:'Bebas Neue','Work Sans',sans-serif;color:#F16363;font-size:12px;letter-spacing:0.28em;">
                YOUR GUIDE IS HERE
              </p>
              <h1 class="hero" style="margin:0 0 18px 0;font-family:'Bebas Neue','Work Sans',sans-serif;font-weight:400;font-size:38px;line-height:1;color:#FAFAFA;letter-spacing:0.01em;">
                FASTER<br/>
                <span style="color:#F16363;">AFTER 40</span>
              </h1>
            </td>
          </tr>

          <!-- Body copy -->
          <tr>
            <td class="px" style="padding:0 36px 8px 36px;">
              <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#FAFAFA;">
                ${greeting.replace(/</g, "&lt;")}
              </p>
              <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:rgba(250,250,250,0.86);">
                Cheers for grabbing Faster After 40. The PDF below is 30 pages
                of coaching intelligence distilled from five years of conversations
                with Dan Lorang, Professor Seiler, and the coaches behind Grand Tour
                wins &mdash; written for the cyclist with a job, a family, and a quiet
                refusal to accept that the best days are done.
              </p>
              <p style="margin:0 0 22px 0;font-size:16px;line-height:1.6;color:rgba(250,250,250,0.86);">
                If you only read one section today, make it Pillar 1 (Coaching) &mdash;
                that&rsquo;s the intensity distribution question, which is the one
                most riders over 40 get wrong, and where the biggest gains hide.
              </p>
            </td>
          </tr>

          <!-- Primary CTA -->
          <tr>
            <td class="px" style="padding:8px 36px 28px 36px;" align="left">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#F16363" style="border-radius:6px;">
                    <a href="${pdfUrl}" style="display:inline-block;padding:16px 28px;font-family:'Bebas Neue','Work Sans',sans-serif;font-size:16px;letter-spacing:0.12em;color:#FAFAFA;text-decoration:none;background:#F16363;border-radius:6px;font-weight:600;">
                      DOWNLOAD THE GUIDE (PDF)
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's inside -->
          <tr>
            <td class="px" style="padding:0 36px 8px 36px;">
              <p style="margin:0 0 10px 0;font-family:'Bebas Neue','Work Sans',sans-serif;color:#F16363;font-size:11px;letter-spacing:0.28em;">
                THE FIVE PILLARS
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:15px;color:#FAFAFA;">
                    <span style="color:#F16363;font-weight:600;">01</span> Coaching &mdash; the polarised model and the exact sessions World Tour coaches prescribe
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:15px;color:#FAFAFA;">
                    <span style="color:#F16363;font-weight:600;">02</span> Nutrition &mdash; the fuelling-first approach that made me lighter while eating more
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:15px;color:#FAFAFA;">
                    <span style="color:#F16363;font-weight:600;">03</span> Strength &amp; Conditioning &mdash; 5 movements from Poga&#269;ar&rsquo;s programme, adapted for you
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:15px;color:#FAFAFA;">
                    <span style="color:#F16363;font-weight:600;">04</span> Recovery &mdash; sleep, stress, HRV, and why the rules changed after 40
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#FAFAFA;">
                    <span style="color:#F16363;font-weight:600;">05</span> Le M&eacute;tier &mdash; why the lone wolf cyclist always plateaus
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary CTAs -->
          <tr>
            <td class="px" style="padding:28px 36px 8px 36px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:18px 0 12px 0;font-family:'Bebas Neue','Work Sans',sans-serif;color:#F16363;font-size:11px;letter-spacing:0.28em;">
                WHAT TO DO NEXT
              </p>
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:rgba(250,250,250,0.86);">
                If you already know where you&rsquo;re stuck &mdash; the
                <strong style="color:#FAFAFA;">Plateau Diagnostic</strong> is a
                four-minute audit that returns a specific prescription. Free.
                Built from the same coaching framework as the guide.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border:1px solid #F16363;border-radius:6px;">
                    <a href="${plateauUrl}" style="display:inline-block;padding:13px 22px;font-family:'Bebas Neue','Work Sans',sans-serif;font-size:14px;letter-spacing:0.12em;color:#F16363;text-decoration:none;font-weight:600;">
                      RUN THE PLATEAU DIAGNOSTIC &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0 0;font-size:15px;line-height:1.6;color:rgba(250,250,250,0.86);">
                And if you want to train alongside 100+ serious cyclists
                applying all five pillars together,
                <a href="${SKOOL_URL}" style="color:#F16363;">Not Done Yet</a>
                is where that happens.
              </p>
            </td>
          </tr>

          <!-- Signoff -->
          <tr>
            <td class="px" style="padding:28px 36px 32px 36px;">
              <p style="margin:0 0 6px 0;font-size:15px;line-height:1.6;color:rgba(250,250,250,0.86);">
                You&rsquo;re not done yet.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#FAFAFA;">
                &mdash; Anthony<br/>
                <span style="color:rgba(250,250,250,0.55);font-size:13px;">Roadman Cycling</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="px" style="padding:18px 36px 24px 36px;background:#1a1a1b;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;line-height:1.6;color:rgba(250,250,250,0.45);">
                Roadman Cycling &middot; You&rsquo;re receiving this because you requested the Faster After 40 guide at roadmancycling.com. One-click unsubscribe is in every Saturday Spin issue. <a href="${SITE_ORIGIN}/privacy" style="color:rgba(250,250,250,0.6);text-decoration:underline;">Privacy</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
