import { init } from "./index.js";

const monitor = init({ onIssue(issue) { console.warn(`[netwatch] ${issue.type}: ${issue.method} ${issue.url}`, issue); } });

fetch("/api/users");
fetch("/api/users");

monitor.stop();