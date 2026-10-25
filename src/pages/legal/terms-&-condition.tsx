import Container from "@/components/container";
import Layout from "@/components/layout";
import LegalHero from "@/components/sections/legal/hero";
import SEO from "@/components/seo";
import { appConfig } from "@/utils/app-config";

const TermsAndConditionPage = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Terms & Conditions | ${appConfig.name}`,
    description: "Terms and conditions and regulatory disclosures for VyonixPay.",
    url: `${appConfig.url}/legal/terms-&-condition`,
  };

  return (
    <>
      <SEO
        title={`Terms & Conditions | ${appConfig.name}`}
        description="Terms and conditions governing the use of VyonixPay technology facilitation platform in compliance with RBI guidelines."
        canonicalUrl={`/legal/terms-&-condition`}
        ogType="website"
        jsonLd={jsonLd}
      />
      <Layout>
        <LegalHero
          title="Terms & Conditions"
          description="Regulatory disclosures, user rights, and operational terms governing the VyonixPay financial technology platform."
        />
        <section className="py-16 text-zinc-300">
          <Container className="flex flex-col justify-center py-6">
            <article className="mx-auto max-w-4xl space-y-8 leading-relaxed">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-sm text-zinc-200">
                <p className="font-bold uppercase tracking-wider text-primary">Regulatory Disclosure (RBI LSP Compliance)</p>
                <p className="mt-2">
                  VyonixPay operates strictly as a digital technology facilitation platform and acts as a <strong>Lending Service Provider (LSP)</strong> in compliance with the Reserve Bank of India (RBI) <em>Guidelines on Digital Lending dated September 2, 2022</em>. VyonixPay is not a Bank or a Non-Banking Financial Company (NBFC) and does not directly lend, issue credit cards, or accept public deposits. All credit facilities are evaluated, underwritten, and disbursed directly by RBI-regulated Banks and NBFC partners.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">1. Scope and Acceptance of Terms</h2>
                <p>
                  By accessing, browsing, or utilizing the services provided by VyonixPay ("Platform", "we", "us"), you ("User", "Customer", "Borrower") agree to be bound by these Terms and Conditions, our Privacy Policy, and all applicable laws and regulations of the Republic of India. If you do not agree to these terms, you must discontinue platform use immediately.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">2. Digital Lending Services & Partner Regulated Entities</h2>
                <p className="mb-3">
                  In accordance with the RBI regulatory framework for digital lending:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-zinc-300">
                  <li>
                    <strong>Direct Account Disbursement:</strong> All loan funds are disbursed directly from the partner Regulated Entity's bank account to your verified bank account without any pass-through or pool accounts managed by VyonixPay.
                  </li>
                  <li>
                    <strong>Key Fact Statement (KFS):</strong> Prior to the execution of any loan contract, you will be provided with an explicit, standardized Key Fact Statement (KFS) detailing the Annual Percentage Rate (APR), total interest, fees, recovery mechanisms, and look-up/cooling-off periods.
                  </li>
                  <li>
                    <strong>No Hidden Charges:</strong> All processing charges, APR, and late payment penalties are explicitly declared upfront by the lending partner.
                  </li>
                  <li>
                    <strong>Cooling-off Period:</strong> Borrowers are entitled to a cooling-off/look-up period as specified in the KFS during which they may exit the loan without penalty by repaying the principal amount and proportionate APR.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">3. Credit Card Bill Payment Facility</h2>
                <p>
                  Credit Card Bill Payments facilitated via VyonixPay are processed through authorized payment aggregators and Bharat BillPay (BBPS) operating partners licensed under the Payment and Settlement Systems Act, 2007 (PSS Act). VyonixPay acts as an authorized collection and facilitation interface and does not retain card credentials or store sensitive card verification numbers (CVV).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">4. Eligibility & User Obligations</h2>
                <ul className="list-disc pl-6 space-y-2 text-zinc-300">
                  <li>You must be an Indian citizen of at least 18 years of age possessing valid government-issued identity documents (PAN and Aadhaar/OVD).</li>
                  <li>You agree to provide true, accurate, and current information during KYC verification and credit applications.</li>
                  <li>You authorize VyonixPay and its regulated lending partners to fetch your credit information report from authorized Credit Information Companies (CICs: CIBIL, Experian, CRIF High Mark, Equifax) in compliance with the Credit Information Companies (Regulation) Act, 2005.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">5. Data Privacy & Device Access Restrictions</h2>
                <p>
                  In compliance with RBI Digital Lending directives, VyonixPay adheres to strict data minimization. The Platform does <strong>not</strong> access, store, or scrape your mobile contact lists, call logs, SMS logs, or media files. Any camera or microphone access requested is solely for one-time biometric verification or Video-KYC as mandated by regulatory authorities.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">6. Grievance Redressal Mechanism</h2>
                <p className="mb-3">
                  We are committed to resolving customer grievances swiftly in accordance with RBI instructions:
                </p>
                <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-6 space-y-2">
                  <p><strong>Nodal Grievance Redressal Officer:</strong> Compliance & Grievance Department</p>
                  <p><strong>Email:</strong> <a href="mailto:grievance@vyonixpay.com" className="text-primary hover:underline">grievance@vyonixpay.com</a></p>
                  <p><strong>Support Desk:</strong> <a href="mailto:support@vyonixpay.com" className="text-primary hover:underline">support@vyonixpay.com</a></p>
                  <p><strong>Turnaround Time (TAT):</strong> Acknowledgment within 24–48 hours; resolution within a maximum of 30 days.</p>
                  <p className="text-xs text-zinc-400 mt-2">
                    If your grievance is not resolved within 30 days, you may escalate the matter through the RBI Sachet Portal (https://sachet.rbi.org.in) or to the Reserve Bank - Integrated Ombudsman Scheme (RB-IOS).
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-3">7. Governing Law and Jurisdiction</h2>
                <p>
                  These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with the Platform shall be subject to the exclusive jurisdiction of the competent courts in India.
                </p>
              </div>
            </article>
          </Container>
        </section>
      </Layout>
    </>
  );
};

export default TermsAndConditionPage;
