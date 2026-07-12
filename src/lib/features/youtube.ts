export type YoutubeVideo = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string | null;
  url: string;
};

const FALLBACK: YoutubeVideo[] = [
  {
    id: "jfKfPfyJRdk",
    title: "Lofi classical mix (sample)",
    channel: "Sample Channel",
    thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    id: "5qap5aO4i9A",
    title: "Relaxing music for quiet afternoons (sample)",
    channel: "Sample Channel",
    thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
  },
];

export async function searchYoutube(query: string): Promise<YoutubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const q = query.trim() || "classic songs";

  if (!apiKey || apiKey === "your_youtube_api_key") {
    return FALLBACK.map((video) => ({
      ...video,
      title: `${video.title} — search: ${q}`,
    }));
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "8");
    url.searchParams.set("q", q);
    url.searchParams.set("safeSearch", "strict");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) return FALLBACK;

    const data = (await response.json()) as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          channelTitle?: string;
          thumbnails?: { medium?: { url?: string } };
        };
      }>;
    };

    const videos = (data.items || [])
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        id: item.id!.videoId!,
        title: item.snippet?.title || "Video",
        channel: item.snippet?.channelTitle || "YouTube",
        thumbnail: item.snippet?.thumbnails?.medium?.url || null,
        url: `https://www.youtube.com/watch?v=${item.id!.videoId}`,
      }));

    return videos.length > 0 ? videos : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
