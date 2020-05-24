import fetch from "node-fetch";

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
