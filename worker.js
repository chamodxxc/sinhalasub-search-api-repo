import * as cheerio from "cheerio";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const q = url.searchParams.get("query");

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    if (!q) {
      return Response.json({ status: false, error: "Missing ?query=" }, { headers });
    }

    try {
      const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(q)}`;

      const html = await fetch(searchUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      }).then(r => r.text());

      const $ = cheerio.load(html);
      const results = [];

      // FIXED SELECTORS
      $(".result-item").each((i, el) => {
        const title = $(el).find(".details h3 a").text().trim();
        const url = $(el).find(".details h3 a").attr("href");
        const img = $(el).find(".image img").attr("src");

        if (title && url) {
          results.push({
            title,
            url,
            thumbnail: img || null
          });
        }
      });

      return Response.json(
        { status: true, query: q, results },
        { headers }
      );

    } catch (err) {
      return Response.json(
        { status: false, error: err.message },
        { headers }
      );
    }
  }
};
