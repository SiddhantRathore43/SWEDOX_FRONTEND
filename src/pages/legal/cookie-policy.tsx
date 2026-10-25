import Container from "@/components/container";
import Layout from "@/components/layout";
import LegalHero from "@/components/sections/legal/hero";
import SEO from "@/components/seo";
import { appConfig } from "@/utils/app-config";

const CookiePolicyPage = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Cookie Policy | ${appConfig.name}`,
    description: "Cookie and tracking technology governance policy of VyonixPay.",
    url: `${appConfig.url}/legal/cookie-policy`,
  };

  return (
    <>
      <SEO
        title={`Cookie Policy | ${appConfig.name}`}
        description="Learn how VyonixPay uses essential session cookies and security tokens to protect your financial transactions."
        canonicalUrl={`/legal/cookie-policy`}
        ogType="website"
        jsonLd={jsonLd}
      />
      <Layout>
        <LegalHero
          title="Cookie Policy"
          description="How VyonixPay utilizes essential session cookies and security tokens to maintain secure financial sessions."
        />
        <section className="py-16 text-zinc-300">
          <Container className="flex flex-col justify-center py-6">
            <article className="mx-auto max-w-4xl space-y-8 leading-relaxed">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">1. What Are Cookies</h2>
                <p>
                  Cookies are small data files placed on your browser or device when you interact with our website or web application. They help us remember your secure session, authenticate API requests, and provide a seamless, secure user experience.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">2. Essential & Security Cookies</h2>
                <p className="mb-3">
                  As a financial platform, VyonixPay primarily utilizes <strong>strictly necessary security cookies</strong> and session storage tokens:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-300">
                  <li>
                    <strong>Authentication Tokens (JWT):</strong> Used to maintain your authenticated session across dashboard pages and verify authorized API calls.
                  </li>
                  <li>
                    <strong>CSRF & Idempotency Tokens:</strong> Used to protect forms against cross-site request forgery and prevent accidental duplicate payments.
                  </li>
                  <li>
                    <strong>Security Headers & Session State:</strong> Used to enforce HTTPS strict transport security and detect unauthorized session tampering.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">3. Managing Your Cookie Preferences</h2>
                <p>
                  Most modern browsers allow you to manage cookie settings via their preferences or settings menus. However, please note that blocking strictly necessary authentication tokens may prevent you from logging into your VyonixPay account or initiating bill payments.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">4. Contact & Inquiries</h2>
                <p>
                  If you have questions regarding our use of cookies or tracking mechanisms, please contact our compliance desk at{" "}
                  <a href="mailto:privacy@vyonixpay.com" className="text-primary hover:underline">
                    privacy@vyonixpay.com
                  </a>.
                </p>
              </div>
            </article>
          </Container>
        </section>
      </Layout>
    </>
  );
};

export default CookiePolicyPage;
