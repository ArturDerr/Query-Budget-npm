// базовые значения
const DEFAULT_VALUES {
    windowMs: 1000, // временное окно между запросами в миллисекундах
    maxEntries: 1000, // макс кол-во записей в памяти
    onIssue: (issue) => {
        console.warn(
            `[netwatch] ${issue.type}: ${issue.method} ${issue.url}`
        );
    };
};

// главная функция
export function init(options = {}) {
    const config = {
        ...DEFAULT_VALUES,
        ...options
    };
};