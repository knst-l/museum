import axios from "axios";

const DEFAULT_API_BASE = "http://localhost:8000/api";
const API_BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_BASE).replace(/\/$/, "");
const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      console.error("Ошибка сети. Проверьте, что сервер запущен и доступен.");
      return Promise.reject(new Error("Ошибка сети. Проверьте подключение к серверу."));
    }

    if (error.response) {
      const { status, data } = error.response;
      console.error(`Ошибка API (${status}):`, data);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

const buildQuery = (params) => {
  if (!params || typeof params !== "object") return "";
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => usp.append(key, String(v)));
    } else {
      usp.set(key, String(value));
    }
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
};

const endpoint = (path) => `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`.replace(/\/$/, "");

export const resolveMediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("//")) return `http:${path}`;
  if (path.startsWith("/")) return `${MEDIA_BASE_URL}${path}`;
  return `${MEDIA_BASE_URL}/${path}`;
};

const list = async (resourcePath, params) => {
  const url = `${endpoint(resourcePath)}/${buildQuery(params)}`.replace(/\/\?$/, "");
  const { data } = await apiClient.get(url);
  return Array.isArray(data) ? data : data.results || data;
};

const retrieve = async (resourcePath, id, params) => {
  const url = `${endpoint(resourcePath)}/${encodeURIComponent(id)}/${buildQuery(params)}`.replace(/\/\?$/, "");
  const { data } = await apiClient.get(url);
  return data;
};

const create = async (resourcePath, payload) => {
  const { data } = await apiClient.post(`${endpoint(resourcePath)}/`, payload);
  return data;
};

const update = async (resourcePath, id, payload, { partial = true } = {}) => {
  const url = `${endpoint(resourcePath)}/${encodeURIComponent(id)}/`;
  const method = partial ? "patch" : "put";
  const { data } = await apiClient[method](url, payload);
  return data;
};

const remove = async (resourcePath, id) => {
  const url = `${endpoint(resourcePath)}/${encodeURIComponent(id)}/`;
  await apiClient.delete(url);
  return true;
};

const RESOURCES = {
  images: "/shared/images",
  models3d: "/shared/models3d",
  scienceFields: "/historical-figures/science-fields",
  historicalFigures: "/historical-figures/historical-figures",
  hallCategories: "/artifacts/hall-categories",
  halls: "/artifacts/halls",
  artifactCategories: "/artifacts/artifact-categories",
  artifacts: "/artifacts/artifacts",
  galleryFolders: "/artifacts/gallery-folders",
  mediaArchiveItems: "/artifacts/media-archive-items",
};

export const ImagesAPI = {
  list: (params) => list(RESOURCES.images, params),
  get: (id, params) => retrieve(RESOURCES.images, id, params),
  create: (payload) => create(RESOURCES.images, payload),
  update: (id, payload, opts) => update(RESOURCES.images, id, payload, opts),
  remove: (id) => remove(RESOURCES.images, id),
};

export const Models3DAPI = {
  list: (params) => list(RESOURCES.models3d, params),
  get: (id, params) => retrieve(RESOURCES.models3d, id, params),
  create: (payload) => create(RESOURCES.models3d, payload),
  update: (id, payload, opts) => update(RESOURCES.models3d, id, payload, opts),
  remove: (id) => remove(RESOURCES.models3d, id),
};

export const ScienceFieldsAPI = {
  list: (params) => list(RESOURCES.scienceFields, params),
  get: (id, params) => retrieve(RESOURCES.scienceFields, id, params),
  create: (payload) => create(RESOURCES.scienceFields, payload),
  update: (id, payload, opts) => update(RESOURCES.scienceFields, id, payload, opts),
  remove: (id) => remove(RESOURCES.scienceFields, id),
};

export const HistoricalFiguresAPI = {
  list: (params) => list(RESOURCES.historicalFigures, params),
  get: (id, params) => retrieve(RESOURCES.historicalFigures, id, params),
  create: (payload) => create(RESOURCES.historicalFigures, payload),
  update: (id, payload, opts) => update(RESOURCES.historicalFigures, id, payload, opts),
  remove: (id) => remove(RESOURCES.historicalFigures, id),
};

export const HallCategoriesAPI = {
  list: (params) => list(RESOURCES.hallCategories, params),
  get: (id, params) => retrieve(RESOURCES.hallCategories, id, params),
  create: (payload) => create(RESOURCES.hallCategories, payload),
  update: (id, payload, opts) => update(RESOURCES.hallCategories, id, payload, opts),
  remove: (id) => remove(RESOURCES.hallCategories, id),
};

export const HallsAPI = {
  list: (params) => list(RESOURCES.halls, params),
  get: (id, params) => retrieve(RESOURCES.halls, id, params),
  create: (payload) => create(RESOURCES.halls, payload),
  update: (id, payload, opts) => update(RESOURCES.halls, id, payload, opts),
  remove: (id) => remove(RESOURCES.halls, id),
};

export const ArtifactCategoriesAPI = {
  list: (params) => list(RESOURCES.artifactCategories, params),
  get: (id, params) => retrieve(RESOURCES.artifactCategories, id, params),
  create: (payload) => create(RESOURCES.artifactCategories, payload),
  update: (id, payload, opts) => update(RESOURCES.artifactCategories, id, payload, opts),
  remove: (id) => remove(RESOURCES.artifactCategories, id),
};

export const ArtifactsAPI = {
  list: (params) => list(RESOURCES.artifacts, params),
  get: (id, params) => retrieve(RESOURCES.artifacts, id, params),
  create: (payload) => create(RESOURCES.artifacts, payload),
  update: (id, payload, opts) => update(RESOURCES.artifacts, id, payload, opts),
  remove: (id) => remove(RESOURCES.artifacts, id),
};

export const GalleryFoldersAPI = {
  list: (params) => list(RESOURCES.galleryFolders, params),
  get: (id, params) => retrieve(RESOURCES.galleryFolders, id, params),
  create: (payload) => create(RESOURCES.galleryFolders, payload),
  update: (id, payload, opts) => update(RESOURCES.galleryFolders, id, payload, opts),
  remove: (id) => remove(RESOURCES.galleryFolders, id),
};

export const MediaArchiveAPI = {
  list: (params) => list(RESOURCES.mediaArchiveItems, params),
  get: (id, params) => retrieve(RESOURCES.mediaArchiveItems, id, params),
  create: (payload) => create(RESOURCES.mediaArchiveItems, payload),
  update: (id, payload, opts) => update(RESOURCES.mediaArchiveItems, id, payload, opts),
  remove: (id) => remove(RESOURCES.mediaArchiveItems, id),
};

export const API = {
  baseURL: API_BASE_URL,
  client: apiClient,
  images: ImagesAPI,
  models3d: Models3DAPI,
  scienceFields: ScienceFieldsAPI,
  historicalFigures: HistoricalFiguresAPI,
  hallCategories: HallCategoriesAPI,
  halls: HallsAPI,
  artifactCategories: ArtifactCategoriesAPI,
  artifacts: ArtifactsAPI,
  galleryFolders: GalleryFoldersAPI,
  mediaArchive: MediaArchiveAPI,
  util: { buildQuery },
};

export default API;
