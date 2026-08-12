import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const seedData = [
  {
    name: "জাতীয় ও রাজনীতি",
    slug: "politics",
    subcategories: [
      { name: "জাতীয় সংবাদ", slug: "national-news" },
      { name: "রাজনীতি ও নীতি বিশ্লেষণ", slug: "politics-analysis" }
    ]
  },
  {
    name: "ফ্যাক্ট-চেক ও গবেষণা",
    slug: "fact-check-research",
    subcategories: [
      { name: "সত্যতা যাচাই (Fact-Check)", slug: "fact-check-verification" },
      { name: "অনুসন্ধানী রিপোর্ট (Investigative)", slug: "investigative-report" },
      { name: "ইসলামোফোবিয়ার জবাব", slug: "reply-islamophobia" }
    ]
  },
  {
    name: "দাওয়াহ ও ইসলামিক জীবন",
    slug: "islamic-life",
    subcategories: [
      { name: "প্র্যাকটিসিং মুসলিম", slug: "practicing-muslim" },
      { name: "তরুণ ও সংস্কৃতি", slug: "youth-culture" },
      { name: "কুরআন ও হাদিস চর্চা", slug: "quran-hadith" }
    ]
  },
  {
    name: "মানবসেবা ও সমাজ",
    slug: "humanity-society",
    subcategories: [
      { name: "মাঠের গল্প (Field Reports)", slug: "field-reports" },
      { name: "সংকট ও পুনর্বাসন", slug: "crisis-rehabilitation" }
    ]
  },
  {
    name: "মতামত ও বিশ্লেষণ",
    slug: "opinion-editorial",
    subcategories: [
      { name: "উপদেষ্টা ও আলেমদের কলাম", slug: "scholars-column" },
      { name: "সম্পাদকীয়", slug: "editorial" }
    ]
  },
  {
    name: "মাল্টিমিডিয়া",
    slug: "multimedia",
    subcategories: [
      { name: "ইনফোগ্রাফিক্স ও ফটোকার্ড", slug: "infographics-photocards" },
      { name: "ভিডিও ও ডক্যুমেন্টারি", slug: "videos-documentaries" }
    ]
  }
];

