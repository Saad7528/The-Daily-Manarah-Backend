import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const seedData = [
  {
    name: "উচ্চশিক্ষা",
    slug: "higher-education",
    subcategories: [
      { name: "স্বায়ত্তশাসিত বিশ্ববিদ্যালয়", slug: "autonomous-university" },
      { name: "সরকারি বিশ্ববিদ্যালয়", slug: "public-university" },
      { name: "বেসরকারি বিশ্ববিদ্যালয়", slug: "private-university" },
      { name: "প্রকৌশল ও বিজ্ঞান-প্রযুক্ত", slug: "engineering-science-technology" },
      { name: "মেডিকেল", slug: "medical" },
      { name: "কৃষি বিশ্ববিদ্যালয়", slug: "agricultural-university" },
      { name: "আন্তর্জাতিক বিশ্ববিদ্যালয়", slug: "international-university" }
    ]
  },
  {
    name: "শিক্ষাঙ্গন",
    slug: "campus",
    subcategories: [
      { name: "স্কুল", slug: "school" },
      { name: "কলেজ", slug: "college" },
      { name: "কারিগরি", slug: "polytechnic" },
      { name: "মাদ্রাসা", slug: "madrasah" },
      { name: "ইংরেজি মাধ্যম", slug: "english-medium" },
      { name: "উপানুষ্ঠানিক", slug: "non-formal" }
    ]
  },
  {
    name: "পরীক্ষা",
    slug: "exam",
    subcategories: [
      { name: "ভর্তি পরীক্ষা", slug: "admission-exam" },
      { name: "একাডেমিক পরীক্ষা", slug: "academic-exam" },
      { name: "নিত্য তথ্য", slug: "daily-updates" },
      { name: "পরামর্শ", slug: "guidelines" },
      { name: "অনুসন্ধান ও বিশ্লেষণ", slug: "analysis" },
      { name: "প্রশ্ন সমাধান", slug: "question-solution" },
      { name: "মডেল টেস্ট", slug: "model-test" }
    ]
  },
  {
    name: "কর্মসংস্থান",
    slug: "jobs",
    subcategories: [
      { name: "শিক্ষাপ্রতিষ্ঠান", slug: "educational-institution-jobs" },
      { name: "সরকারি", slug: "govt-jobs" },
      { name: "বেসরকারি", slug: "private-jobs" },
      { name: "ব্যাংক ও আর্থিক", slug: "bank-financial-jobs" },
      { name: "এনজিও", slug: "ngo-jobs" },
      { name: "বিবিধ চাকরি", slug: "other-jobs" },
      { name: "প্রস্তুতি ও পরামর্শ", slug: "job-preparation" }
    ]
  },
  {
    name: "তারুণ্য",
    slug: "youth",
    subcategories: [
      { name: "প্রতিযোগিতা ও পদক", slug: "competition-awards" },
      { name: "पर्यটন ও ভ্রমণ", slug: "travel" },
      { name: "সাফল্য", slug: "success-stories" },
      { name: "সংগ্রাম", slug: "struggle" },
      { name: "স্বীকৃতি", slug: "recognition" },
      { name: "বিতর্ক", slug: "debate" },
      { name: "কুইজ", slug: "quiz" }
    ]
  },
  {
    name: "ফ্যাক্টচেক",
    slug: "factcheck",
    subcategories: [
      { name: "রাজনীতি ফ্যাক্ট", slug: "politics-fact" },
      { name: "অর্থনীতি ফ্যাক্ট", slug: "economy-fact" },
      { name: "শিক্ষা ফ্যাক্ট", slug: "education-fact" },
      { name: "স্বাস্থ্য ফ্যাক্ট", slug: "health-fact" },
      { name: "ধর্ম ফ্যাক্ট", slug: "religion-fact" },
      { name: "পরিবেশ ফ্যাক্ট", slug: "environment-fact" },
      { name: "প্রযুক্তি ফ্যাক্ট", slug: "tech-fact" },
      { name: "অন্যান্য ফ্যাক্ট", slug: "other-fact" }
    ]
  },
  {
    name: "শিক্ষা প্রশাসন",
    slug: "education-administration",
    subcategories: [
      { name: "শিক্ষা মন্ত্রণালয়", slug: "moedu" },
      { name: "প্রাথমিক ও গণশিক্ষা", slug: "mopme" },
      { name: "ইউজিসি", slug: "ugc" },
      { name: "মাউশি", slug: "dshe" },
      { name: "পিএসসি", slug: "bpsc" },
      { name: "শিক্ষা বোর্ড", slug: "education-board" },
      { name: "নায়েম", slug: "naem" },
      { name: "এনটিআরসিএ", slug: "ntrca" }
    ]
  },
  {
    name: "শিক্ষা আন্দোলন",
    slug: "education-movement",
    subcategories: [
      { name: "ছাত্র আন্দোলন", slug: "student-movement" },
      { name: "শিক্ষক রাজনীতি", slug: "teacher-politics" },
      { name: "কর্মচারী সংগঠন", slug: "staff-union" }
    ]
  },
  {
    name: "স্বাস্থ্য ও চিকিৎসা",
    slug: "health",
    subcategories: [
      { name: "স্বাস্থ্যসেবা", slug: "healthcare" },
      { name: "হেলথ টিপস", slug: "health-tips" },
      { name: "খাবার গুনাগুন", slug: "food-nutrition" },
      { name: "শরীরচর্চা", slug: "fitness" }
    ]
  },
  {
    name: "জাতীয়",
    slug: "national",
    subcategories: [
      { name: "সরকার", slug: "government" },
      { name: "রাজনীতি", slug: "politics-national" },
      { name: "শহরে-গ্রামে", slug: "city-village" },
      { name: "পানি ও জ্বালানি", slug: "water-energy" },
      { name: "কৃষি ও খাদ্য", slug: "agriculture-food" },
      { name: "অপরাধ ও শৃঙ্খলা", slug: "crime-law" },
      { name: "অন্যান্য", slug: "national-others" }
    ]
  },
  {
    name: "বিনোদন ও সংস্কৃতি",
    slug: "entertainment",
    subcategories: [
      { name: "সাহিত্য", slug: "literature" },
      { name: "আলোকচিত্র", slug: "photography" },
      { name: "সঙ্গীত ও নাচ", slug: "music-dance" },
      { name: "অঙ্কণ", slug: "art" },
      { name: "ফ্যাশন", slug: "fashion" },
      { name: "শোবিজ", slug: "showbiz" }
    ]
  },
  {
    name: "খেলাধুলা",
    slug: "sports",
    subcategories: [
      { name: "ক্রিকেট", slug: "cricket" },
      { name: "ফুটবল", slug: "football" },
      { name: "ক্যাম্পাস স্পোর্টস", slug: "campus-sports" },
      { name: "অন্যান্য খেলা", slug: "other-sports" }
    ]
  },
  {
    name: "অন্যান্য",
    slug: "others",
    subcategories: [
      { name: "বিজ্ঞান ও প্রযুক্তি", slug: "science-tech" },
      { name: "অর্থনীতি ও ব্যবসা", slug: "economy-business" },
      { name: "আইন ও আদালত", slug: "law-court" },
      { name: "আবহাওয়া ও পরিবেশ", slug: "weather-environment" },
      { name: "ধর্ম ও নৈতিকতা", slug: "religion-ethics" },
      { name: "বই ও গ্রন্থাগার", slug: "books-library" },
      { name: "উদ্ভাবন", slug: "innovation" },
      { name: "কর্মজীবন", slug: "career-life" },
      { name: "বিদেশ", slug: "abroad" }
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
    },
  });
  console.log(`Created editor user: ${editorUser.email}`);

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
