// Documentation content for the Oakvale Jobs Portal.
//
// Articles are plain data (no JSX) so they can be imported from server
// components and filtered by role. Icons are referenced by a string key that
// the client sidebar maps to a MUI icon — see components/docs/icons.tsx.

export type DocAudience = "worker" | "employer" | "admin";

export type DocBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: { title: string; body: string }[] }
  | { type: "callout"; variant: "info" | "success" | "warning"; title?: string; body: string };

export type DocArticle = {
  slug: string;
  title: string;
  description: string;
  /** Icon key resolved by the client sidebar. */
  icon: string;
  /** Sidebar grouping. */
  category: string;
  /** Roles allowed to read this article. */
  audiences: DocAudience[];
  readingTime: string;
  blocks: DocBlock[];
};

export const DOC_CATEGORIES = [
  "Getting Started",
  "For Care Workers",
  "For Employers",
  "For Staff & Admins",
] as const;

export const docs: DocArticle[] = [
  // ── Getting Started (everyone) ─────────────────────────────────────────
  {
    slug: "platform-overview",
    title: "Platform overview",
    description: "New here? Start with this. What the Oakvale Jobs Portal is, who it's for, and how a hire actually happens.",
    icon: "explore",
    category: "Getting Started",
    audiences: ["worker", "employer", "admin"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "Welcome to the Oakvale Jobs Portal. If this is your first time here, this page is the best place to begin — it explains the whole picture in plain language before you dive into the guides for your specific role. You don't need any technical knowledge to use the platform, and you won't break anything by clicking around.",
      },
      {
        type: "paragraph",
        text: "In one sentence: Oakvale connects trained, verified health and care professionals with the families and organisations who need them. Think of it as a carefully vetted introduction service. Unlike an ordinary job board where anyone can post or apply, everyone on Oakvale has been checked first — which is what makes it safe and trustworthy for both sides.",
      },
      {
        type: "heading",
        text: "The three jobs the platform does for you",
      },
      {
        type: "list",
        items: [
          "It verifies people. Before a worker can be hired or an employer can hire, Oakvale checks their identity, background, and qualifications. This is the ‘trust layer’ that makes everything else safe.",
          "It introduces the right people. Workers build a profile and apply for roles; employers search for workers and invite them. The platform helps the right two parties find each other.",
          "It manages the relationship. Oakvale staff (called agents) don't just make the introduction and disappear — they handle contracts, check in on how placements are going, resolve problems, and keep everyone compliant.",
        ],
      },
      {
        type: "heading",
        text: "Who uses Oakvale — and which one are you?",
      },
      {
        type: "list",
        items: [
          "Care Workers — trained professionals (carers, nurses, and similar) looking for work. You build a profile, get verified, apply to roles, and manage your placements. If that's you, head to the ‘For Care Workers’ guides.",
          "Employers — the people doing the hiring. This includes families abroad hiring care for a relative in Nigeria, as well as hospitals, care homes, and companies. If that's you, see the ‘For Employers’ guides.",
          "Agents & Admins — Oakvale's own staff who run the platform behind the scenes: verifying people, matching workers to jobs, and supporting placements. If that's you, see the ‘For Staff & Admins’ guides.",
        ],
      },
      {
        type: "heading",
        text: "How a hire happens, start to finish",
      },
      {
        type: "paragraph",
        text: "Here's the full journey so you can see where you fit in. Don't worry about memorising it — each step has its own detailed guide.",
      },
      {
        type: "steps",
        items: [
          { title: "Everyone signs up and gets verified", body: "Workers and employers create an account and prove who they are. An Oakvale agent reviews and approves them. Nothing else unlocks until this is done." },
          { title: "Workers build a profile; employers describe their needs", body: "Workers fill in their skills and experience. Employers explain who they need to hire. This is the information the platform uses to make good matches." },
          { title: "The match is made", body: "Employers search the verified worker pool (or an Oakvale agent builds them a shortlist). When an employer likes someone, they request an interview." },
          { title: "Interview and offer", body: "The two sides meet (often by video). If it goes well, the employer makes a formal offer, which an Oakvale agent checks before the worker sees it." },
          { title: "Contracts are signed", body: "Both parties sign digitally — right on their phone. Only now are personal contact details shared between them." },
          { title: "The placement begins and is supported", body: "The worker starts the role. Oakvale keeps checking in on both sides through welfare checks and is there to help if anything goes wrong." },
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "You only ever see what's relevant to you",
        body: "Your dashboard, your menus, and even this help centre automatically adjust to your role. Workers see worker guides, employers see employer guides, and Oakvale staff can see everything. So if a guide mentioned elsewhere isn't in your sidebar, it simply isn't meant for your account — nothing is broken.",
      },
    ],
  },
  {
    slug: "getting-started-first-steps",
    title: "Your first day: a checklist",
    description: "Just created an account? Follow this short checklist to get set up and know where everything lives.",
    icon: "explore",
    category: "Getting Started",
    audiences: ["worker", "employer", "admin"],
    readingTime: "4 min",
    blocks: [
      {
        type: "paragraph",
        text: "This guide is for anyone who has just signed up and is looking at the screen thinking ‘okay… now what?’. We'll walk through the very first things to do and point out where the important buttons live. Take it at your own pace — you can always come back to this page.",
      },
      {
        type: "heading",
        text: "Finding your way around the screen",
      },
      {
        type: "list",
        items: [
          "The sidebar (left edge of the screen) is your main menu. Every section of the platform is a link here. On a phone, tap the ☰ menu icon to open it.",
          "The top bar (across the top) holds your notifications (the 🔔 bell icon) and your account menu (your avatar or initials in the top-right corner).",
          "The main area (the middle, where most of the screen is) shows whatever page you've clicked. Your dashboard — your home base — is the first thing you see when you log in.",
        ],
      },
      {
        type: "heading",
        text: "What to do first",
      },
      {
        type: "steps",
        items: [
          { title: "Confirm your email or phone", body: "If we sent you a confirmation link or code when you signed up, complete that first. It proves the account is really yours and unlocks the next steps." },
          { title: "Look at your dashboard", body: "Your dashboard tells you what to do next. It often shows a progress bar or a to-do list — for example, ‘complete your profile’ or ‘verification pending’. Treat it as your guide." },
          { title: "Complete the next unfinished step", body: "Follow whatever your dashboard is prompting you to do. For workers that's usually building a profile; for employers it's usually finishing verification. The role-specific guides in this help centre walk through each one." },
          { title: "Set your password and check notifications", body: "Open the account menu (top-right) to make sure your password is one you'll remember and that your contact details are correct, so you don't miss important alerts." },
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "There's no rush and nothing is final",
        body: "Almost everything you enter can be edited later, and your progress saves as you go. If you have to stop halfway through, just log back in and pick up where you left off.",
      },
      {
        type: "callout",
        variant: "success",
        title: "Stuck? Help is always one click away",
        body: "The ‘Help & Docs’ link in your sidebar brings you right back to this help centre. And for anything the guides don't answer, you can reach an Oakvale team member through the platform's messaging.",
      },
    ],
  },
  {
    slug: "account-and-security",
    title: "Your account & staying safe",
    description: "How to sign in, change your password, understand notifications, and stay safe on the platform.",
    icon: "shield",
    category: "Getting Started",
    audiences: ["worker", "employer", "admin"],
    readingTime: "4 min",
    blocks: [
      {
        type: "paragraph",
        text: "Your account is your identity on Oakvale, so it's worth spending two minutes to keep it secure. This guide explains the basics in everyday language — no technical background needed.",
      },
      {
        type: "heading",
        text: "Signing in and out",
      },
      {
        type: "paragraph",
        text: "You sign in with the email address and password you chose when you registered. When you're finished — especially on a shared or public computer — open the account menu in the top-right corner and choose ‘Sign out’. This makes sure nobody else can use your account after you.",
      },
      {
        type: "heading",
        text: "Changing your password",
      },
      {
        type: "steps",
        items: [
          { title: "Open the account menu", body: "Click your avatar (or your initials) in the very top-right corner of any page, then choose ‘Account settings’." },
          { title: "Find the password section", body: "Look for ‘Change password’. You'll be asked for your current password first — this confirms it's really you making the change." },
          { title: "Enter a new password twice", body: "Type your new password, then type it again to confirm there are no typos. Choose something you don't use on other websites." },
          { title: "Save", body: "Click save. You'll usually stay logged in, but you may be asked to sign in again with the new password — that's normal." },
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Forgot your password?",
        body: "On the login page, click ‘Forgot password’. We'll email you a secure link to set a new one. The link is time-limited for your safety, so use it soon after you request it.",
      },
      {
        type: "heading",
        text: "Understanding notifications",
      },
      {
        type: "paragraph",
        text: "Notifications are how the platform keeps you informed — for example, when someone messages you or your application status changes. You'll see them in three places: the bell icon (🔔) at the top of the screen for everyday updates, plus SMS text messages and emails for the important ones like interview invitations and offers. Keep your phone number and email up to date in Account settings so nothing slips past you.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Golden rule: keep conversations on the platform",
        body: "For your safety and to keep a fair record, all messaging between workers and employers happens inside Oakvale. Never share your personal phone number, home address, or bank details in messages, and be cautious of anyone who asks you to move the conversation to WhatsApp or email. Personal contact details are only exchanged officially once a contract is signed. If someone pressures you otherwise, report it.",
      },
    ],
  },

  // ── For Care Workers ───────────────────────────────────────────────────
  {
    slug: "worker-complete-your-profile",
    title: "Step 1 — Complete your profile",
    description: "Your profile is how employers find you. Here's how to build one that stands out, section by section.",
    icon: "person",
    category: "For Care Workers",
    audiences: ["worker"],
    readingTime: "6 min",
    blocks: [
      {
        type: "paragraph",
        text: "Think of your profile as your digital CV inside Oakvale. It's the single most important thing you do as a worker, because it's what employers see when they're deciding who to interview. A complete, well-written profile gets far more attention than a half-finished one. This guide walks you through every section and what to put in it.",
      },
      {
        type: "callout",
        variant: "info",
        title: "You don't have to finish it all at once",
        body: "Your progress saves automatically at every step. You can start on your phone during a break, stop, and finish later on another device. There's no penalty for taking your time.",
      },
      {
        type: "heading",
        text: "Filling in each section",
      },
      {
        type: "steps",
        items: [
          { title: "Personal information", body: "Start with the basics: your full name, the city or area you live in, the languages you speak, and how to reach you. Use your real, legal name here — it needs to match the ID you'll upload during verification, or approval gets delayed." },
          { title: "Skills & experience", body: "This is where you sell yourself. List the specific care skills you have (for example, dementia care, post-operative recovery, or paediatric care), your past jobs with rough dates, and any references. Be specific — ‘3 years caring for elderly clients with mobility needs’ tells an employer far more than ‘experienced carer’." },
          { title: "Employment preferences", body: "Tell employers what you're looking for: whether you're available now or later, whether you'd relocate for a role, whether you want live-in or live-out work, full-time or part-time, and your salary expectations. Being honest here means you're matched to roles you'll actually want." },
          { title: "Video introduction (optional but recommended)", body: "A short 30–60 second video — just you talking about your experience and what you enjoy about care work — lets employers get a feel for you before an interview. It's optional, but profiles with a video tend to get noticed more. Record it in a quiet, well-lit spot." },
        ],
      },
      {
        type: "heading",
        text: "What makes a profile strong",
      },
      {
        type: "list",
        items: [
          "Be specific about skills — name the conditions and care types you've worked with, not just ‘caring’.",
          "Fill in every section you can — employers can filter searches, and empty fields mean you won't show up in some of them.",
          "Check your spelling — a tidy profile signals you're professional and reliable.",
          "Keep it up to date — whenever you gain a new skill or finish a course, add it.",
        ],
      },
      {
        type: "callout",
        variant: "success",
        title: "Reach the completion mark to become searchable",
        body: "Your dashboard shows a completion ring — a circle that fills up as you add more to your profile. Once you cross the completion threshold and your identity has been approved, your profile becomes visible to employers searching for workers. Until then, employers can't find you, so getting past this mark is your first real goal.",
      },
    ],
  },
  {
    slug: "worker-verification-and-certificate",
    title: "Step 2 — Get verified & validate your certificate",
    description: "The trust checks that turn you into a hireable, ‘Oakvale Verified’ worker — explained simply.",
    icon: "verified",
    category: "For Care Workers",
    audiences: ["worker"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "Employers on Oakvale hire with confidence because every worker is checked before they can be found. This guide explains the three checks you'll go through, why each one matters, and what happens after you submit. None of them are difficult — mostly it's uploading a few documents and then waiting for an Oakvale agent to review them.",
      },
      {
        type: "heading",
        text: "The three checks that build your trust",
      },
      {
        type: "list",
        items: [
          "Identity verification — proves you are who you say you are. This protects both you and the families you'll work with.",
          "Background check — confirms you have no history that would make you unsuitable for care work. It's standard for the whole industry.",
          "Certificate validation — confirms you hold a genuine Oakvale training certificate, which is the qualification employers trust most.",
        ],
      },
      {
        type: "paragraph",
        text: "Each check you pass adds a ‘badge’ to your profile — a small mark employers can see at a glance that tells them you've been verified.",
      },
      {
        type: "heading",
        text: "How to complete each check",
      },
      {
        type: "steps",
        items: [
          { title: "Upload your identity documents", body: "Go to the verification section and upload a government ID — your NIN slip, international passport, voter's card, or driver's licence — plus a selfie and something showing your address. Make sure photos are clear and the whole document is visible, with no fingers over the corners. An Oakvale agent then reviews them, usually within a couple of working days." },
          { title: "Give consent for a background check", body: "You'll be asked to tick a box confirming you agree to a background check. Once you consent, Oakvale submits the request for you. The status starts as ‘Pending’ and later changes to ‘Clear’. If anything needs a closer look, an agent will contact you — it doesn't automatically mean a problem." },
          { title: "Validate your Oakvale certificate", body: "Enter your Oakvale Certificate Number (the reference on the certificate you received after training) in the certificate section. The system checks it against Oakvale's records. When it matches, your training programme, completion date, and CPD hours fill in automatically — you don't have to type them." },
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "What is CPD?",
        body: "CPD stands for ‘Continuing Professional Development’ — short courses and refreshers that keep your skills current. Oakvale tracks your CPD hours so employers know your training is up to date. You'll be reminded when it's time to refresh, and this article's companion guide on placements explains it more.",
      },
      {
        type: "callout",
        variant: "success",
        title: "The ‘Oakvale Verified’ badge is your biggest asset",
        body: "When your certificate is validated, your profile earns the ‘Oakvale Verified’ badge. This is the single strongest trust signal an employer looks for — verified workers get noticeably more interest. Getting this badge should be your priority after completing your profile.",
      },
    ],
  },
  {
    slug: "worker-browse-and-apply",
    title: "Step 3 — Browse & apply for jobs",
    description: "How to find roles that fit you and send applications that get noticed.",
    icon: "work",
    category: "For Care Workers",
    audiences: ["worker"],
    readingTime: "4 min",
    blocks: [
      {
        type: "paragraph",
        text: "Once your profile is complete and your certificate is validated, the fun part begins: finding work. This guide shows you how to browse the roles employers have posted, narrow them down to the ones that suit you, and apply.",
      },
      {
        type: "heading",
        text: "Finding roles that fit",
      },
      {
        type: "steps",
        items: [
          { title: "Open ‘Browse Jobs’", body: "Click ‘Browse Jobs’ in your sidebar. You'll see a list of all the roles currently open. Each card shows the key facts — the type of work, the location, and whether it's live-in or live-out." },
          { title: "Use the filters to narrow down", body: "There are usually far too many roles to read every one. Use the filters (by category, location, and employment type) to show only the roles that match what you're looking for. This saves time and helps you focus." },
          { title: "Open a role to read the full details", body: "Click any role to see everything: the full list of requirements, the hours, the pay, and what the employer is looking for. Read this carefully so you know whether you're a good fit before applying." },
          { title: "Apply", body: "When a role suits you, click ‘Apply’. Your profile is sent to the employer automatically — you don't have to re-type your details. The role then appears under ‘My Applications’." },
        ],
      },
      {
        type: "heading",
        text: "Tracking your applications",
      },
      {
        type: "paragraph",
        text: "Every role you apply to shows up in ‘My Applications’, along with its current status — for example, whether the employer has viewed it, invited you to interview, or made a decision. Check this page regularly so you always know where you stand, and you'll be notified when anything changes.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Apply thoughtfully, not to everything",
        body: "It's tempting to apply to every role, but employers value applicants who genuinely match. Applying to roles that suit your skills and preferences gives you a much better chance than applying to everything at once.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Can't apply yet? Here's why",
        body: "If the ‘Apply’ button is greyed out or blocked, your dashboard will tell you the reason — most often it's a profile that isn't quite complete, verification that's still being reviewed, or CPD that's overdue and needs refreshing. Fix the item it points to, and applications will unlock.",
      },
    ],
  },
  {
    slug: "worker-interviews-and-offers",
    title: "Step 4 — Interviews & offers",
    description: "What to expect when an employer is interested, and how to handle an offer.",
    icon: "handshake",
    category: "For Care Workers",
    audiences: ["worker"],
    readingTime: "4 min",
    blocks: [
      {
        type: "paragraph",
        text: "When an employer likes your profile, things move to the next stage: an interview, and if that goes well, a formal offer. This guide explains what each step involves so there are no surprises. You'll be notified both in the app and by SMS whenever there's something for you to respond to.",
      },
      {
        type: "heading",
        text: "The interview",
      },
      {
        type: "steps",
        items: [
          { title: "You receive an interview request", body: "An employer proposes a time (and sometimes a format, like a video call). You'll get a notification asking you to respond." },
          { title: "Accept a time or suggest another", body: "If the proposed time works, accept it. If it doesn't, you can suggest an alternative — employers expect this and it's completely normal." },
          { title: "Attend the interview", body: "Once confirmed, the interview appears on your dashboard so you won't forget it. Treat it like any job interview: be on time, find a quiet spot, and be ready to talk about your experience." },
        ],
      },
      {
        type: "heading",
        text: "The offer",
      },
      {
        type: "paragraph",
        text: "If the interview goes well, the employer makes you a formal offer. Importantly, an Oakvale agent reviews every offer before it reaches you, to make sure the terms are fair and correct — so you can trust that what you see is legitimate.",
      },
      {
        type: "steps",
        items: [
          { title: "Read the offer carefully", body: "An offer spells out the role, the start date, the salary, the hours, and any conditions. Take your time to read all of it. If anything is unclear, ask before responding." },
          { title: "Accept, decline, or negotiate", body: "You have three choices. Accepting begins your contract and onboarding. Declining politely closes it. If you'd like different terms — say, a different start date or salary — choose to negotiate, which flags it to your Oakvale account manager to help sort out." },
          { title: "What happens after you accept", body: "Accepting doesn't mean you start work that instant. It moves you to the contract stage, where the agreement is prepared for both you and Oakvale to sign. See the contracts guide for what comes next." },
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "It's okay to say no",
        body: "You're never obliged to accept an offer. If a role isn't right for you, declining is perfectly acceptable and won't count against you. It's better for everyone that placements are a genuine fit.",
      },
    ],
  },
  {
    slug: "worker-contracts",
    title: "Step 5 — Contracts & digital signing",
    description: "How to read and sign your placement agreement — right from your phone.",
    icon: "description",
    category: "For Care Workers",
    audiences: ["worker"],
    readingTime: "3 min",
    blocks: [
      {
        type: "paragraph",
        text: "Once you accept an offer, Oakvale prepares your Worker Placement Agreement — the official contract for your new role. Both you and Oakvale need to sign it before the placement can officially start. This guide explains how, and reassures you that signing is simple and doesn't require any special app or printer.",
      },
      {
        type: "heading",
        text: "What the agreement covers",
      },
      {
        type: "paragraph",
        text: "The Worker Placement Agreement sets out the details of your role, the terms you're agreeing to, and a code of conduct — the standards Oakvale expects everyone to follow. It's there to protect you as much as anyone, by putting the arrangement in clear writing.",
      },
      {
        type: "heading",
        text: "Signing, step by step",
      },
      {
        type: "steps",
        items: [
          { title: "Open the agreement", body: "From your placement, click to open the contract. It opens on screen so you can read the whole thing — scroll through and take your time." },
          { title: "Read it fully before signing", body: "Make sure you understand the role, the terms, and the code of conduct. If anything doesn't look right, message your Oakvale account manager before you sign, not after." },
          { title: "Sign digitally", body: "Signing here doesn't need a pen or a printer. You simply tick a consent box and confirm with your account — that counts as your legal signature. This means it works on any phone, anywhere." },
          { title: "Keep your copy", body: "Once signed, a PDF copy of the agreement stays in your dashboard permanently. You can open or download it any time you need it for your records." },
        ],
      },
      {
        type: "callout",
        variant: "success",
        title: "Signing is the last step before you start",
        body: "When both you and Oakvale have signed, your placement becomes active and your contact details are shared with the employer so you can coordinate your start. You're all set.",
      },
    ],
  },
  {
    slug: "worker-placements-and-welfare",
    title: "Step 6 — Your placement, welfare & CPD",
    description: "Everything about managing an active role: welfare check-ins, staying compliant, and who to call.",
    icon: "assignment",
    category: "For Care Workers",
    audiences: ["worker"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "Congratulations — you've been placed! From here on, your placement dashboard is your home base. It shows your current role, when your welfare check-ins are due, and your CPD status. This guide explains what these mean and what's expected of you so you can settle in with confidence.",
      },
      {
        type: "heading",
        text: "Welfare checks — Oakvale checking you're okay",
      },
      {
        type: "paragraph",
        text: "A welfare check is simply Oakvale making sure your placement is going well and that you're safe and happy. Your assigned account manager will check in with you regularly. There's nothing to prepare — just stay reachable so the check can happen, and be honest about how things are going. These check-ins are your chance to raise anything, big or small.",
      },
      {
        type: "heading",
        text: "CPD — keeping your training current",
      },
      {
        type: "paragraph",
        text: "As covered in the verification guide, CPD (Continuing Professional Development) is the ongoing learning that keeps your skills sharp. Oakvale tracks your CPD hours and will remind you well before a refresh is due. Keeping it current matters for a practical reason:",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Overdue CPD pauses new applications",
        body: "If your CPD falls overdue, you can continue your current placement, but you won't be able to apply for new roles until you've refreshed it. So when a CPD reminder arrives, act on it promptly to keep your options open.",
      },
      {
        type: "heading",
        text: "Your responsibilities during a placement",
      },
      {
        type: "list",
        items: [
          "Stay reachable for welfare checks so your account manager can confirm you're doing well.",
          "Keep your CPD up to date — respond to reminders before the deadline.",
          "Confirm you've read your pre-placement briefing — a placement is only marked ‘Active’ once you have. The briefing prepares you for the specific role and household or workplace.",
          "Raise concerns early — don't wait. Small issues are easier to solve than big ones.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Your account manager is your first point of contact",
        body: "For anything at all about your placement — your schedule, a worry, a question, or a change in circumstances — message your assigned Oakvale account manager. They're there specifically to support you, so use them.",
      },
    ],
  },
  {
    slug: "worker-messaging-and-complaints",
    title: "Messaging safely & raising a complaint",
    description: "How to communicate safely on the platform, and exactly what to do if something goes wrong.",
    icon: "chat",
    category: "For Care Workers",
    audiences: ["worker"],
    readingTime: "4 min",
    blocks: [
      {
        type: "paragraph",
        text: "Good communication keeps a placement running smoothly, and Oakvale gives you a safe way to do it. This guide covers how messaging works and — just as importantly — how to raise a complaint if you ever feel something isn't right. Knowing this before you need it means you'll never feel stuck.",
      },
      {
        type: "heading",
        text: "Messaging the safe way",
      },
      {
        type: "paragraph",
        text: "All your conversations with employers and your account manager happen through Oakvale's in-app messaging. This isn't to make life harder — it's for your protection. Because messages are logged, there's always a clear record if a disagreement ever comes up, and Oakvale agents can see the conversation to help.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Never move to WhatsApp or share personal contacts",
        body: "Keep everything on the platform. Don't share your personal phone number, home address, or bank details in messages, and be wary of anyone who asks you to. If a person pushes to talk off-platform before a contract is signed, that's a red flag — report it.",
      },
      {
        type: "heading",
        text: "Raising a complaint",
      },
      {
        type: "paragraph",
        text: "If something goes wrong — you're not being treated fairly, conditions aren't what was agreed, or you feel unsafe — you have every right to raise a complaint, and doing so will never count against you. Here's how.",
      },
      {
        type: "steps",
        items: [
          { title: "Open ‘Complaints’", body: "Find ‘Complaints’ in your sidebar and start a new case." },
          { title: "Describe what happened", body: "Choose the category that best fits, then explain the situation in your own words. Attach any evidence you have — photos, screenshots, or documents help the agent understand quickly." },
          { title: "Track the case", body: "You'll get a case reference number and updates as an Oakvale agent looks into it. You can follow its progress from the same Complaints page." },
        ],
      },
      {
        type: "callout",
        variant: "warning",
        title: "If you ever feel unsafe, act immediately",
        body: "Serious safety concerns are treated as the highest priority and get an immediate response. Don't wait — raise it straight away. You can also report a problem from directly within any message. Your safety always comes first.",
      },
    ],
  },

  // ── For Employers ──────────────────────────────────────────────────────
  {
    slug: "employer-registration",
    title: "Step 1 — Register & get verified",
    description: "The first step for every employer: proving who you are so you can search and hire.",
    icon: "business",
    category: "For Employers",
    audiences: ["employer"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "Welcome. Before you can search for workers or post a role, Oakvale needs to verify your account. This keeps the platform safe for the workers, and it's a one-time step. This guide explains what's involved — it differs slightly depending on what kind of employer you are, so start by finding yourself below.",
      },
      {
        type: "heading",
        text: "Which type of employer are you?",
      },
      {
        type: "list",
        items: [
          "A diaspora family — you live abroad (typically the UK or US) and want to hire care for a relative in Nigeria. You'll be looked after by a named Oakvale account manager who does much of the work for you.",
          "A corporate employer — you're a hospital, care home, NGO, or company hiring staff. After approval you get self-service tools to post roles and search directly.",
        ],
      },
      {
        type: "heading",
        text: "What you'll need to verify",
      },
      {
        type: "steps",
        items: [
          { title: "If you're a diaspora family", body: "You'll provide proof of your residence abroad and a form of ID. Once verified, you're assigned a dedicated account manager. Rather than posting public job adverts, you'll work through this account manager, who handpicks candidates for you — a more personal, managed service." },
          { title: "If you're a corporate employer", body: "You'll provide your CAC registration number (your official Nigerian company registration) and verify your company email domain — this simply confirms you really work for the organisation. Once approved, self-service job posting and worker search unlock for you." },
          { title: "Submit and wait for review", body: "Fill in the registration form and submit your documents. An Oakvale agent then reviews everything. You'll be notified as soon as you're approved." },
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Verification usually takes up to 2 working days",
        body: "You can submit your registration right away, but searching for workers and posting roles stay locked until an agent has finished checking your details. If it's taking longer than expected, reach out and we'll chase it up.",
      },
    ],
  },
  {
    slug: "employer-assessment",
    title: "Step 2 — Tell us who you need",
    description: "The assessment that drives good matches. Get this right and the right workers come to you.",
    icon: "assignmentInd",
    category: "For Employers",
    audiences: ["employer"],
    readingTime: "4 min",
    blocks: [
      {
        type: "paragraph",
        text: "After your account is approved, the next step is telling Oakvale exactly who you need. This is the information that powers matching — the better you describe your needs, the better the candidates you'll see. Think of it as briefing a recruiter: the more precise you are, the closer the fit.",
      },
      {
        type: "heading",
        text: "Two forms, depending on your type",
      },
      {
        type: "list",
        items: [
          "Diaspora families complete a Care Needs Assessment — a description of the person who needs care and what that care involves.",
          "Corporate employers complete a Workforce Requirements form — how many staff you need and the kind of roles they'll fill.",
        ],
      },
      {
        type: "heading",
        text: "Completing the assessment",
      },
      {
        type: "steps",
        items: [
          { title: "Describe the need", body: "For families: who is being cared for, their age, and any conditions or specific needs (for example, mobility support or dementia care). For corporates: how many staff you need and the groups they'll be serving. Be honest and detailed — this shapes everything that follows." },
          { title: "Set your requirements", body: "Specify the specialist skills you need, any language preferences, the hours, the location, and whether the role is live-in (the worker stays on-site) or live-out (they travel in). Every detail here helps filter out unsuitable matches before they reach you." },
          { title: "Submit", body: "Once you submit, your account manager or Oakvale's matching tool uses your answers to build a shortlist of suitable, verified workers tailored to what you described." },
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Keep your details consistent",
        body: "The care type or sector you choose here carries over into later forms and contracts. If your needs change later, come back and update this assessment so everything downstream stays accurate.",
      },
    ],
  },
  {
    slug: "employer-search-and-shortlist",
    title: "Step 3 — Search workers & build a shortlist",
    description: "How to find verified workers, understand what you're seeing, and organise your favourites.",
    icon: "search",
    category: "For Employers",
    audiences: ["employer"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "Now for the part you came for: finding your worker. Oakvale lets you search a pool where everyone has already been verified, so you can focus purely on fit rather than worrying about whether someone is genuine. This guide explains how to search, what the badges and labels mean, and how to keep track of candidates you like.",
      },
      {
        type: "heading",
        text: "Searching and filtering",
      },
      {
        type: "paragraph",
        text: "The search page lets you narrow the worker pool down to exactly who you're after. You can filter by workforce category, certification, background-check status, location, specific skills, languages spoken, availability, and years of experience. Start broad, then add filters one at a time to see the pool shrink to your ideal candidates.",
      },
      {
        type: "heading",
        text: "Reading a worker's result",
      },
      {
        type: "list",
        items: [
          "Badges — small marks showing a worker has passed a check. Look for the certification badge and background-check badge; these tell you at a glance that the worker is verified.",
          "Top skills — the worker's headline skills, so you can quickly judge fit.",
          "Availability — whether they can start now or later, and what hours they want.",
        ],
      },
      {
        type: "heading",
        text: "Building and managing a shortlist",
      },
      {
        type: "steps",
        items: [
          { title: "Save workers you like", body: "When a worker looks promising, save them to a shortlist. You can keep separate shortlists for different roles or vacancies so things stay organised." },
          { title: "Track each candidate's stage", body: "Every saved worker has a status you can update as things progress: Saved, Interview Requested, Offer Made, Placed, or Rejected. This keeps your hiring tidy when you're considering several people at once." },
          { title: "Move forward", body: "When you're ready to take the next step with a candidate, request an interview (covered in the next guide)." },
        ],
      },
      {
        type: "callout",
        variant: "warning",
        title: "Worker contact details are protected",
        body: "You won't see a worker's phone number, email, or home address while browsing — these stay private until a contract is signed, for the worker's safety. To reach a candidate before then, use the platform's messaging or go through your Oakvale account manager. This protects you too, by keeping a clear record.",
      },
    ],
  },
  {
    slug: "employer-offers-and-hiring",
    title: "Step 4 — Interviews, offers & hiring",
    description: "Turning a promising candidate into a confirmed hire, step by step.",
    icon: "handshake",
    category: "For Employers",
    audiences: ["employer"],
    readingTime: "4 min",
    blocks: [
      {
        type: "paragraph",
        text: "You've found someone who looks right — now it's time to meet them and, hopefully, hire them. This guide walks through the interview, the offer, and what happens once your new worker accepts.",
      },
      {
        type: "heading",
        text: "The interview",
      },
      {
        type: "steps",
        items: [
          { title: "Request an interview", body: "From the worker's profile, propose a format (such as a video call) and a few possible times. The worker responds to confirm or suggest an alternative." },
          { title: "Hold the interview and log the outcome", body: "Meet the candidate at the agreed time. Afterwards, record how it went in the platform — this keeps your hiring organised and helps your account manager support you." },
        ],
      },
      {
        type: "heading",
        text: "Making an offer",
      },
      {
        type: "steps",
        items: [
          { title: "Enter the offer details", body: "If you'd like to hire the candidate, make a formal offer. You'll specify the role, the start date, the employment type, the salary, the hours, and any conditions." },
          { title: "Oakvale reviews it", body: "Every offer is checked by an Oakvale agent before it reaches the worker. This makes sure the terms are fair and complete — protecting both sides and reducing back-and-forth." },
          { title: "The worker responds", body: "The worker can accept, decline, or ask to negotiate. You'll be notified of their decision." },
        ],
      },
      {
        type: "heading",
        text: "Onboarding your new hire",
      },
      {
        type: "paragraph",
        text: "Once the worker accepts and both sides have signed the contracts (covered in the next guide), you receive the worker's contact details and a placement confirmation. At that point the working relationship is official and you can coordinate their start directly. See the contracts and billing guide for what happens with agreements and payment.",
      },
      {
        type: "callout",
        variant: "info",
        title: "Not the right fit? That's fine",
        body: "If an interview doesn't go well, simply update the candidate's status and continue with others on your shortlist. There's no obligation to make an offer to anyone you've interviewed.",
      },
    ],
  },
  {
    slug: "employer-contracts-and-billing",
    title: "Step 5 — Contracts, billing & payments",
    description: "Signing agreements and understanding how invoicing works for your account type.",
    icon: "receipt",
    category: "For Employers",
    audiences: ["employer"],
    readingTime: "4 min",
    blocks: [
      {
        type: "paragraph",
        text: "Hiring someone generates the paperwork that makes the arrangement official. Don't worry — it's all digital and straightforward. This guide explains the agreements you'll sign and how payment works, which differs a little depending on whether you're a family or a corporate employer.",
      },
      {
        type: "heading",
        text: "The agreements you'll sign",
      },
      {
        type: "paragraph",
        text: "When you hire, an Employer Service Agreement is generated — the contract between you and Oakvale for the placement. Corporate partners also sign an Annual Partnership Agreement, which covers the ongoing relationship. Both you and Oakvale sign digitally (a tick-and-confirm, no printing required) before the placement goes active.",
      },
      {
        type: "heading",
        text: "How billing works",
      },
      {
        type: "list",
        items: [
          "Diaspora families are invoiced in pounds or dollars (GBP/USD). Once your payment is confirmed, the placement is triggered and can begin.",
          "Corporate employers are invoiced in naira (NGN) through Paystack, usually on 30-day payment terms.",
          "You can track every invoice's status — Issued, Received, or Overdue — from your Billing dashboard, so you always know what's outstanding.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Corporate employers: monitor CPD compliance",
        body: "If you're a corporate partner, your dashboard includes a live CPD panel showing the training status of every worker you've placed, and you can download a compliance report as a PDF whenever you need one — handy for your own records and audits.",
      },
    ],
  },
  {
    slug: "employer-placements",
    title: "Step 6 — Managing your placements",
    description: "Keeping an eye on active placements, welfare reports, and your replacement guarantee.",
    icon: "assignment",
    category: "For Employers",
    audiences: ["employer"],
    readingTime: "4 min",
    blocks: [
      {
        type: "paragraph",
        text: "Once a worker starts, Oakvale doesn't step back — the platform helps you oversee the placement and steps in if anything needs attention. This guide explains what to expect during an active placement and the protections you have.",
      },
      {
        type: "heading",
        text: "Your placement record",
      },
      {
        type: "paragraph",
        text: "Each active placement has its own record showing the role, the dates, the Oakvale account manager assigned to it, and your replacement-guarantee window. It's the single place to see everything about that hire.",
      },
      {
        type: "heading",
        text: "What Oakvale does for you",
      },
      {
        type: "list",
        items: [
          "Welfare reports — for diaspora placements, Oakvale emails you a report each month to the address on your account, so you know how things are going even from afar.",
          "Replacement guarantee — if a placement doesn't work out within the guarantee window, Oakvale sources a replacement worker at no additional placement fee. This protects your investment.",
          "Complaints and concerns — if you have an issue with attendance, performance, or conduct, raise it through ‘Complaints’. Each type of issue has a response time (an SLA) so you know it'll be handled promptly.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Raise concerns early",
        body: "If something isn't working, flag it sooner rather than later. Early conversations are much easier to resolve, and your account manager can often sort things out before they become bigger problems.",
      },
    ],
  },

  // ── For Staff & Admins ─────────────────────────────────────────────────
  {
    slug: "admin-console-overview",
    title: "Staff orientation: the two workspaces",
    description: "New to the Oakvale team? Understand the Agent Workspace, the Admin Console, and where your work lives.",
    icon: "dashboard",
    category: "For Staff & Admins",
    audiences: ["admin"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "Welcome to the Oakvale team. This guide orients you to the two main surfaces staff work across and helps you find your way around. Whether you're an agent handling day-to-day operations or an admin configuring the platform, start here.",
      },
      {
        type: "heading",
        text: "The two surfaces you'll work in",
      },
      {
        type: "list",
        items: [
          "The Agent Workspace — where the day-to-day operational work happens: reviewing workers and employers, building matches, and handling placements. Every agent uses this.",
          "The Admin Console — where the platform itself is configured: managing staff, templates, matching rules, and categories. This is for Platform Admins.",
        ],
      },
      {
        type: "paragraph",
        text: "What you can see depends on your role. Agents see the operational pages relevant to their work; Platform Admins additionally see the configuration tools. If a page mentioned here isn't in your sidebar, it's simply outside your role's permissions.",
      },
      {
        type: "heading",
        text: "Where your work lives",
      },
      {
        type: "list",
        items: [
          "Operational review queues — Employers, Workers, Certificates, Job Posts, and Offers. These are the lists of items waiting for staff review.",
          "Configuration (admin only) — Staff, Templates, Matching, Taxonomy, and the Audit Log.",
          "My Tasks — your personal to-do list: verifications waiting, welfare checks due, open complaints, and contracts to review. Start your day here.",
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "Role-based visibility keeps things focused",
        body: "Different staff roles — BDMs, Recruiters, Liaison Nurses, Account Managers, and Admins — each see the records relevant to their responsibilities. This isn't a restriction so much as a way to keep your screen focused on what's actually yours to handle.",
      },
    ],
  },
  {
    slug: "admin-verifications",
    title: "Reviewing verifications & job posts",
    description: "How agents act as the gatekeepers of platform trust — approving IDs, certificates, and job posts.",
    icon: "verified",
    category: "For Staff & Admins",
    audiences: ["admin"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "As an agent, you are the reason employers can trust who they hire and workers can trust the roles they see. Almost every trust signal on the platform passes through a human review — yours. This guide walks through the three review types you'll handle most and what to check in each.",
      },
      {
        type: "heading",
        text: "Reviewing identity documents",
      },
      {
        type: "steps",
        items: [
          { title: "Open the verification queue", body: "Workers who have uploaded ID appear in your queue. Open one to see their documents and details side by side." },
          { title: "Check the documents carefully", body: "Confirm the ID is clear, valid, unexpired, and that the name and photo match the worker's profile and selfie. Watch for signs of tampering." },
          { title: "Approve or reject with a reason", body: "Approving flips the worker's verification badge on. If you reject, always leave a clear comment explaining what's needed (for example, ‘photo too blurry, please re-upload’) so the worker can fix it quickly." },
        ],
      },
      {
        type: "heading",
        text: "Validating certificates",
      },
      {
        type: "paragraph",
        text: "When a worker enters their Oakvale Certificate Number, confirm it against Oakvale's records. A valid match marks the worker ‘Oakvale Verified’ — the strongest trust signal on the platform — and auto-fills their programme and CPD details. Take care here, because this badge carries a lot of weight with employers.",
      },
      {
        type: "heading",
        text: "Reviewing job posts",
      },
      {
        type: "steps",
        items: [
          { title: "Read the post", body: "Check the category is correct, the requirements are clear and lawful, and the language is professional and non-discriminatory." },
          { title: "Approve or request revisions", body: "Approve posts that are ready. If something needs fixing, request revisions with a clear note. Aim to turn posts around within one working day so employers aren't kept waiting." },
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "When in doubt, escalate",
        body: "If a document looks suspicious or a job post raises a concern you're unsure about, don't guess — flag it to a senior agent or admin. It's always better to double-check than to let something questionable through the trust gate.",
      },
    ],
  },
  {
    slug: "admin-matching-and-offers",
    title: "Matching, shortlists & approving offers",
    description: "Using the matching tool to build shortlists and shepherding offers through to workers.",
    icon: "tune",
    category: "For Staff & Admins",
    audiences: ["admin"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "A big part of an agent's value is getting the right worker in front of the right employer. Oakvale's matching tool does the heavy lifting, but your judgement is what makes the final shortlist great. This guide explains the flow from generating a shortlist to approving the offer at the end.",
      },
      {
        type: "heading",
        text: "How matching works",
      },
      {
        type: "paragraph",
        text: "The matching tool takes a job post or a care needs assessment and produces a ranked list of candidates — scoring workers on their certification, skills, location, availability, and ratings. It's a starting point, not the final word: you review the ranking and adjust it using knowledge the system doesn't have.",
      },
      {
        type: "heading",
        text: "The flow, step by step",
      },
      {
        type: "steps",
        items: [
          { title: "Generate a shortlist", body: "Feed the tool a job post or an employer's assessment. It returns workers ranked by fit. Review the top candidates first." },
          { title: "Refine and send to the employer", body: "Adjust the list — add someone the tool ranked lower but who you know is a great fit, or remove anyone unsuitable — then share it with the employer. They review it and request interviews." },
          { title: "Approve the offer", body: "When an employer decides to hire, the offer comes to you before it reaches the worker. Check the terms are fair and on-tier (correct for the role and level), then release it. This is a key safeguard — never rubber-stamp; read it." },
        ],
      },
      {
        type: "callout",
        variant: "info",
        title: "You know things the tool doesn't",
        body: "The ranking is a helpful shortcut, not a decision-maker. If your experience tells you a particular worker would suit an employer better than their score suggests, trust that — the tool is there to save you time, not replace your judgement.",
      },
    ],
  },
  {
    slug: "admin-complaints",
    title: "Handling complaints within SLA",
    description: "How to triage, investigate, and resolve cases — and what to do the moment safeguarding is involved.",
    icon: "report",
    category: "For Staff & Admins",
    audiences: ["admin"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "When something goes wrong for a worker or employer, how well you handle it defines their trust in Oakvale. This guide walks through the complaints process from the moment a case lands to the moment you close it, and flags the one situation that overrides everything else: safeguarding.",
      },
      {
        type: "heading",
        text: "Reading the complaints dashboard",
      },
      {
        type: "paragraph",
        text: "The complaints dashboard lists every open case with its category, who raised it, who's handling it, its urgency, and a colour-coded SLA deadline (the time by which you've committed to respond). Work top-down by urgency — the most urgent, closest-to-deadline cases first.",
      },
      {
        type: "heading",
        text: "The process, step by step",
      },
      {
        type: "steps",
        items: [
          { title: "Triage", body: "Within 2 hours of a case arriving, confirm its category and urgency and assign a handler. Fast triage is what keeps everything else on track." },
          { title: "Investigate", body: "Contact both parties to hear each side. Review the placement record, the message history, and any evidence attached. Log your findings against the case as you go, so there's a clear trail." },
          { title: "Resolve and close", body: "Decide on and document the outcome, notify both parties clearly, and close the case. If the resolution involves suspending someone or a financial adjustment, escalate it to Admin or the CEO rather than acting alone." },
        ],
      },
      {
        type: "callout",
        variant: "warning",
        title: "Safeguarding overrides the normal process — act immediately",
        body: "A serious safeguarding complaint (anything involving a person's safety or welfare) is not a routine case. It suspends the worker at once and automatically notifies the CEO and DPO. Begin investigating within 24 hours. When in doubt about whether something is safeguarding, treat it as if it is.",
      },
    ],
  },
  {
    slug: "admin-configuration",
    title: "Configuration: taxonomy, templates & audit",
    description: "For Platform Admins: shaping how the platform works without touching code, and reading the audit trail.",
    icon: "category",
    category: "For Staff & Admins",
    audiences: ["admin"],
    readingTime: "5 min",
    blocks: [
      {
        type: "paragraph",
        text: "This guide is for Platform Admins. Much of how Oakvale behaves — the categories of work, the types of employer, the wording of contracts — is configured as data, meaning you can change it yourself without a developer. This guide explains the three main configuration areas and the safety features built into them.",
      },
      {
        type: "heading",
        text: "Taxonomy — the platform's vocabulary",
      },
      {
        type: "paragraph",
        text: "Taxonomy is the set of categories the platform uses: workforce categories (types of care work) and employer types. For each, you can define the fields workers or employers fill in, the menu of skills offered, and the compliance requirements attached. Adding a new category is a configuration change, not a coding project — so the platform can grow as Oakvale does.",
      },
      {
        type: "heading",
        text: "Templates — reusable documents",
      },
      {
        type: "paragraph",
        text: "Templates are the master versions of contracts and notifications. They support variable substitution (placeholders like a worker's name that fill in automatically) and versioning (keeping a history of every edit). You manage the wording here, and it flows through to every document generated from it.",
      },
      {
        type: "heading",
        text: "Audit log — the record of everything",
      },
      {
        type: "paragraph",
        text: "Every meaningful action on the platform is recorded in the audit log with a timestamp, the user who did it, and their IP address. When you need to review what happened during an investigation or a dispute, filter the log to find it. Treat it as the platform's memory.",
      },
      {
        type: "callout",
        variant: "warning",
        title: "Editing templates never rewrites signed agreements",
        body: "This is an important safety feature to understand: workers and employers always sign the template version that was active at the time of their placement. When you edit a template, existing signed agreements stay exactly as they were — your changes only apply to future placements. So you can improve wording freely without worrying about altering contracts people have already signed.",
      },
    ],
  },
];

export function getDoc(slug: string): DocArticle | undefined {
  return docs.find((d) => d.slug === slug);
}
