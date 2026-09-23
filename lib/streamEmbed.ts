export type StreamPlatform = "youtube" | "twitch" | "facebook" | "unknown";

export interface StreamEmbed {
  platform: StreamPlatform;
  /** iframe src when we can embed; null = open externally only */
  embedSrc: string | null;
  originalUrl: string;
}

function youtubeId(url: URL): string | null {
  if (url.hostname.includes("youtu.be")) {
    return url.pathname.split("/").filter(Boolean)[0] || null;
  }
  if (url.hostname.includes("youtube.com") || url.hostname.includes("youtube-nocookie.com")) {
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/")[2] || null;
    }
    if (url.pathname.startsWith("/live/")) {
      return url.pathname.split("/")[2] || null;
    }
    return url.searchParams.get("v");
  }
  return null;
}

function twitchChannel(url: URL): string | null {
  if (!url.hostname.includes("twitch.tv")) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "videos" || parts[0] === "clip") return null;
  return parts[0] || null;
}

function isFacebook(url: URL): boolean {
  return (
    url.hostname.includes("facebook.com") ||
    url.hostname.includes("fb.watch") ||
    url.hostname.includes("fb.gg")
  );
}

/** Build an iframe-ready embed from a pasted broadcast URL. */
export function resolveStreamEmbed(
  rawUrl: string,
  parentHost = "localhost"
): StreamEmbed {
  const originalUrl = rawUrl.trim();
  let url: URL;
  try {
    url = new URL(originalUrl);
  } catch {
    return { platform: "unknown", embedSrc: null, originalUrl };
  }

  const yt = youtubeId(url);
  if (yt) {
    return {
      platform: "youtube",
      embedSrc: `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1`,
      originalUrl,
    };
  }

  const channel = twitchChannel(url);
  if (channel) {
    const parents = Array.from(
      new Set([parentHost, "localhost", "127.0.0.1"])
    )
      .map((h) => `parent=${encodeURIComponent(h)}`)
      .join("&");
    return {
      platform: "twitch",
      embedSrc: `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parents}&autoplay=true`,
      originalUrl,
    };
  }

  if (isFacebook(url)) {
    // Public Facebook videos/lives — plugin embed. Private posts won't play.
    return {
      platform: "facebook",
      embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(originalUrl)}&show_text=false&autoplay=true`,
      originalUrl,
    };
  }

  return { platform: "unknown", embedSrc: null, originalUrl };
}
