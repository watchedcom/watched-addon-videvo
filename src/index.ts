import {
  createWorkerAddon,
  MovieItem,
  runCli,
  DirectoryItem,
} from "@watchedcom/sdk";
import * as cheerio from "cheerio";
import { getAllCollections, getCollectionResults } from "./videvo.service";

const videvoAddon = createWorkerAddon({
  id: "videvo",
  name: "videvo",
  version: "0.0.0",
  // Trigger this addon on this kind of items
  itemTypes: ["movie"],
  requestArgs: [
    // Trigger this addon when an item has a `name` field
    "name",
    // or trigger it when an item has a `ids.imdb_id` field
    "imdb_id",
  ],
  defaultDirectoryOptions: { displayName: true, imageShape: "landscape" },
});

videvoAddon.registerActionHandler("directory", async (input, ctx) => {
  // console.log("directory", input);

  const page = parseInt(<string>input.cursor) || 1;

  if (input.id) {
    const items = await getCollectionResults({
      id: <string>input.id,
      page: page - 1,
    });

    return {
      items,
      nextCursor: items.length ? page + 1 : null,
    };
  }

  const result = await getAllCollections({
    page,
    collection_type: "popular",
    sort: "newest",
    getActive: true,
  });

  return {
    items: result.rows.map<DirectoryItem>((_) => {
      return {
        type: "directory",
        id: _.url,
        name: _.name,
        images: {
          poster: "https://www.videvo.net" + _.thumbnail,
        },
      };
    }),
    nextCursor: result.rows.length === 0 ? null : page + 1,
  };
});

videvoAddon.registerActionHandler("item", async (input, ctx) => {
  // console.log("item", input);

  const id = input.ids.id;

  const result = ctx.fetch(`https://www.videvo.net/video/${id}/`);

  const $ = cheerio.load(await (await result).text());

  const src = $("div.videowrapper video source").attr("src");
  const filename = src?.split("/").pop()?.split(".").shift();

  return {
    type: "movie",
    ids: input.ids,
    name: $("h2.title").text().trim(),
    description: $("p.description-paragraph").first().text().trim(),
    images: {
      poster: $("video#video").attr("poster"),
    },
    sources: [
      {
        type: "url",
        name: "Medium",
        url: "https://cdn.videvo.net/" + src,
      },
      {
        type: "url",
        name: "High",
        url: `https://cdn.videvo.net/videvo_files/videos/${filename}.mp4`,
      },
    ],
  };
});

runCli([videvoAddon]);
