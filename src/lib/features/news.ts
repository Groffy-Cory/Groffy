export type NewsArticle = {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string | null;
};

const FALLBACK: NewsArticle[] = [
  {
    title: "Local community garden opens for the season",
    description:
      "Neighbors gathered to plant vegetables and share gardening tips.",
    url: "https://news.google.com",
    source: "Sample News",
    publishedAt: null,
  },
  {
    title: "Simple habits that support heart health",
    description:
      "Doctors recommend short daily walks and familiar, balanced meals.",
    url: "https://news.google.com",
    source: "Sample Health",
    publishedAt: null,
  },
];

export async function getNews(topics: string[]): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  const topic = topics[0] || "general";

  if (!apiKey || apiKey === "your_news_api_key") {
    return FALLBACK.map((article) => ({
      ...article,
      title: `${article.title} (${topic})`,
    }));
  }

  try {
    const url = new URL("https://newsapi.org/v2/top-headlines");
    url.searchParams.set("country", "us");
    url.searchParams.set("category", topic === "sports" ? "sports" : topic);
    url.searchParams.set("pageSize", "8");
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) return FALLBACK;

    const data = (await response.json()) as {
      articles?: Array<{
        title?: string;
        description?: string | null;
        url?: string;
        source?: { name?: string };
        publishedAt?: string;
      }>;
    };

    const articles = (data.articles || [])
      .filter((item) => item.title && item.url)
      .map((item) => ({
        title: item.title!,
        description: item.description || "Open to read more.",
        url: item.url!,
        source: item.source?.name || "News",
        publishedAt: item.publishedAt || null,
      }));

    return articles.length > 0 ? articles : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
