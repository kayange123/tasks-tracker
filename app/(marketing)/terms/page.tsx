import type { Metadata } from "next";
import Link from "next/link";
import {
  ContactEmail,
  LegalDocument,
  LegalSection,
} from "@/components/legal/LegalDocument";
import { legalConfig } from "@/config/site";
import { MAX_FREE_BOARDS } from "@/constants/boards";
import { PURGE_AFTER_DAYS } from "@/lib/softDelete";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use Taskier.",
};

const TermsPage = () => {
  return (
    <LegalDocument
      title="Terms of Service"
      summary="These terms are an agreement between you and the operator of Taskier. By creating an account or using Taskier, you agree to them."
    >
      <LegalSection id="the-service" title="The service">
        <p>
          Taskier is operated by {legalConfig.operator} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;). It lets teams organize work into boards, lists and
          cards within organizations. We may improve, change or discontinue
          features over time.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="Your account">
        <ul>
          <li>
            You must be at least 13 years old, and old enough to agree to these
            terms where you live.
          </li>
          <li>
            Provide accurate information and keep your sign-in credentials
            secure. You&apos;re responsible for activity under your account.
          </li>
          <li>
            If you use Taskier on behalf of a company or other organization, you
            confirm that you&apos;re allowed to accept these terms for it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="organizations" title="Organizations">
        <p>
          Boards belong to organizations. Organization admins decide who is a
          member, and members can view and change the organization&apos;s
          boards, lists and cards and see its activity history.
        </p>
      </LegalSection>

      <LegalSection id="your-content" title="Your content">
        <p>
          You keep ownership of the content you add to Taskier. You give us
          permission to store, display and process it only as needed to provide
          the service to you and your organization. You&apos;re responsible for
          having the right to add it.
        </p>
        <p>
          Deleted boards, lists and cards can be restored for {PURGE_AFTER_DAYS}{" "}
          days, after which they&apos;re permanently deleted and can&apos;t be
          recovered.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable use">
        <p>Don&apos;t use Taskier to:</p>
        <ul>
          <li>break the law or infringe anyone&apos;s rights;</li>
          <li>store or share malware, spam, or harmful or abusive content;</li>
          <li>
            access other organizations&apos; data, probe or disrupt the service,
            or get around its limits;
          </li>
          <li>resell the service without our permission.</li>
        </ul>
      </LegalSection>

      <LegalSection id="plans-and-billing" title="Plans and billing">
        <ul>
          <li>
            The <strong>Free</strong> plan includes up to {MAX_FREE_BOARDS}{" "}
            boards per organization.
          </li>
          <li>
            The <strong>Pro</strong> plan costs $20 per month per organization,
            billed monthly through Stripe, and removes the board limit.
          </li>
          <li>
            Subscriptions renew each month until cancelled. You can cancel any
            time in the billing portal; cancellation takes effect at the end of
            the current billing period.
          </li>
          <li>
            Deleting an organization cancels its subscription immediately,
            without a refund for the rest of the billing period.
          </li>
          <li>Except where required by law, payments are non-refundable.</li>
          <li>
            If we change prices, we&apos;ll tell you in advance and the new
            price will apply from your next billing period.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="third-party-services" title="Third-party services">
        <p>
          Taskier uses third-party services, including Stripe for payments and
          Unsplash for board backgrounds. Their own terms apply to your use of
          them; board photos are provided under the Unsplash License. How we use
          these services is described in our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="Ending your use">
        <p>
          You can stop using Taskier at any time, and delete your account
          from Data &amp; privacy in your account settings. We may suspend or end access
          for accounts that violate these terms or put the service or other
          users at risk, and will tell you when we reasonably can.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="Disclaimers and liability">
        <p>
          Taskier is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;, without warranties of any kind, to the extent
          allowed by law. We don&apos;t guarantee it will be uninterrupted or
          error-free, so keep your own copies of important information.
        </p>
        <p>
          To the extent allowed by law, we aren&apos;t liable for indirect,
          incidental or consequential damages, or lost data, profits or revenue.
          Our total liability for any claim is limited to the amount you paid us
          in the 12 months before the claim.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="Governing law">
        <p>
          These terms are governed by the laws of {legalConfig.governingLaw}.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to these terms">
        <p>
          If we change these terms, we&apos;ll update the effective date above
          and, for significant changes, let you know in the app or by email.
          Continuing to use Taskier after changes take effect means you accept
          them.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions about these terms? Contact us at <ContactEmail />.
        </p>
      </LegalSection>
    </LegalDocument>
  );
};

export default TermsPage;