async function main() {
  console.log("Seeding categories & subcategories into MongoDB...");

  // Clean existing categories
  await prisma.category.deleteMany({
    where: { parentId: { not: null } }
  });
  await prisma.category.deleteMany();

  for (const cat of seedData) {
    // Create Parent Category
    const parentCategory = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
      },
    });

    console.log(`Created parent category: ${parentCategory.name}`);

    // Create Subcategories linked to Parent
    for (const sub of cat.subcategories) {
      await prisma.category.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          parentId: parentCategory.id,
        },
      });
    }
    
    console.log(`- Seeded ${cat.subcategories.length} subcategories for ${cat.name}`);
  }

  console.log("Seeding default testing users...");
  
  // Clean existing users
  await prisma.user.deleteMany();

  const adminPassword = bcrypt.hashSync("adminpassword123", 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "সুপার অ্যাডমিন",
      email: "admin@dailymanarah.com",
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      isVerified: true,
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  const editorPassword = bcrypt.hashSync("editorpassword123", 10);
  const editorUser = await prisma.user.create({
    data: {
      name: "সারাহ তাসনিম",
      email: "editor@dailymanarah.com",
      password: editorPassword,
      role: Role.EDITOR,
      isVerified: true,
    },
  });
  console.log(`Created editor user: ${editorUser.email}`);

  console.log("Cleaning old posts and seeding 30 realistic news articles...");
  await prisma.post.deleteMany();

  const dbCategories = await prisma.category.findMany();

  const postTemplates = [
    // 1. Politics
    {
      title: "দেশের নতুন অর্থনৈতিক সংস্কার ও তরুণদের জন্য কর্মসংস্থান সৃষ্টি",
      slug: "politics-economic-reform-youth-jobs",
      summary: "দেশের চলমান অর্থনৈতিক সংস্কার নীতির আওতায় তথ্যপ্রযুক্তি খাতে লাখো তরুণের জন্য নতুন কর্মসংস্থান সৃষ্টির প্রতিশ্রুতি দেওয়া হয়েছে।",
      categorySlug: "politics",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop"
    },
    {
      title: "জাতীয় নির্বাচনের প্রস্তুতি: নির্বাচন কমিশনের নতুন রোডম্যাপ ঘোষণা",
      slug: "national-election-roadmap-declaration",
      summary: "আসন্ন জাতীয় নির্বাচন স্বচ্ছ ও গ্রহণযোগ্য করতে নির্বাচন কমিশন এক নতুন কর্মপরিকল্পনা বা রোডম্যাপের ঘোষণা দিয়েছে।",
      categorySlug: "politics",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop"
    },
    {
      title: "ঠাকুরগাঁও সদর হাসপাতালে নতুন আধুনিক চিকিৎসা উইং উদ্বোধন",
      slug: "thakurgaon-hospital-new-medical-wing",
      summary: "ঠাকুরগাঁওবাসীর জন্য আধুনিক চিকিৎসা সেবা নিশ্চিত করতে হাসপাতালে একটি অত্যাধুনিক কার্ডিওলজি ও কিডনি ডায়ালিসিস ইউনিট যুক্ত করা হয়েছে।",
      categorySlug: "politics",
      isVerified: false,
      cover: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop"
    },
    {
      title: "পরিবেশ সুরক্ষায় সরকারি নতুন নীতিমালা ও পলিথিন নিষিদ্ধের কঠোর অভিযান",
      slug: "environmental-policy-polythene-ban-drive",
      summary: "দেশব্যাপী প্লাস্টিক ও পলিথিনের অবৈধ ব্যবহার রোধে আজ থেকে কঠোর আইনি পদক্ষেপ ও জরিমানা আদায়ের ঘোষণা দিয়েছে প্রশাসন।",
      categorySlug: "politics",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop"
    },
    {
      title: "শিক্ষা সংস্কার কমিশনের গুরুত্বপূর্ণ বৈঠক: নতুন পাঠ্যক্রম নিয়ে নানা প্রস্তাব",
      slug: "education-reform-commission-meeting",
      summary: "জাতীয় পর্যায়ে নৈতিকতা বৃদ্ধি ও বিজ্ঞান শিক্ষাকে আরও সহজ করতে প্রাথমিক ও মাধ্যমিক স্তরের কারিকুলামে নতুন সংস্কার আনা হচ্ছে।",
      categorySlug: "politics",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop"
    },

    // 2. Fact Check
    {
      title: "ফ্যাক্ট-চেক: সোশ্যাল মিডিয়ায় ভাইরাল হওয়া লবণের দাম বৃদ্ধির খবরটি গুজব",
      slug: "fact-check-salt-price-hike-rumor",
      summary: "সম্প্রতি ইন্টারনেটে ছড়ানো একটি পোস্টে দাবি করা হয়েছে বাজারে লবণের তীব্র সংকট দেখা দিয়েছে। আমাদের অনুসন্ধানে জানা গেছে খবরটি সম্পূর্ণ ভিত্তিহীন।",
      categorySlug: "fact-check-research",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1595954418607-1e68717d2678?w=800&auto=format&fit=crop"
    },
    {
      title: "গুজব ও ভুয়া খবর সনাক্ত করতে ঠাকুরগাঁওয়ে শিক্ষার্থীদের সচেতনতা সেমিনার",
      slug: "fake-news-awareness-seminar-students",
      summary: "অপপ্রচার ও ডিজিটাল প্ল্যাটফর্মের কুতথ্য মোকাবিলা করতে স্থানীয় শিক্ষার্থীদের নিয়ে একটি বিশেষ শিক্ষামূলক ক্যাম্পেইন অনুষ্ঠিত হয়েছে।",
      categorySlug: "fact-check-research",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop"
    },
    {
      title: "অনুসন্ধানী প্রতিবেদন: ঠাকুরগাঁওয়ে অবৈধ বালু উত্তোলনের নেপথ্যে কারা?",
      slug: "investigative-report-illegal-sand-extraction",
      summary: "নদীর তলদেশ থেকে বেআইনিভাবে বালি উত্তোলন ও এর ফলে আশপাশের ফসলি জমি ও বাঁধের দীর্ঘমেয়াদী ক্ষতি নিয়ে এক বিশেষ অনুসন্ধানী রিপোর্ট।",
      categorySlug: "fact-check-research",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1578345218746-50a229b3d0f8?w=800&auto=format&fit=crop"
    },
    {
      title: "মিথ্যা প্রোপাগান্ডা এবং তার রাজনৈতিক প্রভাব: সাম্প্রতিক ট্রেন্ডের পর্যালোচনা",
      slug: "false-propaganda-political-influence-analysis",
      summary: "ডিজিটাল কুতথ্য কীভাবে দেশের রাজনৈতিক দল ও সাধারণ ভোটারদের ওপর নেতিবাচক প্রভাব ফেলছে তার বস্তুনিষ্ঠ ডাটা-ভিত্তিক বিশ্লেষণ।",
      categorySlug: "fact-check-research",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=800&auto=format&fit=crop"
    },
    {
      title: "ইসলামোফোবিয়ার বিরুদ্ধে বুদ্ধিবৃত্তিক লড়াই: প্রমাণের ভিত্তিতে প্রকৃত সত্য উন্মোচন",
      slug: "intellectual-fight-against-islamophobia",
      summary: "বিশ্ব দরবারে ইসলামের প্রকৃত অহিংস রূপ ও সামাজিক নীতি তুলে ধরে বিভিন্ন ভিত্তিহীন অভিযোগের তাত্ত্বিক জবাব প্রদান।",
      categorySlug: "fact-check-research",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop"
    },

    // 3. Dawah & Islamic Life
    {
      title: "প্র্যাকটিসিং মুসলিম: আধুনিক ব্যস্ততায় পাঁচ ওয়াক্ত সালাত বজায় রাখার কৌশল",
      slug: "practicing-muslim-maintaining-prayers-busy-life",
      summary: "কর্মব্যস্ত জীবনের মাঝেও আল্লাহর হুকুম পালনে সময় নির্ধারণ, মানসিক একাগ্রতা বৃদ্ধি ও জামায়াতে নামাজ আদায়ের সেরা গাইডলাইন।",
      categorySlug: "islamic-life",
      isVerified: false,
      cover: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop"
    },
    {
      title: "তরুণ সমাজ ও ইসলামিক সংস্কৃতি: নৈতিক অবক্ষয় রোধে মসজিদের ভূমিকা",
      slug: "youth-islamic-culture-mosque-moral-guard",
      summary: "সমাজ থেকে অপসংস্কৃতি ও গ্যাং কালচার দূর করতে তরুণদের মসজিদে নিয়ে আসা ও নৈতিক শিক্ষার কোনো বিকল্প নেই।",
      categorySlug: "islamic-life",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop"
    },
    {
      title: "কুরআন চর্চার সঠিক গুরুত্ব: প্রাত্যহিক জিকির ও তাসবিহের মানসিক শান্তি",
      slug: "quran-study-importance-daily-dhikr-peace",
      summary: "প্রতিদিন নিয়মিত কুরআন তেলাওয়াত ও আল্লাহর স্মরণের মাধ্যমে কীভাবে পারিবারিক ও আত্মিক প্রশান্তি পাওয়া সম্ভব তার আলোচনা।",
      categorySlug: "islamic-life",
      isVerified: false,
      cover: "https://images.unsplash.com/photo-1590076212874-8840742f9b8c?w=800&auto=format&fit=crop"
    },
    {
      title: "হালাল উপার্জনের ফজিলত ও সুদী কারবারের ভয়াবহতা সম্পর্কে ইসলামি দিকনির্দেশনা",
      slug: "halal-income-blessings-vs-usury-sin",
      summary: "নৈতিক ও সুন্নাহভিত্তিক জীবনযাপনে হালাল ব্যবসার গুরুত্ব এবং সুদি ঋণের সামাজিক ও পারলৌকিক মারাত্মক ক্ষতিসমূহ।",
      categorySlug: "islamic-life",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop"
    },
    {
      title: "পারিবারিক বন্ধন সুদৃঢ় করতে রাসুলুল্লাহ (সা.)-এর সুন্নাহ ও আচার-আচরণ",
      slug: "prophet-sunnah-strengthening-family-bonds",
      summary: "স্ত্রী, সন্তান ও পিতা-মাতার সাথে কেমন আচরণ করা উচিত সে বিষয়ে নবীজির পবিত্র জীবন চরিত থেকে আমাদের জন্য শিক্ষণীয় বিষয়।",
      categorySlug: "islamic-life",
      isVerified: false,
      cover: "https://images.unsplash.com/photo-1609139322643-f5a75b426390?w=800&auto=format&fit=crop"
    },

    // 4. Humanity & Society
    {
      title: "মাঠের গল্প: উত্তরাঞ্চলে বন্যায় ক্ষতিগ্রস্তদের পাশে মানারাহ ফাউন্ডেশন",
      slug: "field-reports-manarah-foundation-flood-relief",
      summary: "বন্যার পানিতে ঘরবাড়ি হারানো ঠাকুরগাঁও ও দিনাজপুরের দুর্গম গ্রামের শত শত পরিবারের মাঝে খাদ্য ও শুকনো রেশন পৌঁছানোর চিত্র।",
      categorySlug: "humanity-society",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop"
    },
    {
      title: "শীতার্থ মানুষের উষ্ণতা দিতে ঠাকুরগাঁওয়ের প্রত্যন্ত অঞ্চলে শীতবস্ত্র বিতরণ",
      slug: "warm-clothes-distribution-thakurgaon-villages",
      summary: "কনকনে শীতে কাঁপতে থাকা দরিদ্র ও বয়োবৃদ্ধদের মাঝে মানারাহ ফাউন্ডেশনের উদ্যোগে কম্বল ও সোয়েটার বিতরণ কর্মসূচি।",
      categorySlug: "humanity-society",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1469571486090-c5ff07096c68?w=800&auto=format&fit=crop"
    },
    {
      title: "বিনামূল্যে রক্তদান ও জরুরি চিকিৎসাসেবা নিশ্চিত করতে ডিরেক্টরি অ্যাপ চালু",
      slug: "free-blood-donation-directory-app-launch",
      summary: "জরুরি মুহূর্তে মুমূর্ষু রোগীদের দ্রুততম সময়ে রক্তদাতাদের খুঁজে পেতে একটি ফ্রি ডেডিকেটেড মোবাইল ডিরেক্টরি উন্মোচন।",
      categorySlug: "humanity-society",
      isVerified: false,
      cover: "https://images.unsplash.com/photo-1536856788630-ceab45e8b685?w=800&auto=format&fit=crop"
    },
    {
      title: "দুস্থ ও এতিম শিক্ষার্থীদের জন্য স্থায়ী পুনর্বাসন ও অবৈতনিক কারিগরি প্রশিক্ষণ",
      slug: "orphan-students-permanent-rehabilitation-training",
      summary: "অনাথ ও অভাবগ্রস্ত তরুণদের আত্মকর্মসংস্থান নিশ্চিত করতে মানারাহ ট্রাস্টের আওতায় কারিগরি ও মেকানিক্যাল ট্রেনিং ইনস্টিটিউট স্থাপন।",
      categorySlug: "humanity-society",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop"
    },
    {
      title: "পরিষ্কার পরিচ্ছন্ন সমাজ গড়ার অঙ্গীকার: স্বেচ্ছাসেবী তরুণদের সামাজিক পরিচ্ছন্নতা অভিযান",
      slug: "clean-society-pledge-youth-volunteer-cleanliness",
      summary: "নিজের এলাকা নিজে পরিষ্কার করি—এই স্লোগানকে সামনে রেখে ঠাকুরগাঁওয়ের বিভিন্ন ওয়ার্ড ও পার্কে পরিচ্ছন্নতা কার্যক্রম।",
      categorySlug: "humanity-society",
      isVerified: false,
      cover: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop"
    },

    // 5. Opinion
    {
      title: "উপদেষ্টা ও আলেমদের কলাম: বর্তমান শিক্ষাব্যবস্থায় নৈতিক শিক্ষার রূপরেখা",
      slug: "scholars-column-moral-education-outline",
      summary: "আদর্শ ও সৎ নাগরিক গড়ে তুলতে সিলেবাসে সুন্নাহভিত্তিক চরিত্রগঠন ও ইসলামি মূল্যবোধকে বাধ্যতামূলক করার গুরুত্ব নিয়ে আলোচনা।",
      categorySlug: "opinion-editorial",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop"
    },
    {
      title: "সম্পাদকীয়: হলুদ সাংবাদিকতার বিরুদ্ধে সত্য ও নৈতিক লেখনীর বিজয়",
      slug: "editorial-truthful-journalism-vs-fake-news",
      summary: "ইন্টারনেটের অপপ্রচারের যুগে সত্য সংবাদ ও অনুসন্ধানী প্রতিবেদনের প্রয়োজনীয়তা এবং সাংবাদিকদের নৈতিকতা বজায় রাখার কঠোর আহ্বান।",
      categorySlug: "opinion-editorial",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop"
    },
    {
      title: "সমাজ গঠনে তাকওয়া ও পরোপকারিতার প্রভাব: ইসলামি দৃষ্টিকোণ",
      slug: "social-reform-piety-humanitarian-islamic-view",
      summary: "আদর্শ সমাজ ও শান্তিময় পাড়া-মহল্লা বিনির্মাণে খোদাভীতি ও একে অপরের বিপদে এগিয়ে আসার নৈতিক উপকারিতা।",
      categorySlug: "opinion-editorial",
      isVerified: false,
      cover: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop"
    },
    {
      title: "ডিজিটাল আসক্তি থেকে ভবিষ্যৎ প্রজন্মকে বাঁচানোর উপায় ও আমাদের দায়িত্ব",
      slug: "saving-future-generation-from-digital-addiction",
      summary: "স্ক্রিন টাইম কমিয়ে মাঠের খেলাধুলা, বই পড়া এবং পরিবারের সাথে গুণগত সময় কাটানোর পারিবারিক গাইডলাইন।",
      categorySlug: "opinion-editorial",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop"
    },
    {
      title: "সুস্থ সংস্কৃতি ও আধুনিক মিডিয়ার অপব্যবহার: একটি তাত্ত্বিক বিশ্লেষণ",
      slug: "healthy-culture-vs-modern-media-abuse-analysis",
      summary: "বিনোদন ও তথ্য অনুসন্ধানের নামে বর্তমান তরুণদের কাছে কীভাবে অপসংস্কৃতি পোঁছে দেওয়া হচ্ছে তার সমাজবিজ্ঞানমূলক পর্যবেক্ষণ।",
      categorySlug: "opinion-editorial",
      isVerified: false,
      cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop"
    },

    // 6. Multimedia
    {
      title: "ভিডিও ডক্যুমেন্টারি: ঠাকুরগাঁওয়ের ঐতিহ্যবাহী ঐতিহাসিক জমিদার বাড়ি ও প্রাচীন মসজিদ",
      slug: "video-documentary-historical-mosque-thakurgaon",
      summary: "শত বছরের পুরনো নির্মাণশৈলী ও প্রাচীন মুসলমানদের জীবনযাত্রার নির্দশন নিয়ে আমাদের তৈরি বিশেষ ভিডিও ডক্যুমেন্টারি।",
      categorySlug: "multimedia",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop"
    },
    {
      title: "ইনফোগ্রাফিক্স: কীভাবে চিনবেন বাজারে নকল ও কেমিক্যাল মিশ্রিত ফল?",
      slug: "infographic-identifying-chemical-mixed-fruits",
      summary: "সহজ ছবির মাধ্যমে ও ২ মিনিটে তরতাজা আসল ফল বনাম কৃত্রিম ফর্মালিন মিশ্রিত ফলের মূল পার্থক্যগুলো চিনে নিন।",
      categorySlug: "multimedia",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800&auto=format&fit=crop"
    },
    {
      title: "ইসলামিক ক্যালিগ্রাফির মনোমুগ্ধকর মেলা ও তরুন শিল্পীদের চিত্রকর্ম প্রদর্শনী",
      slug: "islamic-calligraphy-exhibition-youth-artists",
      summary: "ঢাকায় অনুষ্ঠিত তরুণ ইসলামিক ক্যালিগ্রাফারদের চোখ জুড়ানো নান্দনিক আর্ট ও ক্যানভাস প্রদর্শনীর ভিডিও হাইলাইটস।",
      categorySlug: "multimedia",
      isVerified: false,
      cover: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop"
    },
    {
      title: "ডকুমেন্টারি: ঠাকুরগাঁওয়ের বাঁশশিল্প ও কুটিরশিল্পের কারিগরদের জীবনসংগ্রাম",
      slug: "documentary-bamboo-handicrafts-thakurgaon-artisans",
      summary: "বাঁশ দিয়ে নান্দনিক ডালি ও গৃহস্থালি পণ্য তৈরি করে বংশপরম্পরায় জীবিকা নির্বাহ করা মেহনতি মানুষদের সচিত্র গল্প।",
      categorySlug: "multimedia",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop"
    },
    {
      title: "ইনফোগ্রাফিক্স: পবিত্র হজ ও ওমরাহ পালনের সঠিক ধারাবাহিক নিয়ম ও হুকুম",
      slug: "infographic-hajj-umrah-step-by-step-guide",
      summary: "সহজ ফ্লো-চার্ট ছবির মাধ্যমে দেখে নিন ইহরাম বাঁধা থেকে শুরু করে বিদায়ী তাওয়াফ সম্পন্ন করার নিখুঁত নির্দেশিকা।",
      categorySlug: "multimedia",
      isVerified: true,
      cover: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop"
    }
  ];

  for (const template of postTemplates) {
    const matchedCat = dbCategories.find(c => c.slug === template.categorySlug);
    await prisma.post.create({
      data: {
        title: template.title,
        slug: template.slug,
        summary: template.summary,
        content: `${template.summary} এটি একটি বিস্তারিত সংবাদ বিবরণী। দ্য ডেইলি মানারাহ খবরের সত্যতা বজায় রাখতে উৎস যাচাই করে এই নিউজটি পাবলিশ করেছে।`,
        coverImage: template.cover,
        isVerified: template.isVerified,
        categoryId: matchedCat ? matchedCat.id : dbCategories[0].id,
        authorId: editorUser.id,
        views: Math.floor(Math.random() * 11500) + 500,
        createdAt: new Date(Date.now() - (Math.floor(Math.random() * 15) * 86400000)),
      }
    });
  }

  console.log("Database seeding completed successfully with 30 mock posts!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
