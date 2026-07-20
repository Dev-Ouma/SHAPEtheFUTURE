export type ChartVisualType = "area" | "bar" | "line" | "pie" | "table";

const STORAGE_PREFIX = "ouk_sd_chart_";

export function readChartPref(key: string, fallback: ChartVisualType): ChartVisualType {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw && ["area", "bar", "line", "pie", "table"].includes(raw)) {
      return raw as ChartVisualType;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

export function writeChartPref(key: string, value: ChartVisualType) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  } catch {
    /* ignore */
  }
}

export type QueueListView = "table" | "cards";

export function readQueueViewPref(fallback: QueueListView = "table"): QueueListView {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem("ouk_sd_queue_view");
    if (raw === "table" || raw === "cards") return raw;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function writeQueueViewPref(value: QueueListView) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("ouk_sd_queue_view", value);
  } catch {
    /* ignore */
  }
}
