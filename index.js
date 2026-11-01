// базовые значения
const DEFAULT_VALUES = {
  windowMs: 1000, // временное окно между запросами в миллисекундах
  maxEntries: 1000, // макс кол-во записей в памяти
  onIssue: (issue) => {
    console.warn(`[netwatch] ${issue.type}: ${issue.method} ${issue.url}`);
  },
};

export function init(options = {}) {
  const config = {
    ...DEFAULT_VALUES,
    ...options,
  };

  const originalFetch = globalThis.fetch;
  // кол-во запросов
  const requests = new Map();
  // включен ли мониторинг
  let active = true;

  // обработчик ошибок
  function report(issue) {
    try {
      config.onIssue(issue);
    } catch (error) {
      console.error("[netwatch] Error:", error);
    }
  }

  // фун-я обнаружения повторяющих запросов
  function detectRequest(method, url, body) {
    const now = Date.now();
    const key = createKey(method, url, body);
    const previous = requests.get(key);

    if (previous && now - previous.timestamp <= config.windowMs) {
      previous.count += 1;
      previous.timestamp = now;

      // создание репорта
      report({
        type: "duplicate",
        method,
        url,
        count: previous.count,
        timestamp: now,
      });
    } else {
      requests.set(key, {
        timestamp: now,
        count: 1,
      });

      // ограничение памяти
      trimRequests();
    }
  }

  function trimRequests() {
    while (requests.size > config.maxEntries) {
      const oldestKey = requests.keys().next().value;

      if (oldestKey === undefined) {
        break;
      }

      requests.delete(oldestKey);
    }
  }

  globalThis.fetch = monitoredFetch;

  // фун-я мониторинга запросов
  async function monitoredFetch(input, fetchOptions = {}) {
    if (!active) {
      return originalFetch.call(globalThis, input, fetchOptions);
    }

    try {
      let request = null;

      if (input instanceof Request) {
        request = input;
      }

      // проверка на запрос
      const rawUrl = request ? request.url : String(input);

      // нормализуем url
      const url = new URL(
        rawUrl,
        globalThis.location?.href ?? "http://localhost",
      ).href;

      // какой метод используется
      const method = (
        fetchOptions.method ??
        request?.method ??
        "GET"
      ).toUpperCase();

      const body =
        typeof fetchOptions.body === "string" ? fetchOptions.body : "";

      detectRequest(method, url, body);
    } catch (error) {
      console.error(`[netwatch] Monitoring error: ${error}`);
    }

    // отправляем запрос
    return originalFetch.call(globalThis, input, fetchOptions);
  }

  return {
    stop() {
      active = false;

      if (globalThis.fetch === monitoredFetch) {
        globalThis.fetch = originalFetch;
      }

      requests.clear();
    },
  };
}

// ключ запроса
function createKey(method, url, body) {
  return JSON.stringify([method, url, body]);
}
