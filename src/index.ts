import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());

// 1. AUTH API: Register
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "REPORTER",
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. AUTH API: Login (called by NextAuth authorize)
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2.5. USER MANAGEMENT API (Admin Dashboard Team Management)
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.user.delete({ where: { id } });
    return res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id/role", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Missing role field" });
    }
    const user = await db.user.update({
      where: { id },
      data: { role },
    });
    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. POSTS API: List
app.get("/api/posts", async (req: Request, res: Response) => {
  try {
    const { categorySlug, division, district, thana, search, sort } = req.query;

    const whereClause: any = {
      isHidden: false,
    };

    if (categorySlug) {
      whereClause.category = { slug: categorySlug as string };
    }
    if (division) {
      whereClause.division = division as string;
    }
    if (district) {
      whereClause.district = district as string;
    }
    if (thana) {
      whereClause.thana = thana as string;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { content: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sort === "views") {
      orderBy.views = "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const posts = await db.post.findMany({
      where: whereClause,
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy,
    });

    return res.json(posts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. POSTS API: Create
app.post("/api/posts", async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      content,
      summary,
      coverImage,
      isWatermarkOn,
      isVerified,
      sourceUrl,
      sourceVideo,
      division,
      district,
      thana,
      categoryId,
      authorId,
    } = req.body;

    if (!title || !slug || !content || !categoryId || !authorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        content,
        summary,
        coverImage: coverImage || "",
        isWatermarkOn: isWatermarkOn !== undefined ? isWatermarkOn : true,
        isVerified: isVerified || false,
        sourceUrl,
        sourceVideo,
        division,
        district,
        thana,
        categoryId,
        authorId,
      },
      include: {
        category: true,
        author: { select: { name: true } },
      },
    });

    return res.status(201).json(post);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. POSTS API: Detail
app.get("/api/posts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await db.post.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true, role: true } },
        comments: { where: { isApproved: true } },
        revisions: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Increment views asynchronously
    await db.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return res.json(post);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. POSTS API: Update (with Revision Log)
app.put("/api/posts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, summary, coverImage, isVerified, editedBy } = req.body;

    const existingPost = await db.post.findUnique({ where: { id } });
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Update Post
    const updatedPost = await db.post.update({
      where: { id },
      data: {
        title: title || existingPost.title,
        content: content || existingPost.content,
        summary: summary || existingPost.summary,
        coverImage: coverImage || existingPost.coverImage,
        isVerified: isVerified !== undefined ? isVerified : existingPost.isVerified,
      },
    });

    // Save Revision audit log
    if (editedBy) {
      await db.revision.create({
        data: {
          postId: id,
          editedBy,
          title: title || existingPost.title,
          content: content || existingPost.content,
        },
      });
    }

    return res.json(updatedPost);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. POSTS API: Moderation Hide/Unhide (SUPER_ADMIN)
app.put("/api/posts/:id/hide", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;

    const post = await db.post.update({
      where: { id },
      data: { isHidden },
    });

    return res.json(post);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 8. CATEGORIES API: List
app.get("/api/categories", async (req: Request, res: Response) => {
  try {
    const categories = await db.category.findMany({
      where: { parentId: null },
      include: { subcategories: true },
    });
    return res.json(categories);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 9. CATEGORIES API: Create
app.post("/api/categories", async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const category = await db.category.create({
      data: { name, slug },
    });
    return res.status(201).json(category);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 10. COMMENTS API: Create (with AI Profanity Filter)
app.post("/api/posts/:id/comments", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { authorName, content } = req.body;

    if (!authorName || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let isApproved = true;

    // Use Gemini AI if API key is provided
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Analyze this comment: "${content}" by author "${authorName}". Is it spam, hate speech, or containing extreme profanity/abuse? Answer with ONLY "yes" or "no".`;
        const result = await aiModel.generateContent(prompt);
        const responseText = result.response.text().trim().toLowerCase();
        if (responseText.includes("yes")) {
          isApproved = false;
        }
      } catch (err) {
        console.error("Gemini filter error, falling back to keywords:", err);
        const profaneKeywords = ["স্প্যাম", "spam", "খারাপ", "গালি", "badword", "ভুয়া"];
        const containsProfanity = profaneKeywords.some((word) =>
          content.toLowerCase().includes(word) || authorName.toLowerCase().includes(word)
        );
        isApproved = !containsProfanity;
      }
    } else {
      // Fallback keyword filter
      const profaneKeywords = ["স্প্যাম", "spam", "খারাপ", "গালি", "badword", "ভুয়া"];
      const containsProfanity = profaneKeywords.some((word) =>
        content.toLowerCase().includes(word) || authorName.toLowerCase().includes(word)
      );
      isApproved = !containsProfanity;
    }

    const comment = await db.comment.create({
      data: {
        postId: id,
        authorName,
        content,
        isApproved,
      },
    });

    return res.status(201).json(comment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 11. COMMENTS API: Pending List for Admin
app.get("/api/comments/pending", async (req: Request, res: Response) => {
  try {
    const comments = await db.comment.findMany({
      where: { isApproved: false },
      include: { post: { select: { title: true } } },
    });
    return res.json(comments);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 12. COMMENTS API: Approve
app.put("/api/comments/:id/approve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await db.comment.update({
      where: { id },
      data: { isApproved: true },
    });
    return res.json(comment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 13. SETTINGS API: Get
app.get("/api/settings", async (req: Request, res: Response) => {
  try {
    let settings = await db.siteSetting.findUnique({
      where: { id: "global_settings" },
    });

    if (!settings) {
      settings = await db.siteSetting.create({
        data: {
          id: "global_settings",
          watermarkGlobal: true,
          commentAiFilterOn: true,
          shoppingModuleOn: false,
          sponsoredBannersOn: true,
        },
      });
    }

    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 14. SETTINGS API: Update
app.put("/api/settings", async (req: Request, res: Response) => {
  try {
    const { watermarkGlobal, commentAiFilterOn, shoppingModuleOn, sponsoredBannersOn } = req.body;
    const settings = await db.siteSetting.update({
      where: { id: "global_settings" },
      data: {
        watermarkGlobal,
        commentAiFilterOn,
        shoppingModuleOn,
        sponsoredBannersOn,
      },
    });
    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 15. AUDIT LOGS: List
app.get("/api/revisions", async (req: Request, res: Response) => {
  try {
    const revisions = await db.revision.findMany({
      include: {
        post: { select: { title: true } },
        user: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(revisions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 16. AI SPELLCHECK API: Check Bengali text for spelling mistakes
app.post("/api/ai/spellcheck", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback: simulated spelling checks
      const simulatedSuggestions = [
        { original: "ভুলশব্দ", fixed: "সঠিকশব্দ", reason: "বানান ভুল" },
      ];
      return res.json({ suggestions: simulatedSuggestions });
    }

    const prompt = `You are a professional Bengali proofreader. Identify spelling and grammatical mistakes in the following Bengali text: "${text}". Provide suggestions for correction in JSON format. The response must be a JSON array of objects, where each object has: "original" (the wrong word), "fixed" (the corrected word), and "reason" (brief reason in Bengali). Do not return markdown, backticks, or any conversational text. Return ONLY a valid JSON array. For example: [{"original": "ভুলশব্দ", "fixed": "সঠিকশব্দ", "reason": "বানান ভুল"}]`;
    
    const result = await aiModel.generateContent(prompt);
    const responseText = result.response.text().trim();
    // Strip markdown JSON wrapper if present
    const cleanJsonText = responseText.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(cleanJsonText);
    return res.json({ suggestions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[The Daily Manarah] Backend API Server running on port ${PORT}`);
});
