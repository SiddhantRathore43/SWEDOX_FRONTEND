import Container from "@/components/container";
import Layout from "@/components/layout";
import LegalHero from "@/components/sections/legal/hero";
import SEO from "@/components/seo";
import { appConfig } from "@/utils/app-config";

const PrivacyPolicyPage = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Privacy Policy | ${appConfig.name}`,
    description: "Privacy policy and data governance practices of VyonixPay.",
    url: `${appConfig.url}/legal/privacy-&-policy`,
  };

  return (
    <>
      <SEO
        title={`Privacy Policy | ${appConfig.name}`}
        description="Data protection and privacy governance practices of VyonixPay in compliance with the DPDP Act 2023 and RBI guidelines."
        canonicalUrl={`/legal/privacy-&-policy`}
        ogType="website"
        jsonLd={jsonLd}
      />
      <Layout>
        <LegalHero
          title="Privacy Policy"
          description="How VyonixPay collects, processes, and safeguards your financial and personal data in strict compliance with Indian laws."
        />
        <section className="py-16 text-zinc-300">
          <Container className="flex flex-col justify-center py-6">
            <article className="mx-auto max-w-4xl space-y-8 leading-relaxed">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-sm text-zinc-200">
                <p className="font-bold uppercase tracking-wider text-primary">Data Protection & Regulatory Compliance Statement</p>
                <p className="mt-2">
                  VyonixPay is committed to safeguarding customer personal and financial information in strict adherence to the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the <strong>Information Technology Act, 2000 (Section 43A)</strong>, the <em>SPDI Rules, 2011</em>, and the <strong>RBI Digital Lending Guidelines</strong>.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">1. Information We Collect</h2>
                <p className="mb-3">
                  We adhere strictly to the principle of <strong>data minimization</strong> and collect only data essential to providing financial facilitation:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-300">
                  <li><strong>Identity Information:</strong> Name, email address, mobile number, and PAN (for KYC verification by partner Regulated Entities).</li>
                  <li><strong>Financial Application Data:</strong> Income bracket, employment details, and loan preferences provided directly by you.</li>
                  <li><strong>Bill Payment Information:</strong> Credit card biller name and masked card reference numbers required for BBPS payment routing.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">2. Explicit Prohibition on Sensitive Device Access</h2>
                <p>
                  In direct compliance with RBI Digital Lending directives for Lending Service Providers (LSPs), <strong>VyonixPay does not access, collect, or store:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-300 mt-2">
                  <li>Your phone contact list or address book.</li>
                  <li>Your call logs, SMS logs, or chat histories.</li>
                  <li>Your device media files, gallery photos, or audio recordings.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">3. Storage & Data Localization within India</h2>
                <p>
                  In compliance with the <strong>RBI Directive on Storage of Payment System Data (April 2018)</strong>, all customer data, payment logs, transaction records, and communication histories are stored exclusively on encrypted servers located within the territory of the Republic of India.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">4. Information Sharing & Third Parties</h2>
                <p>
                  We do not sell, rent, or trade your personal data to advertisers or unauthorized third parties. Information is shared strictly on a need-to-know basis with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-300 mt-2">
                  <li><strong>Regulated Entities (Banks & NBFCs):</strong> For evaluation, credit appraisal, and statutory KYC processing of your loan requests.</li>
                  <li><strong>Authorized Payment Aggregators & BBPS:</strong> For routing and settlement of credit card bill payments.</li>
                  <li><strong>Law Enforcement & Regulatory Bodies:</strong> When mandated by applicable statutory obligations or lawful judicial orders.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">5. Your Rights Under DPDP Act 2023</h2>
                <p className="mb-3">
                  As a Data Principal, you are entitled to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-300">
                  <li>Right to access summaries of personal data processed.</li>
                  <li>Right to correction and completion of inaccurate data.</li>
                  <li>Right to erasure of personal data (subject to statutory retention requirements under PMLA).</li>
                  <li>Right to revoke consent for non-statutory data processing by contacting our Grievance Officer.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">6. Grievance Officer & Contact</h2>
                <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-6 space-y-2">
                  <p><strong>Designation:</strong> Data Protection & Grievance Officer</p>
                  <p><strong>Email:</strong> <a href="mailto:grievance@vyonixpay.com" className="text-primary hover:underline">grievance@vyonixpay.com</a></p>
                  <p><strong>General Inquiries:</strong> <a href="mailto:privacy@vyonixpay.com" className="text-primary hover:underline">privacy@vyonixpay.com</a></p>
                  <p className="text-xs text-zinc-400 mt-2">All privacy requests and grievance complaints are acknowledged within 24–48 business hours.</p>
                </div>
              </div>
            </article>
          </Container>
        </section>
      </Layout>
    </>
  );
};

export default PrivacyPolicyPage;
