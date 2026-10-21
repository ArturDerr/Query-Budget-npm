## NPM библиотека для мониторинга API-запросов и обнаружения избыточных сетевых вызовов

[![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

### Что за библиотека?

Библиотека, которая следит за сетевыми запросами в браузере и находит среди них избыточные: дубликаты, повторы без изменений, всплески и запросы, чей результат не пригодился.

### Установка
```
npm install netwatch
```

### Использование
```
import { init } from 'netwatch';

const monitor = init({
  onIssue(issue) {
    console.warn(`[netwatch] ${issue.type}: ${issue.method} ${issue.url}`, issue);
  },
});
```

### Схема работы

![alt text](image.png)