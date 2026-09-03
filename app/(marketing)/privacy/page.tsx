import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export const metadata: Metadata = {
  title: "Privacy Policy · Oakvale Learning",
  description:
    "How Oakvale Learning looks after your personal data when you visit our website, and your privacy rights.",
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

      <Box
        sx={{
          "& h2": { mt: 5, mb: 1.5 },
          "& h3": { mt: 4, mb: 1 },
          "& p": { mb: 2 },
          "& ul": { mb: 2, pl: 3 },
          "& li": { mb: 1 },
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Introduction
        </Typography>
        <Typography component="p" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome to the Oakvale Learning privacy notice.
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          Oakvale Learning respects your privacy and is committed to protecting your personal data. This
          privacy notice will inform you as to how we look after your personal data when you visit our
          website (regardless of where you visit it from) and tell you about your privacy rights and how
          the law protects you.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          1. Purpose of this privacy notice
        </Typography>
        <Box component="ul">
          <li>
            This privacy notice aims to give you information on how Oakvale Learning collects and processes
            your personal data through your use of this website.
          </li>
          <li>
            This website is not intended for children and we do not knowingly collect data directly from
            children.
          </li>
          <li>
            It is important that you read this privacy notice together with any other privacy notice or
            fair processing notice we may provide on specific occasions when we are collecting or
            processing personal data about you so that you are fully aware of how and why we are using your
            data. This privacy notice supplements the other notices and is not intended to override them.
          </li>
        </Box>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Controller
        </Typography>
        <Box component="ul">
          <li>
            Oakvale Learning is the controller and responsible for your personal data (collectively
            referred to as Oakvale Learning, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo; in
            this privacy notice).
          </li>
          <li>
            If you have any questions about this privacy notice, including any requests to exercise your
            legal rights, please contact us using the details set out below.
          </li>
        </Box>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Contact details
        </Typography>
        <Box component="ul">
          <li>Name of contact: Joy Voysey</li>
          <li>Email address: joy.voysey@ednfoundation.org</li>
          <li>
            You have the right to make a complaint at any time to the Information Commissioner&rsquo;s
            Office (ICO), the UK supervisory authority for data protection issues (www.ico.org.uk). We
            would, however, appreciate the chance to deal with your concerns before you approach the ICO
            so please contact us in the first instance.
          </li>
          <li>
            Changes to the privacy notice and your duty to inform us of changes.
          </li>
          <li>
            It is important that the personal data we hold about you is accurate and current. Please keep
            us informed if your personal data changes during your relationship with us.
          </li>
        </Box>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Third-party links
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          This website may include links to third-party websites, plug-ins and applications. Clicking on
          those links or enabling those connections may allow third parties to collect or share data about
          you. We do not control these third-party websites and are not responsible for their privacy
          statements. When you leave our website, we encourage you to read the privacy notice of every
          website you visit.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          2. The data we collect about you
        </Typography>
        <Box component="ul">
          <li>
            Personal data, or personal information, means any information about an individual from which
            that person can be identified. It does not include data where the identity has been removed
            (anonymous data).
          </li>
          <li>
            We may collect, use, store and transfer different kinds of personal data about you which we
            have grouped together as follows:
          </li>
        </Box>
        <Box component="ul">
          <li>
            <strong>Identity Data</strong> includes first name, last name, title.
          </li>
          <li>
            <strong>Contact Data</strong> includes email address and telephone number.
          </li>
          <li>
            <strong>Technical Data</strong> includes internet protocol (IP) address, browser type and
            version, time zone setting and location, browser plug-in types and versions, operating system
            and platform and other technology on the devices you use to access this website.
          </li>
          <li>
            <strong>Profile Data</strong> includes feedback and enquiries.
          </li>
          <li>
            <strong>Usage Data</strong> includes information about how you use our website.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          3. How is your personal data collected?
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          We use different methods to collect data from and about you including through:
        </Typography>
        <Box component="ul">
          <li>
            <strong>Direct interactions.</strong> You may give us your Identity and Contact information by
            filling in forms or by corresponding with us by phone, email or otherwise. This includes
            personal data you provide when you:
            <Box component="ul" sx={{ mt: 1 }}>
              <li>request information from us about our services; or</li>
              <li>join a discussion or comment on our website;</li>
              <li>give us some feedback.</li>
            </Box>
          </li>
          <li>
            <strong>Automated technologies or interactions.</strong> As you interact with our website, we
            may automatically collect Technical Data about your equipment, browsing actions and patterns.
            We collect this personal data by using cookies, server logs and other similar technologies.
          </li>
          <li>
            <strong>Third parties or publicly available sources.</strong> We may receive personal data
            about you from various third parties as follows:
            <Box component="ul" sx={{ mt: 1 }}>
              <li>Technical Data from analytics providers such as Google based outside the EU.</li>
            </Box>
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          4. How we use your personal data
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          We will only use your personal data when the law allows us to. Most commonly, we will use your
          personal data in the following circumstances:
        </Typography>
        <Box component="ul">
          <li>
            Where we need to perform the contract we are about to enter into or have entered into with you.
          </li>
          <li>
            Where it is necessary for our legitimate interests (or those of a third party) and your
            interests and fundamental rights do not override those interests.
          </li>
          <li>Where we need to comply with a legal or regulatory obligation.</li>
        </Box>
        <Typography component="p" sx={{ mb: 2 }}>
          Generally, we do not rely on consent as a legal basis for processing your personal data other
          than in relation to sending third party direct marketing communications to you via email or text
          message. You have the right to withdraw consent to marketing at any time by contacting us.
        </Typography>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Purposes for which we will use your personal data
        </Typography>
        <Box component="ul">
          <li>
            We have set out below a description of all the ways we plan to use your personal data, and
            which of the legal bases we rely on to do so. We have also identified what our legitimate
            interests are where appropriate.
          </li>
          <li>
            Note that we may process your personal data for more than one lawful ground depending on the
            specific purpose for which we are using your data. Please contact us if you need details about
            the specific legal ground we are relying on to process your personal data where more than one
            ground has been set out below.
          </li>
        </Box>
        <Box component="ul">
          <li>
            <strong>Purpose/Activity:</strong> To register you as a new Oakvale Learning Member, User or
            Contributor.
            <br />
            <strong>Type of data:</strong> (a) Identity (b) Email address (c) Name of School / Institution
            or Business / Brand you are representing (d) Website of School / Institution or Business /
            Brand you are representing (e) Your role at the School / Institution or Business / Brand /
            family you are representing (f) Whether or not you are over 18 (g) The number of parents in
            your family (h) the number of children in your family (i) your sex (j) marketing and
            communication permissions.
          </li>
          <li>
            <strong>Purpose/Activity:</strong> To send you newsletters. To market Oakvale Learning and the
            Edtech50 to you.
            <br />
            <strong>Type of data:</strong> (a) Identity (b) Email address (c) Name of School / Institution
            or Business / Brand you are representing (d) Website of School / Institution or Business /
            Brand you are representing (e) Your role at the School / Institution or Business / Brand /
            family you are representing (j) marketing and communication permissions.
          </li>
          <li>
            <strong>Purpose/Activity:</strong> To work with or for you or your business, to ask for input
            into resources or other products, to refer customers to you. To market Oakvale Learning and
            the Edtech50 to you.
            <br />
            <strong>Type of data:</strong> (a) Identity (b) Email address (c) Name of School / Institution
            or Business / Brand you are representing (d) Website of School / Institution or Business /
            Brand you are representing (e) Your role at the School / Institution or Business / Brand /
            family you are representing (j) marketing and communication permissions.
          </li>
        </Box>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Cookies
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          You can set your browser to refuse all or some browser cookies or to alert you when websites set
          or access cookies. If you disable or refuse cookies, please note that some parts of this website
          may become inaccessible or not function properly. Further information about how we use cookies
          can be found in our cookie policy which can be found on our website.
        </Typography>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Change of purpose
        </Typography>
        <Box component="ul">
          <li>
            We will only use your personal data for the purposes for which we collected it unless we
            reasonably consider that we need to use it for another reason and that reason is compatible
            with the original purpose. If you wish to get an explanation as to how the processing for the
            new purpose is compatible with the original purpose, please contact us.
          </li>
          <li>
            If we need to use your personal data for an unrelated purpose, we will notify you and we will
            explain the legal basis which allows us to do so.
          </li>
          <li>
            Please note that we may process your personal data without your knowledge or consent, in
            compliance with the above rules, where this is required or permitted by law.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          5. Disclosures of your personal data
        </Typography>
        <Box component="ul">
          <li>
            In order to process some of our data (e.g. to turn it into information to include in articles
            and/or reports), we may have to share your personal data with a third party or parties, for
            example, data analysts or data specialists.
          </li>
          <li>
            We require all third parties to respect the security of your personal data and to treat it in
            accordance with the law. We do not allow our third-party service providers to use your
            personal data for their own purposes and only permit them to process your personal data for
            specified purposes and in accordance with our instructions.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          6. International transfers
        </Typography>
        <Box component="ul">
          <li>
            We may transfer your personal data outside the European Economic Area (EEA) if you are based
            outside the EEA.
          </li>
          <li>
            Please contact us if you want further information on the specific mechanism used by us when
            transferring your personal data out of the EEA.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          7. Data security
        </Typography>
        <Box component="ul">
          <li>
            We limit access to your personal data to those employees, agents, contractors and other third
            parties who have a business need to know. They will only process your personal data on our
            instructions and they are subject to a duty of confidentiality.
          </li>
          <li>
            We have put in place procedures to deal with any suspected personal data breach and will
            notify you and any applicable regulator of a breach where we are legally required to do so.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          8. Data retention
        </Typography>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          How long will you use my personal data for?
        </Typography>
        <Box component="ul">
          <li>
            We will only retain your personal data for as long as necessary to fulfil the purposes we
            collected it for, including for the purposes of satisfying any legal, accounting, or reporting
            requirements.
          </li>
          <li>
            To determine the appropriate retention period for personal data, we consider the amount,
            nature, and sensitivity of the personal data, the potential risk of harm from unauthorised use
            or disclosure of your personal data, the purposes for which we process your personal data and
            whether we can achieve those purposes through other means, and the applicable legal
            requirements.
          </li>
          <li>In some circumstances, you can ask us to delete your data.</li>
          <li>
            In some circumstances, we may anonymise your personal data (so that it can no longer be
            associated with you) for research or statistical purposes in which case we may use this
            information indefinitely without further notice to you.
          </li>
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          9. Your legal rights
        </Typography>
        <Box component="ul">
          <li>
            Under certain circumstances, you have rights under data protection laws in relation to your
            personal data. Please contact our data privacy manager on the details given above if you have
            any enquiries about these rights or if you wish to exercise these rights in respect of the
            personal data we hold. No fee usually required.
          </li>
          <li>
            You will not have to pay a fee to access your personal data (or to exercise any of the other
            rights). However, we may charge a reasonable fee if your request is clearly unfounded,
            repetitive or excessive. Alternatively, we may refuse to comply with your request in these
            circumstances.
          </li>
        </Box>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          What we may need from you
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          We may need to request specific information from you to help us confirm your identity and ensure
          your right to access your personal data (or to exercise any of your other rights). This is a
          security measure to ensure that personal data is not disclosed to any person who has no right to
          receive it. We may also contact you to ask you for further information in relation to your
          request to speed up our response.
        </Typography>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Time limit to respond
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          We try to respond to all legitimate requests within one month. Occasionally it may take us
          longer than a month if your request is particularly complex or you have made a number of
          requests. In this case, we will notify you and keep you updated.
        </Typography>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          10. Glossary
        </Typography>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Lawful basis
        </Typography>
        <Box component="ul">
          <li>
            <strong>Legitimate Interest</strong> means the interest of our business in conducting and
            managing our business to enable us to give you the best service/product and the best and most
            secure experience. We make sure we consider and balance any potential impact on you (both
            positive and negative) and your rights before we process your personal data for our legitimate
            interests. We do not use your personal data for activities where our interests are overridden
            by the impact on you (unless we have your consent or are otherwise required or permitted to by
            law). You can obtain further information about how we assess our legitimate interests against
            any potential impact on you in respect of specific activities by contacting us.
          </li>
          <li>
            <strong>Performance of Contract</strong> means processing your data where it is necessary for
            the performance of a contract to which you are a party or to take steps at your request before
            entering into such a contract.
          </li>
          <li>
            <strong>Comply with a legal or regulatory obligation</strong> means processing your personal
            data where it is necessary for compliance with a legal or regulatory obligation that we are
            subject to.
          </li>
        </Box>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Third parties
        </Typography>
        <Typography component="p" sx={{ mb: 1 }}>External Third Parties</Typography>
        <Box component="ul">
          <li>Service providers who provide IT and system administration services.</li>
          <li>Service providers who provide data analysis or handling services.</li>
        </Box>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Your legal rights
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>You have the right to:</Typography>
        <Box component="ul">
          <li>
            Request access to your personal data (commonly known as a &ldquo;data subject access
            request&rdquo;). This enables you to receive a copy of the personal data we hold about you and
            to check that we are lawfully processing it.
          </li>
          <li>
            Request correction of the personal data that we hold about you. This enables you to have any
            incomplete or inaccurate data we hold about you corrected, though we may need to verify the
            accuracy of the new data you provide to us.
          </li>
          <li>
            Request erasure of your personal data. This enables you to ask us to delete or remove personal
            data where there is no good reason for us continuing to process it. You also have the right to
            ask us to delete or remove your personal data where you have successfully exercised your right
            to object to processing (see below), where we may have processed your information unlawfully or
            where we are required to erase your personal data to comply with local law. Note, however, that
            we may not always be able to comply with your request of erasure for specific legal reasons
            which will be notified to you, if applicable, at the time of your request.
          </li>
          <li>
            Object to processing of your personal data where we are relying on a legitimate interest (or
            those of a third party) and there is something about your particular situation which makes you
            want to object to processing on this ground as you feel it impacts on your fundamental rights
            and freedoms. You also have the right to object where we are processing your personal data for
            direct marketing purposes. In some cases, we may demonstrate that we have compelling legitimate
            grounds to process your information which override your rights and freedoms.
          </li>
          <li>
            Request restriction of processing of your personal data. This enables you to ask us to suspend
            the processing of your personal data in the following scenarios: (a) if you want us to
            establish the data&rsquo;s accuracy; (b) where our use of the data is unlawful but you do not
            want us to erase it; (c) where you need us to hold the data even if we no longer require it as
            you need it to establish, exercise or defend legal claims; or (d) you have objected to our use
            of your data but we need to verify whether we have overriding legitimate grounds to use it.
          </li>
          <li>
            Request the transfer of your personal data to you or to a third party. We will provide to you,
            or a third party you have chosen, your personal data in a structured, commonly used,
            machine-readable format. Note that this right only applies to automated information which you
            initially provided consent for us to use or where we used the information to perform a contract
            with you.
          </li>
          <li>
            Withdraw consent at any time where we are relying on consent to process your personal data.
            However, this will not affect the lawfulness of any processing carried out before you withdraw
            your consent. If you withdraw your consent, we may not be able to provide certain products or
            services to you. We will advise you if this is the case at the time you withdraw your consent.
          </li>
        </Box>

        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          Oakvale Learning
        </Typography>
        <Typography component="p" sx={{ mb: 2 }}>
          By using this website, you agree to our use of cookies. We use cookies to provide you with a
          great experience and to help our website run effectively.
        </Typography>
      </Box>
    </Container>
  );
}
