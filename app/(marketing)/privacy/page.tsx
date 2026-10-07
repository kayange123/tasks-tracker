import type { Metadata } from "next";
import Link from "next/link";
import {
  ContactEmail,
  LegalDocument,
  LegalSection,
} from "@/components/legal/LegalDocument";
import { legalConfig } from "@/config/site";
import { PURGE_AFTER_DAYS } from "@/lib/softDelete";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Taskier collects, uses and protects your information.",
};

const PrivacyPage = () => {
  return (
    <LegalDocument
      title="Privacy Policy"
      summary="This policy explains what information Taskier collects when you use it, why, who helps us process it, and the choices you have."
    >
      <LegalSection id="who-we-are" title="Who we are">
        <p>
          Taskier is a task management app for teams, operated by{" "}
          {legalConfig.operator} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). For any
          question about this policy or your information, contact us at{" "}
          <ContactEmail />.
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" title="Information we collect">
        <ul>
          <li>
            <strong>Account information.</strong> When you sign up we receive
            your name, email address and profile image, and the sign-in method
            you use, through our authentication provider. We also keep track of
            the organizations you belong to.
          </li>
          <li>
            <strong>Content you create.</strong> The boards, lists and cards in
            your organizations, including their titles, descriptions, order and
            the background photo you pick for each board.
          </li>
          <li>
            <strong>Activity history.</strong> When someone creates, updates,
            deletes or restores a board, list or card, we record who did it
            (their name and profile image), what changed and when. Members of
            the organization can see this history.
          </li>
          <li>
            <strong>Billing information.</strong> If your organization upgrades
            to Pro, payment details are collected and processed by Stripe. We
            only store the Stripe customer and subscription identifiers, the
            plan and when the current billing period ends. We never see or store
            your full card number.
          </li>
          <li>
            <strong>Technical information.</strong> Our authentication provider
            sets cookies that keep you signed in. Your browser also stores your
            light or dark theme choice and which organizations are expanded in
            the sidebar. Our hosting provider processes standard request
            information, such as IP address and browser type, to deliver the
            service.
          </li>
        </ul>
        <p>
          We don&apos;t use advertising or analytics trackers, and we don&apos;t
          sell your information.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use-it" title="How we use your information">
        <ul>
          <li>
            To provide Taskier: sign you in, show your organizations and boards,
            and save your changes.
          </li>
          <li>
            To show your organization&apos;s activity history and let you undo
            deletions.
          </li>
          <li>
            To manage subscriptions, enforce the free plan&apos;s board limit
            and handle billing.
          </li>
          <li>To keep the service secure, prevent abuse and fix problems.</li>
          <li>To respond when you contact us.</li>
        </ul>
      </LegalSection>

      <LegalSection id="service-providers" title="Service providers">
        <p>
          We rely on these providers to run Taskier. Each processes information
          only as needed to provide its service:
        </p>
        <ul>
          <li>
            <strong>Clerk</strong> for sign-in, accounts and organizations.
          </li>
          <li>
            <strong>MongoDB Atlas</strong> to store boards, lists, cards,
            activity and plan details.
          </li>
          <li>
            <strong>Stripe</strong> to process payments and manage
            subscriptions.
          </li>
          <li>
            <strong>Unsplash</strong> for board background photos. Photos load
            from Unsplash&apos;s servers, so Unsplash receives your IP address
            when they appear.
          </li>
          <li>
            <strong>Vercel</strong> to host and deliver the app.
          </li>
        </ul>
        <p>
          These providers may process information in countries other than your
          own.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="Who can see your information">
        <p>
          Content in an organization, including its activity history and
          members&apos; names and profile images, is visible to the members of
          that organization. We don&apos;t share your information with anyone
          else except the providers above, or when required by law.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep it">
        <ul>
          <li>
            Deleted boards, lists and cards can be restored for{" "}
            {PURGE_AFTER_DAYS} days, after which they are permanently deleted.
          </li>
          <li>
            Other organization content and its activity history are kept while
            the organization uses Taskier.
          </li>
          <li>Account information is kept until your account is deleted.</li>
          <li>
            Billing records are kept as long as needed for accounting and legal
            obligations.
          </li>
        </ul>
        <p>
          When an organization is deleted, its boards, lists, cards, activity
          history and plan records are permanently removed, and any Pro
          subscription is cancelled right away. When an account is deleted, the
          account is removed, organizations where that person was the only
          member are deleted with it, and their entries in other
          organizations&apos; activity history are kept but shown as
          &ldquo;Deleted user&rdquo;, without their name or photo.
        </p>
      </LegalSection>

      <LegalSection id="your-choices" title="Your choices and rights">
        <p>
          You can update your name, email and profile image in your account
          settings, and edit or delete your content at any time.
        </p>
        <ul>
          <li>
            <strong>Download your data:</strong> in your account, open Data
            &amp; privacy to download your profile, memberships and activity as
            JSON or CSV files.
          </li>
          <li>
            <strong>Delete your account:</strong> also in Data &amp; privacy. If
            you&apos;re the only admin of an organization with other members,
            make someone else an admin or delete the organization first.
          </li>
          <li>
            <strong>Organizations:</strong> organization admins can export all
            of an organization&apos;s boards, lists, cards and activity, or
            delete the organization, from its settings.
          </li>
        </ul>
        <p>
          Depending on where you live, you may also have the right to access,
          correct, export or delete your information, or to object to how we use
          it. For anything you can&apos;t do yourself, contact us at{" "}
          <ContactEmail />. We may need to verify your identity first.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Security">
        <p>
          Taskier is served over HTTPS, sign-in is handled by our authentication
          provider, and each organization&apos;s content is only available to
          its members. No system is perfectly secure, so please use a strong,
          unique password or a trusted sign-in provider.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          Taskier isn&apos;t intended for children under 13, and we don&apos;t
          knowingly collect their information. If you believe a child has given
          us information, contact us and we&apos;ll delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this policy">
        <p>
          If we change this policy, we&apos;ll update the effective date above
          and, for significant changes, let you know in the app or by email. See
          also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
};

export default PrivacyPage;
