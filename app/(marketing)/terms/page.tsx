import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";

export const metadata: Metadata = {
  title: "Terms & Conditions · Oakvale Jobs",
  description:
    "The terms and conditions governing use of the Oakvale Jobs platform operated by Oakvale Learning Ltd.",
};

const LAST_UPDATED = "3 September 2026";

export default function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
        Terms &amp; Conditions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Last updated: {LAST_UPDATED}
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ "& h2": { mt: 5, mb: 1.5 }, "& p": { mb: 2 }, "& ul": { mb: 2, pl: 3 }, "& li": { mb: 1 } }}>
        <Typography paragraph>
          These Terms &amp; Conditions (the "Terms") govern your access to and use of the Oakvale Jobs
          platform at jobs.oakvaleltd.com (the "Platform"), operated by Oakvale Learning Ltd ("Oakvale",
          "we", "us", or "our"). By creating an account or using the Platform, you agree to these Terms.
          If you do not agree, please do not use the Platform.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          1. Who we are and what we do
        </Typography>
        <Typography paragraph>
          Oakvale connects certified childcare and care workers with families, employers, and agents.
          We verify identity, conduct, and credentials, and help coordinate placements. Oakvale is a
          facilitator; unless expressly stated, any engagement or contract for care services is between
          the worker and the employer, not with Oakvale.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          2. Eligibility and accounts
        </Typography>
        <Box component="ul">
          <li>You must be at least 18 years old and able to enter into a binding agreement.</li>
          <li>You must provide accurate, current, and complete information and keep it up to date.</li>
          <li>You are responsible for keeping your login credentials confidential and for all activity under your account.</li>
          <li>You must notify us promptly of any unauthorised use of your account.</li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          3. Verification and screening
        </Typography>
        <Typography paragraph>
          Workers may be required to submit identity documents, qualifications, references, and background
          checks. You agree that the information you provide is truthful and that we may verify it. While
          we take reasonable steps to screen and credential workers, we do not guarantee the suitability,
          conduct, or performance of any user, and employers remain responsible for their own hiring
          decisions.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          4. Your responsibilities
        </Typography>
        <Box component="ul">
          <li>Use the Platform lawfully and only for its intended purpose.</li>
          <li>Do not post false, misleading, defamatory, or infringing content.</li>
          <li>Do not harass, abuse, or endanger other users or the people in their care.</li>
          <li>Do not attempt to circumvent placement, payment, or safety processes.</li>
          <li>Do not interfere with, disrupt, or gain unauthorised access to the Platform.</li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          5. Placements, contracts, and payments
        </Typography>
        <Typography paragraph>
          Placements and contracts arranged through the Platform are subject to the specific terms agreed
          between the parties and any applicable fees we disclose to you. You agree to honour the
          commitments you make through the Platform, including agreed schedules, payments, and conduct
          standards. Fees payable to Oakvale, if any, will be made clear before you incur them.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          6. Reviews, complaints, and disputes
        </Typography>
        <Typography paragraph>
          The Platform provides tools for reviews and complaints. Reviews must be honest and based on
          genuine experience. We may investigate complaints and take action, including suspending or
          removing accounts, to protect the safety and integrity of the community.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          7. Content and intellectual property
        </Typography>
        <Typography paragraph>
          You retain ownership of the content you submit but grant Oakvale a licence to use it as needed
          to operate the Platform and provide our services. The Platform, its branding, and its software
          remain the property of Oakvale and its licensors and may not be copied or used without
          permission.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          8. Suspension and termination
        </Typography>
        <Typography paragraph>
          We may suspend or terminate your access if you breach these Terms, create risk to others, or use
          the Platform unlawfully. You may close your account at any time. Some obligations, such as those
          relating to completed placements, may survive termination.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          9. Disclaimers and limitation of liability
        </Typography>
        <Typography paragraph>
          The Platform is provided "as is" without warranties of any kind. To the fullest extent permitted
          by law, Oakvale is not liable for the acts or omissions of users, for indirect or consequential
          losses, or for any loss arising from a placement or engagement made through the Platform. Nothing
          in these Terms limits liability that cannot be excluded by law.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          10. Changes to these Terms
        </Typography>
        <Typography paragraph>
          We may update these Terms from time to time. When we make material changes, we will update the
          "last updated" date and, where appropriate, notify you. Continued use of the Platform after
          changes take effect constitutes acceptance of the updated Terms.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          11. Contact us
        </Typography>
        <Typography paragraph>
          Questions about these Terms can be sent to Oakvale Learning Ltd at{" "}
          <Link href="mailto:support@oakvaleltd.com">support@oakvaleltd.com</Link>.
        </Typography>
      </Box>
    </Container>
  );
}
