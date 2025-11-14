import cheerio from "cheerio";

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

      $(".post-item, article").each((i, el) => {
        const title = $(el).find("h2 a, h3 a, .entry-title a").text().trim();
        const url = $(el).find("a").attr("href");
        const img = $(el).find("img").attr("src");

        if (title && url) {
          results.push({ title, url, thumbnail: img || null });
        }
      });

      return Response.json({ status: true, query: q, results }, { headers });

    } catch (err) {
      return Response.json({ status: false, error: err.message }, { headers });
    }
  }
};