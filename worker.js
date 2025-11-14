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

      $(".result-item").each((i, item) => {
        const title = $(item).find(".details h3 a").text().trim();
        const link = $(item).find(".details h3 a").attr("href");
        const img = $(item).find(".image img").attr("src");

        // extra fields if available
        const year = $(item).find(".details .year").text().trim();
        const quality = $(item).find(".details .quality").text().trim();
        const type = $(item).find(".details .type").text().trim();

        if (title && link) {
          results.push({
            Title: title,
            Img: img || null,
            Link: link,
            Year: year || null,
            Quality: quality || null,
            Type: type || null
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
