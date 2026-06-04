import { MetadataRoute } from "next";
import connectToDatabase from "@/lib/db";
import Blog from "@/models/Blog";
import LandingPage from "@/models/LandingPage";

export const dynamic = "force-dynamic";

const getDynamicRoutes = async (baseUrl: string): Promise<MetadataRoute.Sitemap> => {
  try {
    await connectToDatabase();

    const blogs = await Blog.find({ isPublished: true }, "slug updatedAt")
      .sort({ updatedAt: -1 })
      .limit(4000)
      .lean()
      .exec();

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((item: any) => ({
      url: `${baseUrl}/blog/${item.slug}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return blogRoutes;
  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    return [];
  }
};

const getLandingPageRoutes = async (baseUrl: string): Promise<MetadataRoute.Sitemap> => {
  try {
    await connectToDatabase();

    const pages = await LandingPage.find({ isActive: true }, "slug updatedAt")
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    const pageRoutes: MetadataRoute.Sitemap = pages.map((item: any) => ({
      url: `${baseUrl}/lp/${item.slug}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return pageRoutes;
  } catch (error) {
    console.error("Error generating dynamic landing page sitemap routes:", error);
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.nbsafaagro.com";

  const [dynamicRoutes, landingPageRoutes] = await Promise.all([
    getDynamicRoutes(baseUrl),
    getLandingPageRoutes(baseUrl),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...dynamicRoutes, ...landingPageRoutes];
}
