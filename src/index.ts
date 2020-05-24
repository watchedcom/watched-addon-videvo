import {
  createWorkerAddon,
  MovieItem,
  runCli,
  DirectoryItem,
} from "@watchedcom/sdk";
import { getAllCollections, getCollectionResults } from "./videvo.service";

const videvoAddon = createWorkerAddon({
  id: "videvo",
  name: "videvo",
  version: "0.0.0",
  // Trigger this addon on this kind of items
  itemTypes: ["movie", "series"],
  requestArgs: [
    // Trigger this addon when an item has a `name` field
    "name",
    // or trigger it when an item has a `ids.imdb_id` field
    "imdb_id",
  ],
  defaultDirectoryOptions: { displayName: true, imageShape: "landscape" },
});

videvoAddon.registerActionHandler("directory", async (input, ctx) => {
  console.log("directory", input);

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
  console.log("item", input);
});

runCli([videvoAddon]);
