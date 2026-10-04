import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass,
  Question,
  CaretDown,
  ArrowRight,
  ShareNetwork,
  UploadSimple,
  Globe,
  ShieldCheck,
  Sparkle,
  InstagramLogo,
  TiktokLogo,
  RedditLogo,
  FacebookLogo,
  XLogo,
  Browser,
  DeviceMobile,
  CheckCircle,
  Lightbulb,
  X,
  ArrowsOut,
  FolderOpen,
} from "@phosphor-icons/react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// -----------------------------------------------------------------------------
// Visual Guides Data
// -----------------------------------------------------------------------------
const VISUAL_GUIDES = [
  {
    id: "export-instagram",
    category: "social",
    title: "How to export your saved posts & collections from Instagram",
    badge: "Instagram",
    icon: InstagramLogo,
    iconColor: "text-pink-500",
    time: "2 min export",
    image: "/guides/instagram_export_guide.jpg",
    imageAlt: "Instagram Accounts Center to Export Your Information visual tutorial",
    summary:
      "Meta has centralized all data export into the Meta Accounts Center. You can download an official archive of all your saved posts, saved Reels, and collections in a few taps.",
    steps: [
      {
        num: 1,
        title: "Open Meta Accounts Center",
        desc: "In the Instagram app, tap your Profile picture (bottom right) → tap the three-line menu (☰) in the top right → tap 'Accounts Center' (located right at the top of the menu). Note: Meta permanently moved data export out of 'Your activity' into Accounts Center. (You can also visit accountscenter.instagram.com on any browser).",
      },
      {
        num: 2,
        title: "Tap 'Your information and permissions'",
        desc: "Under the 'Account settings' section inside Accounts Center, tap 'Your information and permissions', then tap 'Export your information' (or 'Download your information').",
      },
      {
        num: 3,
        title: "Select 'Saved posts' & choose JSON format",
        desc: "Tap 'Create export' (or 'Download or transfer information') → select your Instagram profile → choose 'Some of your information' → scroll down and check 'Saved posts' (and/or 'Saved collections').",
      },
      {
        num: 4,
        title: "Set format to JSON & start export",
        desc: "Under Format, select 'JSON' (JSON is structured and fast for PostRecaller to parse) and set Date range to 'All time' → tap 'Start export'. Meta will notify you by email and in-app once your .zip file is ready in the 'Available downloads' tab.",
      },
      {
        num: 5,
        title: "Drop the .zip file into PostRecaller",
        desc: "Download the .zip archive and simply drag it into PostRecaller's Importer. PostRecaller instantly extracts every saved Reel and post, removes tracking bloat, and creates searchable AI summaries!",
      },
    ],
    proTip:
      "Meta's official export gives you every bookmark and collection you've ever created. PostRecaller saves permanent summaries so you never lose key takeaways even if a creator deletes their video later.",
  },
  {
    id: "export-tiktok",
    category: "social",
    title: "How to export your favorites & saved videos from TikTok",
    badge: "TikTok",
    icon: TiktokLogo,
    iconColor: "text-cyan-500",
    time: "2 min export",
    image: "/guides/tiktok_export_guide.jpg",
    imageAlt: "TikTok Settings and Privacy Download Your Data visual tutorial",
    summary:
      "TikTok allows you to export your complete FavoriteVideoList and saved bookmarks via their official in-app privacy tools.",
    steps: [
      {
        num: 1,
        title: "Open Settings and privacy in TikTok",
        desc: "Open TikTok, tap 'Profile' in the bottom-right corner → tap the 3-line menu (☰) in the top-right corner → select 'Settings and privacy'.",
      },
      {
        num: 2,
        title: "Navigate to Account > Download your data",
        desc: "Tap 'Account' (at the very top of the settings list) → tap 'Download your data'.",
      },
      {
        num: 3,
        title: "Select 'JSON' format & tap 'Request data'",
        desc: "Under 'Select file format', choose 'JSON' (JSON format allows PostRecaller to parse video links and timestamps cleanly) → tap the 'Request data' button.",
      },
      {
        num: 4,
        title: "Download archive and drop into PostRecaller",
        desc: "When TikTok completes preparing your archive (viewable under the 'Download data' tab on that same screen, typically takes between 10 minutes to a few hours), download the file and drag it into PostRecaller to catalog your favorite videos.",
      },
    ],
    proTip:
      "You never need to provide your TikTok password to any third-party tool. The exported file uses TikTok's official data standard and remains 100% private to you.",
  },
  {
    id: "save-from-apps",
    category: "mobile",
    title: "How to save posts from Instagram, Facebook, Reddit, TikTok & X on your phone",
    badge: "Mobile Share Sheet",
    icon: DeviceMobile,
    iconColor: "text-emerald-500",
    time: "Instant (1 tap)",
    image: "/guides/mobile_share_guide.jpg",
    imageAlt: "Mobile Share Sheet tutorial highlighting PostRecaller and Copy Link",
    summary:
      "Save any video, reel, recipe, discussion, or article in 1 tap directly from your phone's native Share Sheet without copying and pasting manually.",
    steps: [
      {
        num: 1,
        title: "Tap the Share icon in any app",
        desc: "When viewing any content you want to remember: on Instagram tap the paper airplane icon; on TikTok tap the share arrow; on Reddit or Facebook tap 'Share'; on X tap the share tray icon.",
      },
      {
        num: 2,
        title: "Tap 'PostRecaller' in your Share Tray",
        desc: "In your phone's native share options (iOS or Android), tap the PostRecaller icon. If not visible in the top row, scroll right and tap 'More' to pin PostRecaller to your favorites.",
      },
      {
        num: 3,
        title: "Alternative: Tap 'Copy Link'",
        desc: "If you prefer, tap 'Copy Link' in any app. The next time you open PostRecaller, it will automatically detect the clipboard link and show a 1-tap 'Save to vault' banner.",
      },
      {
        num: 4,
        title: "AI silently organizes everything in the background",
        desc: "PostRecaller cleans out tracking junk (?igsh=..., ?utm_source=...), extracts key takeaways and transcripts, and tags it automatically. You never need to manually file folders again.",
      },
    ],
    proTip:
      "Reddit discussions & top answers: When saving Reddit posts via the share sheet, PostRecaller captures the original post plus the top-voted solutions and comments.",
  },
  {
    id: "export-browsers",
    category: "browser",
    title: "How to export bookmarks from Chrome, Safari, Edge, Firefox & Brave",
    badge: "Browser Bookmarks",
    icon: Browser,
    iconColor: "text-blue-500",
    time: "1 min export",
    image: "/guides/browser_export_guide.jpg",
    imageAlt: "Chrome Bookmarks Manager Export Bookmarks HTML visual tutorial",
    summary:
      "Rescue years of forgotten browser bookmarks and convert them into an organized, AI-searchable personal library in seconds.",
    steps: [
      {
        num: 1,
        title: "Open your browser's Bookmark Manager",
        desc: "In Google Chrome, Microsoft Edge, or Brave: press Ctrl+Shift+O on Windows (or Cmd+Option+B on Mac). Alternatively, click the three dots (⋮) in the top-right corner > 'Bookmarks and lists' > 'Bookmark manager'.",
      },
      {
        num: 2,
        title: "Click the 3 dots (⋮) and choose 'Export bookmarks'",
        desc: "Inside Bookmark manager, click the three vertical dots (⋮) in the top-right search header and select 'Export bookmarks'. This saves a bookmarks_...html file to your computer.",
      },
      {
        num: 3,
        title: "For Safari & Firefox users",
        desc: "Safari: Click 'File' in the top Mac menu bar > 'Export' > 'Bookmarks'. Firefox: Press Ctrl+Shift+O (Cmd+Shift+O on Mac) > click 'Import and Backup' > 'Export Bookmarks to HTML'.",
      },
      {
        num: 4,
        title: "Upload the .html file to PostRecaller",
        desc: "Drag the exported .html file into PostRecaller's Importer. PostRecaller reads the links, removes dead 404 URLs, preserves your folders, and adds intelligent AI categorization.",
      },
    ],
    proTip:
      "Have over 1,000+ unorganized links? PostRecaller's batch parser handles thousands of bookmarks in parallel, indexing and deduplicating your entire backlog in seconds.",
  },
  {
    id: "export-facebook",
    category: "social",
    title: "How to export your saved items & collections from Facebook",
    badge: "Facebook",
    icon: FacebookLogo,
    iconColor: "text-blue-600",
    time: "2 min export",
    image: "/guides/instagram_export_guide.jpg",
    imageAlt: "Meta Accounts Center Facebook Data Export tutorial",
    summary:
      "Because Facebook uses the Meta Accounts Center, exporting your saved posts, reels, articles, and marketplace links follows the exact same official pathway.",
    steps: [
      {
        num: 1,
        title: "Open Facebook Settings",
        desc: "On mobile or web, tap your Profile picture / Menu (☰) → tap the Settings gear icon → tap 'Accounts Center' at the top of the screen. (Or navigate to accountscenter.facebook.com directly).",
      },
      {
        num: 2,
        title: "Navigate to Your Information and Permissions",
        desc: "In Accounts Center, tap 'Your information and permissions' → tap 'Export your information' (or 'Download your information').",
      },
      {
        num: 3,
        title: "Choose Facebook Profile & Select 'Saved items'",
        desc: "Tap 'Download or transfer information' → select your Facebook account → choose 'Some of your information' → scroll and check 'Saved items'.",
      },
      {
        num: 4,
        title: "Select JSON format & Submit",
        desc: "Choose format 'JSON' and date range 'All time' → tap 'Start export'. Once Meta finishes preparing your .zip file, download it and drag it into PostRecaller.",
      },
    ],
    proTip:
      "PostRecaller cleans out tracking query strings and extracts full summaries from Facebook posts, shared news links, and Reels so you never lose the key information.",
  },
  {
    id: "export-reddit",
    category: "social",
    title: "How to save posts from Reddit & export your saved history",
    badge: "Reddit",
    icon: RedditLogo,
    iconColor: "text-orange-500",
    time: "1 tap / 3 min export",
    image: "/guides/mobile_share_guide.jpg",
    imageAlt: "Reddit Share to PostRecaller and data export visual tutorial",
    summary:
      "You can save Reddit posts with one tap using the mobile share sheet, or request your complete saved post history directly from Reddit.",
    steps: [
      {
        num: 1,
        title: "Method A (Instant 1-Tap): Tap Share > PostRecaller",
        desc: "Under any Reddit discussion, question, or tutorial, tap the 'Share' icon → tap 'PostRecaller'. PostRecaller extracts the discussion, top community answers, and key takeaway points.",
      },
      {
        num: 2,
        title: "Method B (Full History): Request Reddit Data Export",
        desc: "In any web browser, visit reddit.com/settings/data-request. Log into your account and select 'I want to request my Reddit data' → choose your full account history.",
      },
      {
        num: 3,
        title: "Receive saved_posts.csv file",
        desc: "Reddit will process your request and email you a download link to a ZIP archive containing 'saved_posts.csv' (all the URLs you have ever saved on Reddit).",
      },
      {
        num: 4,
        title: "Drop saved_posts.csv into PostRecaller",
        desc: "Drag the CSV file into PostRecaller. Our parser automatically fetches each Reddit thread, summarizes the answers, and organizes your years of Reddit saves into clean, searchable notes.",
      },
    ],
    proTip:
      "Reddit's native interface caps your saved post view at ~1,000 items. Requesting your official data file via reddit.com/settings/data-request allows PostRecaller to rescue older saves that Reddit no longer shows in your feed!",
  },
];

