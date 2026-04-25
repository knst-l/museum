import axios from "axios";

// Базовый URL API (по умолчанию localhost, можно переопределить через .env)
const DEFAULT_API_BASE = "http://localhost:8000/api";
const API_BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_BASE).replace(/\/$/, "");

// Создание экземпляра axios с предустановленным baseURL и заголовками
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: false,
});

// Добавляем interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибок CORS и других сетевых ошибок
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      console.error("Ошибка сети. Проверьте, что сервер запущен и доступен.");
      return Promise.reject(new Error("Ошибка сети. Проверьте подключение к серверу."));
    }
    
    // Обработка ошибок HTTP
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const { status, data } = error.response;
      console.error(`Ошибка API (${status}):`, data);
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// ======================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ======================

// buildQuery(params): формирует строку запроса (query string) из объекта параметров
// Возвращает строку вида "?key=value&key2=value2" или "" если параметров нет
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

// endpoint(path): добавляет путь ресурса к базовому URL API
// Возвращает строку полного URL без лишних слешей
const endpoint = (path) =>
  `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`.replace(/\/$/, "");

// ======================
// ОБЩИЕ REST МЕТОДЫ
// ======================

// list(resourcePath, params):
// Отправляет GET-запрос для получения списка ресурсов с возможными фильтрами.
// Возвращает данные (data) — обычно массив объектов или пагинированный список.
// Если ответ пагинированный (DRF формат), возвращает массив results, иначе сам data.
const list = async (resourcePath, params) => {
  const url = `${endpoint(resourcePath)}/${buildQuery(params)}`.replace(/\/\?$/, "");
  const { data } = await apiClient.get(url);
  // DRF возвращает пагинированные ответы в формате {count, next, previous, results}
  // Если есть поле results, возвращаем его, иначе возвращаем data как есть
  return Array.isArray(data) ? data : (data.results || data);
};

// retrieve(resourcePath, id, params):
// Отправляет GET-запрос для получения одного объекта по его ID.
// Возвращает объект данных (data) — один ресурс.
const retrieve = async (resourcePath, id, params) => {
  const url = `${endpoint(resourcePath)}/${encodeURIComponent(id)}/${buildQuery(params)}`.replace(/\/\?$/, "");
  const { data } = await apiClient.get(url);
  return data;
};

// create(resourcePath, payload):
// Отправляет POST-запрос для создания нового ресурса.
// Возвращает созданный объект данных (data) — как правило, объект с присвоенным ID.
const create = async (resourcePath, payload) => {
  const { data } = await apiClient.post(`${endpoint(resourcePath)}/`, payload);
  return data;
};

// update(resourcePath, id, payload, { partial = true } = {}):
// Отправляет PATCH (по умолчанию) или PUT запрос для обновления ресурса.
// Возвращает обновлённый объект данных (data).
const update = async (resourcePath, id, payload, { partial = true } = {}) => {
  const url = `${endpoint(resourcePath)}/${encodeURIComponent(id)}/`;
  const method = partial ? "patch" : "put";
  const { data } = await apiClient[method](url, payload);
  return data;
};

// remove(resourcePath, id):
// Отправляет DELETE-запрос для удаления ресурса.
// Возвращает true при успешном удалении.
const remove = async (resourcePath, id) => {
  const url = `${endpoint(resourcePath)}/${encodeURIComponent(id)}/`;
  await apiClient.delete(url);
  return true;
};

// ======================
// СЛОВАРЬ РЕСУРСОВ
// ======================

const RESOURCES = {
  // shared
  images: "/shared/images",
  models3d: "/shared/models3d",
  // historical figures
  scienceFields: "/historical-figures/science-fields",
  historicalFigures: "/historical-figures/historical-figures",
  // artifacts
  hallCategories: "/artifacts/hall-categories",
  halls: "/artifacts/halls",
  artifactCategories: "/artifacts/artifact-categories",
  artifacts: "/artifacts/artifacts",
};

// ======================
// API: КОНКРЕТНЫЕ РЕСУРСЫ
// ======================

