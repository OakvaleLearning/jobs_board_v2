import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";

export const metadata: Metadata = {
  title: "Terms & Conditions · Oakvale Learning",
  description:
    "The terms and conditions governing use of the Oakvale Learning Educational Platform.",
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

      <Box
        sx={{
          "& h2": { mt: 5, mb: 1.5 },
          "& h3": { mt: 3, mb: 1 },
          "& p": { mb: 2 },
          "& ul": { mb: 2, pl: 3 },
          "& li": { mb: 1 },
        }}
      >
        <Typography component="p" sx={{ mb: 2 }}>
          Welcome to the Oakvale Learning Educational Platform! By accessing or using our services, you
          agree to comply with these terms and conditions. Please read them carefully. If you do not agree
          with any part of these terms, you must refrain from using our platform.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          1. User Accounts
        </Typography>
        <Box component="ul">
          <li>
            <strong>1.1 Account Creation:</strong> Users must provide accurate, complete, and up-to-date
            information when registering on the platform. Oakvale Learning reserves the right to suspend or
            terminate accounts with false or incomplete information.
          </li>
          <li>
            <strong>1.2 Account Security:</strong> Users are responsible for maintaining the
            confidentiality of their login credentials and for all activities that occur under their
            account. Notify us immediately of any unauthorized use.
          </li>
          <li>
            <strong>1.3 Age Restrictions:</strong> Users must be at least 13 years old to register. Those
            under 18 must have parental or guardian consent to use the platform.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          2. Platform Usage
        </Typography>
        <Box component="ul">
          <li>
            <strong>2.1 Acceptable Use Policy:</strong> Users agree to use the platform solely for lawful
            and educational purposes. Prohibited activities include, but are not limited to:
            <Box component="ul" sx={{ mt: 1 }}>
              <li>Sharing or distributing copyrighted material without permission.</li>
              <li>Uploading harmful software or engaging in cyberattacks.</li>
              <li>Harassing, threatening, or discriminating against others on the platform.</li>
            </Box>
          </li>
          <li>
            <strong>2.2 License to Use:</strong> Oakvale Learning grants users a limited, non-exclusive,
            non-transferable license to access and use the content for personal, non-commercial
            educational purposes.
          </li>
          <li>
            <strong>2.3 Restrictions:</strong> Users may not resell, reproduce, distribute, or modify
            platform content without prior written consent from Oakvale Learning.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          3. Content Ownership and Intellectual Property
        </Typography>
        <Box component="ul">
          <li>
            <strong>3.1 Platform Content:</strong> All content on the platform, including courses, videos,
            articles, and trademarks, is owned by or licensed to Oakvale Learning and is protected under
            applicable intellectual property laws.
          </li>
          <li>
            <strong>3.2 User-Generated Content:</strong> Users retain ownership of any content they upload
            (e.g., discussion forum posts), but grant Oakvale Learning a worldwide, royalty-free license to
            use, reproduce, and distribute this content for educational purposes.
          </li>
          <li>
            <strong>3.3 Copyright Infringement:</strong> Users must not upload content they do not have
            rights to. Oakvale Learning will respond to copyright violation claims per applicable laws.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          4. Payments and Subscriptions
        </Typography>
        <Box component="ul">
          <li>
            <strong>4.1 Pricing:</strong> Details of course fees or subscription charges, including
            applicable taxes, are provided at the time of purchase.
          </li>
          <li>
            <strong>4.2 Payment Terms:</strong> Users must use valid payment methods. By subscribing to a
            recurring plan, users authorize Oakvale Learning to charge the subscription fee automatically.
          </li>
          <li>
            <strong>4.3 Refund Policy:</strong> Refunds are available within 14 days of purchase for
            courses that have not been accessed or completed. No refunds will be granted for completed
            courses.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          5. Certificates and Credentials
        </Typography>
        <Box component="ul">
          <li>
            <strong>5.1 Issuance:</strong> Certificates are awarded upon successful completion of courses
            that meet predefined requirements.
          </li>
          <li>
            <strong>5.2 Non-Academic Nature:</strong> Unless explicitly stated, certificates issued by
            Oakvale Learning do not equate to academic degrees or professional qualifications.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          6. Privacy and Data Protection
        </Typography>
        <Box component="ul">
          <li>
            <strong>6.1 User Data:</strong> Oakvale Learning collects and processes user data in compliance
            with its Privacy Policy.
          </li>
          <li>
            <strong>6.2 Third-Party Sharing:</strong> User data may be shared with third parties only with
            explicit consent or as required by law.
          </li>
          <li>
            <strong>6.3 Data Security:</strong> Oakvale Learning implements reasonable measures to protect
            user data from unauthorized access or breaches.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          7. Termination of Accounts
        </Typography>
        <Box component="ul">
          <li>
            <strong>7.1 User-Initiated Termination:</strong> Users may terminate their accounts at any time
            through their account settings.
          </li>
          <li>
            <strong>7.2 Platform-Initiated Termination:</strong> Oakvale Learning reserves the right to
            suspend or terminate accounts for violations of these terms or for other legitimate reasons,
            with or without prior notice.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          8. Disclaimers and Limitations of Liability
        </Typography>
        <Box component="ul">
          <li>
            <strong>8.1 No Guarantee of Results:</strong> Oakvale Learning does not guarantee specific
            learning outcomes, certifications, or job placements.
          </li>
          <li>
            <strong>8.2 Service Availability:</strong> While we strive to maintain uninterrupted access,
            Oakvale Learning is not liable for downtime or technical issues.
          </li>
          <li>
            <strong>8.3 Liability Limits:</strong> Oakvale Learning&rsquo;s liability for damages is
            limited to the amount paid by the user for the services.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          9. Modifications to Terms and Services
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          <strong>9.1</strong> Oakvale Learning reserves the right to modify these terms or services at any
          time. Users will be notified of significant changes, and continued use of the platform
          constitutes acceptance of the updated terms.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          10. Governing Law and Dispute Resolution
        </Typography>
        <Box component="ul">
          <li>
            <strong>10.1 Applicable Law:</strong> These terms are governed by the laws of England and
            Wales.
          </li>
          <li>
            <strong>10.2 Dispute Resolution:</strong> Disputes will be resolved through mediation or
            arbitration in accordance with applicable laws. Users agree to resolve disputes in the
            jurisdiction of England and Wales.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          11. Contact Information
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          For any questions or concerns regarding these terms, please contact us at:
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          <strong>Email:</strong>{" "}
          <Link href="mailto:support@oakvaleltd.com">support@oakvaleltd.com</Link>
          <br />
          <strong>Address:</strong> Oakvale Learning, Biddenham, England
        </Typography>

        <Typography component="p" sx={{ mb: 2 }}>
          Thank you for choosing Oakvale Learning as your learning platform!
        </Typography>
      </Box>
    </Container>
  );
}
