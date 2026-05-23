"use node";

import Browserbase from "@browserbasehq/sdk";

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

function getBrowserbaseClient(apiKey: string): Browserbase {
  return new Browserbase({ apiKey });
}

export async function webSearch(
  query: string,
  apiKey: string,
  maxResults = 5,
): Promise<SearchResult[]> {
  const bb = getBrowserbaseClient(apiKey);
  const response = await bb.search.web({
    query,
    numResults: Math.min(Math.max(maxResults, 1), 25),
  });

  return response.results.map((result) => {
    const meta = [result.author, result.publishedDate].filter(Boolean).join(" · ");
    return {
      title: result.title,
      url: result.url,
      snippet: meta || result.title,
    };
  });
}

export async function readUrl(
  url: string,
  apiKey: string,
): Promise<{ url: string; content: string }> {
  const bb = getBrowserbaseClient(apiKey);

  try {
    return await fetchPage(bb, url, false);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("403") || message.toLowerCase().includes("blocked")) {
      return await fetchPage(bb, url, true);
    }
    throw error;
  }
}

async function fetchPage(
  bb: Browserbase,
  url: string,
  useProxies: boolean,
): Promise<{ url: string; content: string }> {
  const response = await bb.fetchAPI.create({
    url,
    allowRedirects: true,
    format: "markdown",
    proxies: useProxies,
  });

  const content =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content, null, 2);

  if (response.statusCode >= 400) {
    throw new Error(`Browserbase fetch failed (${response.statusCode}) for ${url}`);
  }

  return {
    url,
    content: content.slice(0, 12000),
  };
}