// ImagesAPI — работа с изображениями
export const ImagesAPI = {
  list: (params) => list(RESOURCES.images, params),             // Возвращает список изображений
  get: (id, params) => retrieve(RESOURCES.images, id, params),  // Возвращает одно изображение по ID
  create: (payload) => create(RESOURCES.images, payload),       // Возвращает созданное изображение
  update: (id, payload, opts) => update(RESOURCES.images, id, payload, opts), // Возвращает обновлённое изображение
  remove: (id) => remove(RESOURCES.images, id),                 // Возвращает true после удаления
};

// Models3DAPI — работа с 3D-моделями
export const Models3DAPI = {
  list: (params) => list(RESOURCES.models3d, params),
  get: (id, params) => retrieve(RESOURCES.models3d, id, params),
  create: (payload) => create(RESOURCES.models3d, payload),
  update: (id, payload, opts) => update(RESOURCES.models3d, id, payload, opts),
  remove: (id) => remove(RESOURCES.models3d, id),
};

// ScienceFieldsAPI — работа с научными областями
export const ScienceFieldsAPI = {
  list: (params) => list(RESOURCES.scienceFields, params),
  get: (id, params) => retrieve(RESOURCES.scienceFields, id, params),
  create: (payload) => create(RESOURCES.scienceFields, payload),
  update: (id, payload, opts) => update(RESOURCES.scienceFields, id, payload, opts),
  remove: (id) => remove(RESOURCES.scienceFields, id),
};

// HistoricalFiguresAPI — работа с историческими личностями
export const HistoricalFiguresAPI = {
  list: (params) => list(RESOURCES.historicalFigures, params),
  get: (id, params) => retrieve(RESOURCES.historicalFigures, id, params),
  create: (payload) => create(RESOURCES.historicalFigures, payload),
  update: (id, payload, opts) => update(RESOURCES.historicalFigures, id, payload, opts),
  remove: (id) => remove(RESOURCES.historicalFigures, id),
};

// HallCategoriesAPI — категории залов
export const HallCategoriesAPI = {
  list: (params) => list(RESOURCES.hallCategories, params),
  get: (id, params) => retrieve(RESOURCES.hallCategories, id, params),
  create: (payload) => create(RESOURCES.hallCategories, payload),
  update: (id, payload, opts) => update(RESOURCES.hallCategories, id, payload, opts),
  remove: (id) => remove(RESOURCES.hallCategories, id),
};

// HallsAPI — залы
export const HallsAPI = {
  list: (params) => list(RESOURCES.halls, params),
  get: (id, params) => retrieve(RESOURCES.halls, id, params),
  create: (payload) => create(RESOURCES.halls, payload),
  update: (id, payload, opts) => update(RESOURCES.halls, id, payload, opts),
  remove: (id) => remove(RESOURCES.halls, id),
};

// ArtifactCategoriesAPI — категории артефактов
export const ArtifactCategoriesAPI = {
  list: (params) => list(RESOURCES.artifactCategories, params),
  get: (id, params) => retrieve(RESOURCES.artifactCategories, id, params),
  create: (payload) => create(RESOURCES.artifactCategories, payload),
  update: (id, payload, opts) => update(RESOURCES.artifactCategories, id, payload, opts),
  remove: (id) => remove(RESOURCES.artifactCategories, id),
};

// ArtifactsAPI — артефакты
export const ArtifactsAPI = {
  list: (params) => list(RESOURCES.artifacts, params),
  get: (id, params) => retrieve(RESOURCES.artifacts, id, params),
  create: (payload) => create(RESOURCES.artifacts, payload),
  update: (id, payload, opts) => update(RESOURCES.artifacts, id, payload, opts),
  remove: (id) => remove(RESOURCES.artifacts, id),
};

// ======================
// ОБЩИЙ ЭКСПОРТ API
// ======================
// Возвращает сгруппированные API-методы и утилиты.
export const API = {
  baseURL: API_BASE_URL,   // Базовый URL API
  client: apiClient,       // Экземпляр axios
  images: ImagesAPI,
  models3d: Models3DAPI,
  scienceFields: ScienceFieldsAPI,
  historicalFigures: HistoricalFiguresAPI,
  hallCategories: HallCategoriesAPI,
  halls: HallsAPI,
  artifactCategories: ArtifactCategoriesAPI,
  artifacts: ArtifactsAPI,
  util: { buildQuery },    // Вспомогательная функция для query-параметров
};

export default API;
