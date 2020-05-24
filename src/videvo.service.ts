import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { MovieItem } from "@watchedcom/sdk/dist";

export interface GetAllCollectionsParams {
  page: number;
  collection_type: string;
  sort: "newest";
  getActive: boolean;
}

export interface ApiResponse<T = any> {
  rows: T[];
  records: string;
  page: number;
  total: number;
}

type CollectionItem = {
  id: string;
  type: string;
  name: string;
  url: string;
  no_videos: string;
  page_title: string;
  page_subtitle: string;
  date_added: string;
  thumbnail: string;
};

export const getAllCollections = async (
  params: GetAllCollectionsParams
): Promise<ApiResponse<CollectionItem>> => {
  const resp = await fetch(
    "https://www.videvo.net/api/?path=category/get-all-collections&params=" +
      decodeURI(JSON.stringify(params))
  );

  return resp.json();
};

export const getCollectionResults = async ({
  id,
  page,
}: {
  id: string;
  page: number;
}): Promise<MovieItem[]> => {
  const resp = await fetch(
    "https://www.videvo.net/api/?path=elasticsearch/listResults&params=" +
      decodeURI(
        JSON.stringify({
          page_slug: "collections",
          category: "coll_" + id,
          clip_type_translated: null,
          rec: 20,
          free_ratio: 10,
          load_more_btn: false,
          pge: page,
          json_return: true,
        })
      )
  );

  const { elements } = await resp.json();

  return (<string[]>elements).map((elemHtml) => {
    const $ = cheerio.load(elemHtml);
    const id = $("img.preview").attr("id") as string;

    return {
      type: "movie",
      id,
      ids: {
        id,
      },
      name: $("div.thumb_video_name").text().trim(),
      images: {
        poster: $("img.preview").attr("src"),
      },
    };
  });
};
