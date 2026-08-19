export type MemberLike = {
  id: number;
};

export type ExpenseLike = {
  payers?: unknown;
  participants?: unknown;
  payer_ids?: unknown;
  participant_ids?: unknown;
} | null;

type ResolveDefaultsArgs = {
  latestExpense: ExpenseLike | undefined;
  members: MemberLike[] | null | undefined;
  currentMemberId?: number | null;
};

function coerceMemberId(entry: unknown): number | null {
  if (typeof entry === "number" && Number.isFinite(entry)) {
    return entry;
  }

  if (typeof entry === "string" && entry.trim() !== "") {
    const parsed = Number(entry);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (entry && typeof entry === "object") {
    const obj = entry as Record<string, unknown>;

    if (typeof obj.member === "number" && Number.isFinite(obj.member)) {
      return obj.member;
    }

    if (typeof obj.id === "number" && Number.isFinite(obj.id)) {
      return obj.id;
    }

    if (obj.member && typeof obj.member === "object") {
      const nested = obj.member as Record<string, unknown>;
      if (typeof nested.id === "number" && Number.isFinite(nested.id)) {
        return nested.id;
      }
    }
  }

  return null;
}

export function extractMemberIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    const singleId = coerceMemberId(value);
    return singleId == null ? [] : [singleId];
  }

  const ids: number[] = [];
  for (const entry of value) {
    const id = coerceMemberId(entry);
    if (id != null && !ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

export function resolveExpenseFormDefaults({
  latestExpense,
  members,
  currentMemberId,
}: ResolveDefaultsArgs): { payers: number[]; participants: number[] } {
  const memberIds = new Set((members ?? []).map((member) => member.id));
  const fallbackMemberId =
    currentMemberId != null && memberIds.has(currentMemberId)
      ? currentMemberId
      : null;
  const fallback = fallbackMemberId != null ? [fallbackMemberId] : [];

  if (!latestExpense) {
    return {
      payers: fallback,
      participants: fallback,
    };
  }

  const validPayers = extractMemberIds(
    latestExpense.payers ?? latestExpense.payer_ids,
  ).filter((id) => memberIds.has(id));

  const validParticipants = extractMemberIds(
    latestExpense.participants ?? latestExpense.participant_ids,
  ).filter((id) => memberIds.has(id));

  return {
    payers: validPayers.length > 0 ? validPayers : fallback,
    participants: validParticipants.length > 0 ? validParticipants : fallback,
  };
}
