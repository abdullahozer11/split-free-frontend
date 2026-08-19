import {
  extractMemberIds,
  resolveExpenseFormDefaults,
} from "@/src/utils/expenseFormDefaults";

const members = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Michael" },
  { id: 3, name: "John" },
];

describe("extractMemberIds", () => {
  it("reads numeric ids", () => {
    expect(extractMemberIds([1, 3, 3, 2])).toEqual([1, 3, 2]);
  });

  it("reads expense list payer/participant rows", () => {
    expect(extractMemberIds([{ member: 2 }, { member: 1 }])).toEqual([2, 1]);
  });

  it("reads nested member objects", () => {
    expect(
      extractMemberIds([{ member: { id: 3, name: "John" } }, { id: 1 }]),
    ).toEqual([3, 1]);
  });

  it("ignores invalid entries", () => {
    expect(extractMemberIds([null, undefined, {}, "x", 0])).toEqual([0]);
    expect(extractMemberIds(undefined)).toEqual([]);
  });
});

describe("resolveExpenseFormDefaults", () => {
  it("defaults buyer and participants to the latest expense", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payers: [{ member: 2 }],
          participants: [{ member: 2 }, { member: 3 }],
        },
        members,
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [2],
      participants: [2, 3],
    });
  });

  it("uses payer_ids and participant_ids when relation rows are missing", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payer_ids: [3],
          participant_ids: [1, 3],
        },
        members,
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [3],
      participants: [1, 3],
    });
  });

  it("falls back to the current member when no latest expense exists", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: null,
        members,
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [1],
      participants: [1],
    });
  });

  it("returns empty selections when no latest expense and no current member", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: undefined,
        members,
        currentMemberId: null,
      }),
    ).toEqual({
      payers: [],
      participants: [],
    });
  });

  it("falls back to the current member when the latest buyer no longer exists", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payers: [{ member: 99 }],
          participants: [{ member: 2 }, { member: 3 }],
        },
        members,
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [1],
      participants: [2, 3],
    });
  });

  it("drops participants who are no longer group members", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payers: [{ member: 2 }],
          participants: [{ member: 2 }, { member: 99 }, { member: 3 }],
        },
        members,
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [2],
      participants: [2, 3],
    });
  });

  it("falls back to the current member when every latest participant is gone", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payers: [{ member: 2 }],
          participants: [{ member: 99 }, { member: 100 }],
        },
        members,
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [2],
      participants: [1],
    });
  });

  it("returns empty buyer and participants when latest people and current member are gone", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payers: [{ member: 99 }],
          participants: [{ member: 100 }],
        },
        members,
        currentMemberId: 42,
      }),
    ).toEqual({
      payers: [],
      participants: [],
    });
  });

  it("does not use a current member who is no longer in the group", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: null,
        members,
        currentMemberId: 42,
      }),
    ).toEqual({
      payers: [],
      participants: [],
    });
  });

  it("returns empty selections when the group has no members", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payers: [{ member: 1 }],
          participants: [{ member: 1 }, { member: 2 }],
        },
        members: [],
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [],
      participants: [],
    });
  });

  it("keeps latest expense people even if the current member was not among them", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payers: [{ member: 3 }],
          participants: [{ member: 2 }],
        },
        members,
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [3],
      participants: [2],
    });
  });

  it("falls back when the latest expense has no remaining payers or participants", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payers: [],
          participants: [],
        },
        members,
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [1],
      participants: [1],
    });
  });

  it("keeps remaining payers when only some latest buyers still exist", () => {
    expect(
      resolveExpenseFormDefaults({
        latestExpense: {
          payers: [{ member: 99 }, { member: 3 }],
          participants: [{ member: 1 }, { member: 2 }],
        },
        members,
        currentMemberId: 1,
      }),
    ).toEqual({
      payers: [3],
      participants: [1, 2],
    });
  });
});
