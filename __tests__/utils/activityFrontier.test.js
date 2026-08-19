import { mergeActivityWithFrontier } from "@/src/utils/helpers";

const expense = (id, created_at) => ({ id, created_at, title: `e${id}` });
const transfer = (id, created_at) => ({ id, created_at, amount: id });

const idsByType = (items) =>
  items.map((item) => `${item.type[0]}${item.id}`).join(",");

describe("mergeActivityWithFrontier", () => {
  it("hides older settlements until expenses have loaded that far back", () => {
    // Newest-first page of expenses only reaches April; all transfers are
    // already loaded, including a February settlement.
    const result = mergeActivityWithFrontier({
      expenses: [
        expense(3, "2026-05-01T12:00:00.000Z"),
        expense(2, "2026-04-15T12:00:00.000Z"),
      ],
      transfers: [
        transfer(20, "2026-04-20T12:00:00.000Z"),
        transfer(10, "2026-02-01T12:00:00.000Z"),
      ],
      hasMoreExpenses: true,
      hasMoreTransfers: false,
    });

    expect(idsByType(result.items)).toBe("e3,t20,e2");
    expect(result.shouldFetchExpenses).toBe(true);
    expect(result.shouldFetchTransfers).toBe(false);
  });

  it("reveals the older settlement once expenses reach that date", () => {
    const result = mergeActivityWithFrontier({
      expenses: [
        expense(3, "2026-05-01T12:00:00.000Z"),
        expense(2, "2026-04-15T12:00:00.000Z"),
        expense(1, "2026-02-01T09:00:00.000Z"),
      ],
      transfers: [
        transfer(20, "2026-04-20T12:00:00.000Z"),
        transfer(10, "2026-02-01T12:00:00.000Z"),
      ],
      hasMoreExpenses: false,
      hasMoreTransfers: false,
    });

    expect(idsByType(result.items)).toBe("e3,t20,e2,t10,e1");
    expect(result.shouldFetchExpenses).toBe(false);
    expect(result.shouldFetchTransfers).toBe(false);
  });

  it("hides expenses older than the transfer frontier", () => {
    const result = mergeActivityWithFrontier({
      expenses: [
        expense(4, "2026-08-01T12:00:00.000Z"),
        expense(1, "2026-01-01T12:00:00.000Z"),
      ],
      transfers: [transfer(8, "2026-07-01T12:00:00.000Z")],
      hasMoreExpenses: false,
      hasMoreTransfers: true,
    });

    expect(idsByType(result.items)).toBe("e4,t8");
    expect(result.shouldFetchExpenses).toBe(false);
    expect(result.shouldFetchTransfers).toBe(true);
  });

  it("uses the more recent of the two oldests when both streams have more pages", () => {
    const result = mergeActivityWithFrontier({
      expenses: [
        expense(5, "2026-08-10T12:00:00.000Z"),
        expense(4, "2026-06-01T12:00:00.000Z"),
      ],
      transfers: [
        transfer(9, "2026-08-12T12:00:00.000Z"),
        transfer(8, "2026-08-01T12:00:00.000Z"),
      ],
      hasMoreExpenses: true,
      hasMoreTransfers: true,
    });

    expect(idsByType(result.items)).toBe("t9,e5,t8");
    expect(result.shouldFetchExpenses).toBe(false);
    expect(result.shouldFetchTransfers).toBe(true);
  });

  it("fetches both streams when their oldest timestamps match", () => {
    const result = mergeActivityWithFrontier({
      expenses: [expense(1, "2026-06-01T12:00:00.000Z")],
      transfers: [transfer(1, "2026-06-01T12:00:00.000Z")],
      hasMoreExpenses: true,
      hasMoreTransfers: true,
    });

    expect(result.items.map((item) => item.type).sort()).toEqual([
      "expense",
      "transfer",
    ]);
    expect(result.shouldFetchExpenses).toBe(true);
    expect(result.shouldFetchTransfers).toBe(true);
  });

  it("mixes expenses and transfers when both lists are fully loaded", () => {
    const result = mergeActivityWithFrontier({
      expenses: [
        expense(2, "2026-06-02T12:00:00.000Z"),
        expense(1, "2026-06-01T12:00:00.000Z"),
      ],
      transfers: [transfer(5, "2026-06-01T18:00:00.000Z")],
      hasMoreExpenses: false,
      hasMoreTransfers: false,
    });

    expect(idsByType(result.items)).toBe("e2,t5,e1");
  });

  it("returns an empty list when there is no activity", () => {
    const result = mergeActivityWithFrontier({
      expenses: [],
      transfers: [],
      hasMoreExpenses: false,
      hasMoreTransfers: false,
    });

    expect(result.items).toEqual([]);
    expect(result.shouldFetchExpenses).toBe(false);
    expect(result.shouldFetchTransfers).toBe(false);
  });
});
