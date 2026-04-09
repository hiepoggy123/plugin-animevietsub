/**
 * animevietsub - Built from src/animevietsub/
 * Generated: 2026-04-09T09:31:19.053Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/animevietsub/http.js
var BASE_URL = "https://animevietsub.id";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5"
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    console.log(`[Animevietsub] Fetching URL: ${url}`);
    try {
      const response = yield fetch(url, __spreadValues({
        headers: __spreadValues(__spreadValues({}, HEADERS), options.headers)
      }, options));
      if (!response.ok) {
        console.error(`[Animevietsub] HTTP Error ${response.status} for ${url}`);
        return null;
      }
      return yield response.text();
    } catch (e) {
      console.error(`[Animevietsub] Network Error: ${e.message}`);
      return null;
    }
  });
}
function getMediaTitle(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const TMDB_API_KEY = "1b3113663c9004682ed61086cf967c44";
    const typeAlias = mediaType === "tv" ? "tv" : "movie";
    const url = `https://api.themoviedb.org/3/${typeAlias}/${tmdbId}?api_key=${TMDB_API_KEY}&language=vi-VN`;
    try {
      const res = yield fetchText(url);
      if (!res)
        return null;
      const data = JSON.parse(res);
      return data.title || data.name || data.original_title || data.original_name;
    } catch (e) {
      console.error(`[Animevietsub] TMDB JSON parse error: ${e.message}`);
    }
    return null;
  });
}

// src/animevietsub/extractor.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
function extractStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const title = yield getMediaTitle(tmdbId, mediaType);
    if (!title) {
      console.error("[Animevietsub] Unable to fetch title from Cinemeta");
      return [];
    }
    console.log(`[Animevietsub] Searching for: ${title}`);
    const searchUrl = `${BASE_URL}/tim-kiem/${encodeURIComponent(title)}/`;
    const searchHtml = yield fetchText(searchUrl);
    if (!searchHtml)
      return [];
    const $ = import_cheerio_without_node_native.default.load(searchHtml);
    let movieLink = null;
    $(".TPostMv .TPost a").each((i, el) => {
      if (i === 0) {
        movieLink = $(el).attr("href");
      }
    });
    if (!movieLink) {
      console.log(`[Animevietsub] No results found for ${title}`);
      return [];
    }
    if (!movieLink.startsWith("http")) {
      movieLink = BASE_URL + movieLink;
    }
    console.log(`[Animevietsub] Found movie link: ${movieLink}`);
    const detailHtml = yield fetchText(movieLink);
    if (!detailHtml)
      return [];
    const $detail = import_cheerio_without_node_native.default.load(detailHtml);
    let watchLink = $detail("a.watch_button_more").attr("href") || $detail('a:contains("Xem phim")').attr("href");
    if (!watchLink) {
      watchLink = movieLink;
    } else if (!watchLink.startsWith("http")) {
      watchLink = BASE_URL + watchLink;
    }
    console.log(`[Animevietsub] Watch link: ${watchLink}`);
    const watchHtml = yield fetchText(watchLink);
    if (!watchHtml)
      return [];
    const $watch = import_cheerio_without_node_native.default.load(watchHtml);
    let targetEpisodeLink = null;
    if (mediaType === "tv") {
      const targetEpStr = String(episode);
      $watch("a.btn-episode.episode-link").each((i, el) => {
        const epText = $watch(el).text().trim();
        if (epText === targetEpStr || epText === `T\u1EADp ${targetEpStr}` || epText === `0${targetEpStr}`.slice(-2)) {
          targetEpisodeLink = $watch(el).attr("href");
        }
      });
    }
    if (!targetEpisodeLink && mediaType === "tv") {
      targetEpisodeLink = $watch("a.btn-episode.episode-link").first().attr("href");
    }
    let finalWatchLink = targetEpisodeLink ? targetEpisodeLink : watchLink;
    if (finalWatchLink && !finalWatchLink.startsWith("http")) {
      finalWatchLink = BASE_URL + finalWatchLink;
    }
    let iframeUrl = null;
    if (finalWatchLink !== watchLink) {
      const epHtml = yield fetchText(finalWatchLink);
      if (epHtml) {
        const $ep = import_cheerio_without_node_native.default.load(epHtml);
        iframeUrl = $ep("iframe").attr("src");
      }
    } else {
      iframeUrl = $watch("iframe").attr("src");
    }
    const streams = [];
    if (iframeUrl) {
      streams.push({
        name: "Animevietsub",
        title: "Embedded Server",
        url: iframeUrl,
        quality: "Auto",
        headers: {
          "Referer": BASE_URL + "/",
          "User-Agent": HEADERS["User-Agent"]
        }
      });
    }
    return streams;
  });
}

// src/animevietsub/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[Animevietsub] Request: ${mediaType} ${tmdbId}`);
      const streams = yield extractStreams(tmdbId, mediaType, season, episode);
      return streams;
    } catch (error) {
      console.error(`[Animevietsub] Error: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