// -----------------------------------------------------------------------------
// General FAQ Accordion Items
// -----------------------------------------------------------------------------
const GENERAL_FAQS = [
  {
    id: "passwords",
    category: "privacy",
    q: "Does PostRecaller ever ask for or store my social media passwords?",
    a: "Never. PostRecaller is 100% passwordless and never asks for your Instagram, TikTok, Facebook, or Reddit passwords. We use official data archives (exported directly by you from the platform) and public share links. Your personal social media accounts remain completely untouched and secure.",
  },
  {
    id: "dead-links",
    category: "features",
    q: "What happens if a creator deletes a post or makes their account private?",
    a: "Standard browser bookmarks and platform saves break when a post is removed ('link rot'). PostRecaller extracts an executive summary, transcripts, and key points the moment a link is added. Even if the original creator deletes the post or sets their profile to private later, your knowledge vault preserves the essential takeaways forever.",
  },
  {
    id: "platforms-supported",
    category: "features",
    q: "Which social media and web platforms are supported?",
    a: "PostRecaller supports Instagram (Posts, Reels, Carousels), TikTok, YouTube (Videos & Shorts), X (Twitter), Reddit (Posts & Comments), Facebook, LinkedIn, Threads, Pinterest, Medium, Substack, GitHub repositories, Spotify, and any standard webpage or news article.",
  },
  {
    id: "limits",
    category: "pricing",
    q: "Is there a limit on how many posts or bookmarks I can import during Beta?",
    a: "No! During our public beta launch, all accounts enjoy unlimited saves, full social archive imports, unlimited AI summaries, and smart auto-categorization at zero cost. No credit card is required to sign up.",
  },
  {
    id: "export-out",
    category: "privacy",
    q: "Can I export my data out of PostRecaller at any time?",
    a: "Yes. We believe strongly in data sovereignty and zero vendor lock-in. You can download your entire vault at any time in clean JSON or Markdown formats with all AI summaries, original URLs, and tags intact.",
  },
  {
    id: "privacy-training",
    category: "privacy",
    q: "Is my personal saved data used to train public AI models?",
    a: "No. Your vault is strictly private. Your saved posts and personal bookmarks are never sold, never shared with third parties, and never used to train public machine learning models.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Guides & Questions" },
  { id: "social", label: "Export Social Saves" },
  { id: "mobile", label: "Save from Mobile Apps" },
  { id: "browser", label: "Browser Bookmarks" },
  { id: "privacy", label: "Privacy & Security" },
];

