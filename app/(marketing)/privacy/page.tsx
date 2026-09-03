import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";

export const metadata: Metadata = {
  title: "Privacy Policy · Oakvale Jobs",
  description:
    "How Oakvale Learning Ltd collects, uses, and protects your personal data on the Oakvale Jobs platform.",
};

const LAST_UPDATED = "3 September 2026";

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
        Privacy Policy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Last updated: {LAST_UPDATED}
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ "& h2": { mt: 5, mb: 1.5 }, "& p": { mb: 2 }, "& ul": { mb: 2, pl: 3 }, "& li": { mb: 1 } }}>
        <Typography paragraph>
          Oakvale Learning Ltd ("Oakvale", "we", "us", or "our") operates the Oakvale Jobs platform at
          jobs.oakvaleltd.com (the "Platform"), which connects childcare and care workers with families
          and employers. This policy explains what personal data we collect, how we use it, and the
          rights you have over it. We are the data controller for the personal data described here.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          1. Information we collect
        </Typography>
        <Typography paragraph>We collect the following categories of personal data:</Typography>
        <Box component="ul">
          <li>
            <strong>Account details</strong> — name, email address, phone number, password, and the role
            you register under (worker, employer, agent, or administrator).
          </li>
          <li>
            <strong>Profile and verification data</strong> — for workers this may include date of birth,
            address, photographs, work history, qualifications, certifications, references, and
            identity or background-check documents used to credential and screen you.
          </li>
          <li>
            <strong>Placement and contract data</strong> — job applications, placements, contracts,
            reviews, complaints, and related messages exchanged through the Platform.
          </li>
          <li>
            <strong>Technical data</strong> — IP address, device and browser information, and cookies or
            similar technologies used to keep you signed in and to operate the Platform.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          2. How we use your data
        </Typography>
        <Box component="ul">
          <li>To create and manage your account and provide the Platform's features.</li>
          <li>To verify identity, conduct, and credentials, and to manage placements between workers and employers.</li>
          <li>To facilitate messaging, contracts, reviews, and dispute resolution.</li>
          <li>To keep the Platform secure and prevent fraud or misuse.</li>
          <li>To comply with legal, regulatory, and safeguarding obligations.</li>
          <li>To communicate with you about your account, placements, and service updates.</li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          3. Legal bases
        </Typography>
        <Typography paragraph>
          We process your data where it is necessary to perform our contract with you, where we have a
          legitimate interest in operating and improving the Platform, where you have given consent, and
          where we are required to comply with a legal obligation. Because of the safeguarding nature of
          care work, some verification processing is necessary to protect the vital interests of the
          people being cared for.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          4. Sharing your data
        </Typography>
        <Typography paragraph>
          We share relevant profile and verification information with employers or agents involved in a
          placement so they can make informed hiring decisions. We also use trusted service providers
          (for example hosting, background checks, email, and payment processing) who process data on our
          behalf under appropriate safeguards. We do not sell your personal data. We may disclose data
          where required by law or to protect the safety of individuals.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          5. International transfers
        </Typography>
        <Typography paragraph>
          Oakvale connects workers in Nigeria with families and diaspora employers, so your data may be
          transferred and stored across borders. Where we transfer data internationally, we take steps to
          ensure it remains protected in line with applicable data-protection laws.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          6. Data retention
        </Typography>
        <Typography paragraph>
          We keep personal data for as long as your account is active and as needed to provide the
          Platform, resolve disputes, and comply with legal and safeguarding obligations. When data is no
          longer needed, we delete or anonymise it.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          7. Your rights
        </Typography>
        <Typography paragraph>
          Depending on your location, you may have the right to access, correct, delete, or restrict the
          processing of your personal data, to object to processing, and to data portability. You can
          exercise these rights by contacting us using the details below. You also have the right to
          complain to a data-protection authority.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          8. Security
        </Typography>
        <Typography paragraph>
          We use technical and organisational measures to protect your data, including encrypted
          connections and access controls. No system is completely secure, but we work to safeguard your
          information and respond promptly to any incident.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          9. Changes to this policy
        </Typography>
        <Typography paragraph>
          We may update this policy from time to time. When we make material changes, we will update the
          "last updated" date and, where appropriate, notify you.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          10. Contact us
        </Typography>
        <Typography paragraph>
          If you have questions about this policy or how we handle your data, contact Oakvale Learning Ltd
          at{" "}
          <Link href="mailto:privacy@oakvaleltd.com">privacy@oakvaleltd.com</Link>.
        </Typography>
      </Box>
    </Container>
  );
}
