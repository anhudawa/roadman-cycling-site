import Script from "next/script";
import { GOOGLE_ADS_ID } from "@/lib/analytics/third-party-tags";

export const GOOGLE_CONSENT_MODE_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
window.gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
window.gtag('set', 'ads_data_redaction', true);
window.gtag('set', 'url_passthrough', true);
window.gtag('js', new Date());
window.gtag('config', '${GOOGLE_ADS_ID}');
`;

export function GoogleConsentMode() {
  return (
    <>
      <script
        id="roadman-google-consent-default"
        dangerouslySetInnerHTML={{ __html: GOOGLE_CONSENT_MODE_BOOTSTRAP }}
      />
      <Script
        id="roadman-google-tag"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