export default function FAQ() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // Smooth scroll to anchor on mount or hash change
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  // Filtered guides based on search & category
  const filteredGuides = useMemo(() => {
    return VISUAL_GUIDES.filter((guide) => {
      const matchesCategory =
        selectedCategory === "all" || guide.category === selectedCategory;
      const matchesQuery =
        searchQuery.trim() === "" ||
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.steps.some(
          (s) =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Filtered general FAQs
  const filteredFaqs = useMemo(() => {
    return GENERAL_FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "privacy" && faq.category === "privacy") ||
        (selectedCategory === "features" && faq.category === "features");
      const matchesQuery =
        searchQuery.trim() === "" ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col relative overflow-x-clip">
      {/* Background ambient gradient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10" aria-hidden>
        <div className="absolute top-[-100px] right-[-150px] w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-brand/12 via-brand-tertiary/20 to-transparent blur-[120px]" />
        <div className="absolute top-[400px] left-[-200px] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-brand-secondary/10 via-brand-tertiary/15 to-transparent blur-[110px]" />
      </div>

      <SiteHeader />

      <main className="flex-1 container-page px-5 md:px-12 pt-8 md:pt-14 pb-24 max-w-[1100px] mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-ds-sm text-on-surface-secondary mb-6">
          <Link to="/" className="hover:text-brand transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-on-surface font-medium">Guides &amp; FAQ</span>
        </nav>

        {/* Page Header */}
        <header className="text-center max-w-[760px] mx-auto space-y-4 mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-ds-pill bg-brand-tertiary text-brand text-ds-xs md:text-ds-sm font-semibold tracking-wider uppercase border border-brand/20 shadow-xs">
            <Question size={16} weight="bold" />
            <span>Help Center &amp; Visual Guides</span>
          </div>

          <h1 className="text-[32px] md:text-[50px] leading-[1.08] tracking-[-0.03em] font-medium text-on-surface">
            Step-by-step answers for <br className="hidden sm:inline" />
            <span className="text-brand italic font-serif">every platform</span> you use.
          </h1>

          <p className="text-on-surface-secondary text-ds-base md:text-ds-lg leading-relaxed max-w-[620px] mx-auto">
            Visual walkthroughs with screenshots showing how to export your saved posts, favorites, and browser bookmarks, plus how to save on mobile in one tap.
          </p>
        </header>

        {/* Search Bar & Category Filter Strip */}
        <div className="max-w-[760px] mx-auto mb-12 space-y-4">
          <div className="relative">
            <MagnifyingGlass
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-secondary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g., 'Instagram export', 'TikTok', 'Chrome bookmarks', 'Share sheet')..."
              className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-ds-border bg-surface/90 backdrop-blur-md text-on-surface placeholder:text-on-surface-secondary/70 focus:outline-hidden focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all text-ds-base shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-on-surface-secondary hover:text-on-surface hover:bg-surface-secondary transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-ds-pill text-xs md:text-ds-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    active
                      ? "bg-[#4A5D4E] text-white shadow-xs"
                      : "bg-surface-secondary/80 text-on-surface-secondary hover:text-on-surface hover:bg-surface-secondary"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: DETAILED VISUAL STEP-BY-STEP GUIDES                           */}
        {/* ========================================================================= */}
        <div className="space-y-12 mb-20">
          <div className="flex items-center justify-between border-b border-ds-border pb-3">
            <h2 className="text-xl md:text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <UploadSimple size={24} className="text-brand" weight="bold" />
              <span>Step-by-Step Visual Guides</span>
            </h2>
            <span className="text-ds-xs text-on-surface-secondary uppercase tracking-wider font-semibold">
              {filteredGuides.length} {filteredGuides.length === 1 ? "Guide" : "Guides"}
            </span>
          </div>

          {filteredGuides.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-ds-border bg-surface-secondary/30">
              <Question size={36} className="mx-auto text-on-surface-secondary/60 mb-2" />
              <p className="text-on-surface font-medium text-ds-base">No matching guides found</p>
              <p className="text-on-surface-secondary text-ds-sm mt-1">
                Try searching with different keywords or switch back to "All Guides".
              </p>
            </div>
          ) : (
            filteredGuides.map((guide) => {
              const { icon: GuideIcon } = guide;
              return (
                <article
                  key={guide.id}
                  id={guide.id}
                  className="rounded-3xl border border-ds-border bg-surface/90 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md transition-shadow scroll-mt-24"
                >
                  {/* Card Header Banner */}
                  <div className="p-6 md:p-8 border-b border-ds-border/70 bg-gradient-to-r from-surface-secondary/50 via-surface-secondary/20 to-transparent">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-ds-border shadow-2xs">
                          <GuideIcon size={18} weight="fill" className={guide.iconColor} />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-brand px-2.5 py-0.5 rounded-full bg-brand-tertiary">
                          {guide.badge}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-on-surface-secondary bg-surface px-2.5 py-1 rounded-full border border-ds-border">
                        {guide.time}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-semibold text-on-surface tracking-tight mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-ds-sm md:text-ds-base text-on-surface-secondary leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>

                  {/* Card Body: Visual Screenshot + Step List */}
                  <div className="p-6 md:p-8 grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
                    {/* Visual Screenshot Graphic with Zoom Lightbox Trigger */}
                    <div className="space-y-2.5">
                      <div className="relative group rounded-2xl overflow-hidden border border-ds-border/80 bg-zinc-950 shadow-md">
                        <img
                          src={guide.image}
                          alt={guide.imageAlt}
                          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
                          onClick={() =>
                            setActiveLightboxImage({
                              src: guide.image,
                              alt: guide.imageAlt,
                              title: guide.title,
                            })
                          }
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setActiveLightboxImage({
                              src: guide.image,
                              alt: guide.imageAlt,
                              title: guide.title,
                            })
                          }
                          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm transition-all opacity-90 group-hover:opacity-100 shadow-sm"
                          aria-label="Enlarge tutorial screenshot"
                        >
                          <ArrowsOut size={13} weight="bold" />
                          <span>Click to Zoom</span>
                        </button>
                      </div>
                      <p className="text-xs text-center text-on-surface-secondary/80 italic">
                        Tip: Click the tutorial screenshot above to expand in full-screen.
                      </p>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-4">
                      <ol className="space-y-4">
                        {guide.steps.map((step) => (
                          <li
                            key={step.num}
                            className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-surface-secondary/50 transition-colors"
                          >
                            <span className="w-7 h-7 rounded-full bg-[#4A5D4E] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              {step.num}
                            </span>
                            <div className="space-y-1">
                              <h4 className="text-ds-sm md:text-ds-base font-semibold text-on-surface">
                                {step.title}
                              </h4>
                              <p className="text-xs md:text-ds-sm text-on-surface-secondary leading-relaxed">
                                {step.desc}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>

                      {/* Pro Tip Box */}
                      {guide.proTip && (
                        <div className="mt-4 p-4 rounded-xl bg-brand-tertiary/60 border border-brand/20 flex items-start gap-3 text-xs md:text-ds-sm text-on-surface">
                          <Lightbulb size={20} className="text-brand shrink-0 mt-0.5" weight="fill" />
                          <div>
                            <span className="font-semibold text-brand">PostRecaller Advantage: </span>
                            <span className="text-on-surface-secondary">{guide.proTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: FREQUENTLY ASKED QUESTIONS ACCORDION                           */}
        {/* ========================================================================= */}
        <section className="mb-20">
          <div className="flex items-center justify-between border-b border-ds-border pb-3 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <Sparkle size={24} className="text-brand" weight="bold" />
              <span>Common Questions &amp; Privacy</span>
            </h2>
            <span className="text-ds-xs text-on-surface-secondary uppercase tracking-wider font-semibold">
              {filteredFaqs.length} Answers
            </span>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-surface dark:bg-zinc-900 border-[#4A5D4E]/60 shadow-sm"
                      : "bg-surface/70 dark:bg-zinc-900/50 border-ds-border/70 hover:border-ds-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-ds-base sm:text-[17px] font-semibold text-on-surface">
                      {faq.q}
                    </span>
                    <span
                      className={`p-1.5 rounded-full transition-transform duration-200 text-on-surface-secondary shrink-0 ${
                        isOpen ? "rotate-180 text-brand" : ""
                      }`}
                    >
                      <CaretDown size={18} weight="bold" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-ds-sm sm:text-ds-base text-on-surface-secondary leading-relaxed border-t border-ds-border/40">
                          <p>{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: NEED CUSTOM HELP OR HAVE A QUESTION?                           */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-surface-secondary/80 to-surface-secondary/40 border border-ds-border p-8 md:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 mb-16">
          <div className="space-y-1.5">
            <h3 className="text-lg md:text-xl font-semibold text-on-surface">
              Have a question not listed here?
            </h3>
            <p className="text-ds-sm md:text-ds-base text-on-surface-secondary max-w-[500px]">
              Our engineering team is happy to help you import niche bookmark archives or support your favorite social apps.
            </p>
          </div>

          <a
            href="mailto:support@postrecaller.com?subject=Help%20with%20PostRecaller%20Export"
            className="px-6 py-3 rounded-ds-md bg-brand text-on-brand hover:opacity-90 font-medium text-ds-sm transition-all shadow-xs shrink-0 flex items-center gap-2"
          >
            <span>Email Support</span>
            <ArrowRight size={15} weight="bold" />
          </a>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: CALL TO ACTION BANNER                                          */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden bg-[#4A5D4E] text-white rounded-3xl p-8 md:p-12 text-center shadow-lg">
          <div className="relative max-w-[560px] mx-auto space-y-4">
            <h3 className="text-2xl md:text-3xl font-medium tracking-tight">
              Ready to organize your digital memory?
            </h3>
            <p className="text-white/85 text-ds-sm md:text-ds-base leading-relaxed">
              Start saving in seconds. Join the free public beta today with unlimited imports and instant AI enrichment.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-ds-md bg-white text-[#4A5D4E] font-medium text-ds-sm hover:bg-surface transition-colors shadow-xs"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-ds-md border border-white/40 hover:bg-white/10 text-white font-medium text-ds-sm transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* LIGHTBOX MODAL FOR FULL-SCREEN SCREENSHOT PREVIEW                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[1000px] w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 flex items-center justify-between border-b border-zinc-800 text-white">
                <span className="text-ds-sm font-semibold truncate pr-4">
                  {activeLightboxImage.title}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveLightboxImage(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  aria-label="Close full-screen image"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
              <div className="p-2 sm:p-4 bg-black flex items-center justify-center max-h-[80vh] overflow-auto">
                <img
                  src={activeLightboxImage.src}
                  alt={activeLightboxImage.alt}
                  className="max-h-[75vh] w-auto object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SiteFooter />
    </div>
  );
}
