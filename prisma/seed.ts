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
