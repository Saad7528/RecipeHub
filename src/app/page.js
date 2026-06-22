import dbConnect from "@/lib/db";
import Recipe from "@/models/Recipe";
import HomeClient from "@/components/HomeClient";

// Disable caching for live community counts & popular updates
export const revalidate = 0;

export default async function Home() {
  let featuredRecipes = [];
  let popularRecipes = [];

  try {
    await dbConnect();

    // Query 4 featured recipes
    const featuredDocs = await Recipe.find({ isFeatured: true, status: "published" })
      .limit(4)
      .sort({ createdAt: -1 })
      .lean();

    // Query 4 popular recipes based on likes
    const popularDocs = await Recipe.find({ status: "published" })
      .sort({ likesCount: -1 })
      .limit(4)
      .lean();

    // Serialize MongoDB models to plain objects for client components
    featuredRecipes = featuredDocs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      authorId: doc.authorId.toString(),
      createdAt: doc.createdAt?.toISOString() || null,
      updatedAt: doc.updatedAt?.toISOString() || null,
    }));

    popularRecipes = popularDocs.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      authorId: doc.authorId.toString(),
      createdAt: doc.createdAt?.toISOString() || null,
      updatedAt: doc.updatedAt?.toISOString() || null,
    }));
  } catch (err) {
    console.error("Home Page Data Fetching failed", err);
  }

  return (
    <HomeClient
      featuredRecipes={featuredRecipes}
      popularRecipes={popularRecipes}
    />
  );
}
