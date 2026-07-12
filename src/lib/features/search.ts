export type SearchResult = {
  title: string;
  snippet: string;
  url: string;
};

export async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const url = new URL("https://api.duckduckgo.com/");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("no_html", "1");
    url.searchParams.set("skip_disambig", "1");

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "ROF-SeniorCompanion/1.0" },
    });

    if (!response.ok) {
      return [
        {
          title: `Search the web for “${q}”`,
          snippet: "Open DuckDuckGo in a new tab for privacy-focused results.",
          url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
        },
      ];
    }

    const data = (await response.json()) as {
      Heading?: string;
      AbstractText?: string;
      AbstractURL?: string;
      RelatedTopics?: Array<
        | { Text?: string; FirstURL?: string }
        | { Topics?: Array<{ Text?: string; FirstURL?: string }> }
      >;
    };

    const results: SearchResult[] = [];

    if (data.Heading && data.AbstractURL) {
      results.push({
        title: data.Heading,
        snippet: data.AbstractText || "Instant answer from DuckDuckGo.",
        url: data.AbstractURL,
      });
    }

    for (const topic of data.RelatedTopics || []) {
      if ("Text" in topic && topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.split(" - ")[0] || topic.Text,
          snippet: topic.Text,
          url: topic.FirstURL,
        });
      } else if ("Topics" in topic && topic.Topics) {
        for (const nested of topic.Topics.slice(0, 3)) {
          if (nested.Text && nested.FirstURL) {
            results.push({
              title: nested.Text.split(" - ")[0] || nested.Text,
              snippet: nested.Text,
              url: nested.FirstURL,
            });
          }
        }
      }
      if (results.length >= 8) break;
    }

    if (results.length === 0) {
      results.push({
        title: `Search DuckDuckGo for “${q}”`,
        snippet: "No instant answer — open the full private search page.",
        url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      });
    }

    return results.slice(0, 8);
  } catch {
    return [
      {
        title: `Search DuckDuckGo for “${q}”`,
        snippet: "Open private search in a new tab.",
        url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      },
    ];
  }
}
