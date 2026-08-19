export const groupElementsByDay = (elements, lang) => {
  const groupedElements = {};
  elements.forEach((activity) => {
    const createdDate = new Date(activity.created_at);
    const frmt = {
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      es: "es-ES",
      tr: "tr-TR",
      gr: "el-GR",
      ru: "ru-RU",
      it: "it-IT",
    };
    const dayKey = createdDate.toLocaleDateString(frmt[lang] || "en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    if (!groupedElements[dayKey]) {
      groupedElements[dayKey] = [];
    }
    groupedElements[dayKey].push(activity);
  });
  return groupedElements;
};

const timestampOf = (value) => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const oldestTimestamp = (items) => {
  let oldest = null;
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

// Merge independently paginated expenses and transfers, but only emit items
// down to the other stream's loaded frontier. Older settlements stay hidden
// until expenses have been fetched far enough back to interleave them.
export const mergeActivityWithFrontier = ({
  expenses = [],
  transfers = [],
  hasMoreExpenses = false,
  hasMoreTransfers = false,
} = {}) => {
  const expenseItems = expenses.map((expense) => ({
    ...expense,
    type: "expense",
  }));
  const transferItems = transfers.map((transfer) => ({
    ...transfer,
    type: "transfer",
  }));

  const items = [...expenseItems, ...transferItems].sort((a, b) => {
    const delta = timestampOf(b.created_at) - timestampOf(a.created_at);
    if (delta) {
      return delta;
    }
    return (b.id ?? 0) - (a.id ?? 0);
  });

  const oldestExpense = oldestTimestamp(expenses);
  const oldestTransfer = oldestTimestamp(transfers);

  const cutoffCandidates = [];
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

// Generate a formatted date
export function getFormattedDate(date) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return date?.toLocaleDateString("en-US", options);
}

export function formatDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateString(dateString, lang) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const frmt = {
    en: "en-US",
    fr: "fr-FR",
    de: "de-DE",
    es: "es-ES",
    tr: "tr-TR",
    gr: "el-GR",
    ru: "ru-RU",
    it: "it-IT",
  };
  return date.toLocaleDateString(frmt[lang] || "en-US", options);
}

export const inThisMonth = (dateS) => {
  // Get today's date
  const today = new Date();
  const date = new Date(dateS);
  // Set the time to noon to avoid timezone issues
  today.setUTCHours(12, 0, 0, 0);
  date.setUTCHours(12, 0, 0, 0);

  // Get the month and year of today's date
  const currentMonth = today.getMonth(); // getMonth() returns month index from 0 (January) to 11 (December)
  const currentYear = today.getFullYear(); // getFullYear() returns the 4-digit year

  // Get the month and year of the given date
  const dateMonth = date.getMonth();
  const dateYear = date.getFullYear();

  // Check if the month and year of the given date is the same as today's month and year
  return dateMonth === currentMonth && dateYear === currentYear;
};
