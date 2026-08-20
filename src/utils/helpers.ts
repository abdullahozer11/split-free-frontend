import { isLanguage, type Language } from "@/src/translations";

const DATE_LOCALES = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  tr: "tr-TR",
  gr: "el-GR",
  ru: "ru-RU",
  it: "it-IT",
} as const satisfies Record<Language, string>;

function dateLocale(lang?: string | null): string {
  if (isLanguage(lang)) {
    return DATE_LOCALES[lang];
  }
  return DATE_LOCALES.en;
}

export type ActivityRecord = {
  created_at?: string | number | Date | null;
  id?: number | string | null;
};

type MergeActivityArgs<E extends ActivityRecord, T extends ActivityRecord> = {
  expenses?: readonly E[] | null;
  transfers?: readonly T[] | null;
  hasMoreExpenses?: boolean;
  hasMoreTransfers?: boolean;
};

export const groupElementsByDay = <T extends ActivityRecord>(
  elements: readonly T[],
  lang?: string | null,
): Record<string, T[]> => {
  const groupedElements: Record<string, T[]> = {};
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    year: "numeric",
  };
  elements.forEach((activity) => {
    const createdDate = new Date(activity.created_at ?? "");
    const dayKey = createdDate.toLocaleDateString(dateLocale(lang), options);
    if (!groupedElements[dayKey]) {
      groupedElements[dayKey] = [];
    }
    groupedElements[dayKey].push(activity);
  });
  return groupedElements;
};

const timestampOf = (value: unknown): number | null => {
  if (value == null) {
    return null;
  }
  const time = new Date(value as string | number | Date).getTime();
  return Number.isNaN(time) ? null : time;
};

const oldestTimestamp = (
  items: readonly { created_at?: unknown }[],
): number | null => {
  let oldest: number | null = null;
  items.forEach((item) => {
    const time = timestampOf(item?.created_at);
    if (time == null) {
      return;
    }
    if (oldest == null || time < oldest) {
      oldest = time;
    }
  });
  return oldest;
};

const numericId = (value: number | string | null | undefined): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

// Merge independently paginated expenses and transfers, but only emit items
// down to the other stream's loaded frontier. Older settlements stay hidden
// until expenses have been fetched far enough back to interleave them.
export const mergeActivityWithFrontier = <
  E extends ActivityRecord = ActivityRecord,
  T extends ActivityRecord = ActivityRecord,
>({
  expenses,
  transfers,
  hasMoreExpenses = false,
  hasMoreTransfers = false,
}: MergeActivityArgs<E, T> = {}): {
  items: ((E & { type: "expense" }) | (T & { type: "transfer" }))[];
  shouldFetchExpenses: boolean;
  shouldFetchTransfers: boolean;
} => {
  const expenseRows = expenses ?? [];
  const transferRows = transfers ?? [];
  const expenseItems = expenseRows.map((expense) => ({
    ...expense,
    type: "expense" as const,
  }));
  const transferItems = transferRows.map((transfer) => ({
    ...transfer,
    type: "transfer" as const,
  }));

  const items = [...expenseItems, ...transferItems].sort((a, b) => {
    const delta =
      (timestampOf(b.created_at) ?? 0) - (timestampOf(a.created_at) ?? 0);
    if (delta) {
      return delta;
    }
    return numericId(b.id) - numericId(a.id);
  });

  const oldestExpense = oldestTimestamp(expenseRows);
  const oldestTransfer = oldestTimestamp(transferRows);

  const cutoffCandidates: number[] = [];
  if (hasMoreExpenses && oldestExpense != null) {
    cutoffCandidates.push(oldestExpense);
  }
  if (hasMoreTransfers && oldestTransfer != null) {
    cutoffCandidates.push(oldestTransfer);
  }
  const cutoff = cutoffCandidates.length ? Math.max(...cutoffCandidates) : null;

  const visibleItems =
    cutoff == null
      ? items
      : items.filter((item) => {
          const time = timestampOf(item.created_at);
          return time != null && time >= cutoff;
        });

  const shouldFetchExpenses = Boolean(
    hasMoreExpenses &&
    (oldestTransfer == null ||
      !hasMoreTransfers ||
      oldestExpense == null ||
      oldestExpense >= oldestTransfer),
  );
  const shouldFetchTransfers = Boolean(
    hasMoreTransfers &&
    (oldestExpense == null ||
      !hasMoreExpenses ||
      oldestTransfer == null ||
      oldestTransfer >= oldestExpense),
  );

  return {
    items: visibleItems,
    shouldFetchExpenses,
    shouldFetchTransfers,
  };
};

export function getFormattedDate(date?: Date | null): string | undefined {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date?.toLocaleDateString("en-US", options);
}

export function formatDate(dateObj: Date): string {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateString(
  dateString: string | number | Date,
  lang?: string | null,
): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString(dateLocale(lang), options);
}

export const inThisMonth = (
  dateS: string | number | Date | null | undefined,
): boolean => {
  if (dateS == null) {
    return false;
  }
  const today = new Date();
  const date = new Date(dateS);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  today.setUTCHours(12, 0, 0, 0);
  date.setUTCHours(12, 0, 0, 0);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const dateMonth = date.getMonth();
  const dateYear = date.getFullYear();

  return dateMonth === currentMonth && dateYear === currentYear;
};
