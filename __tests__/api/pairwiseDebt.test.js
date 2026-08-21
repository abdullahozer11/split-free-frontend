import { pairwiseDebtOrFilter } from "@/src/api/debts/pairwise";

describe("pairwiseDebtOrFilter", () => {
  it("matches either borrower/lender direction in one or-filter", () => {
    expect(pairwiseDebtOrFilter(4, 7)).toBe(
      "and(borrower.eq.4,lender.eq.7),and(borrower.eq.7,lender.eq.4)",
    );
  });

  it("covers the swapped borrower/lender pair", () => {
    expect(pairwiseDebtOrFilter(7, 4)).toBe(
      "and(borrower.eq.7,lender.eq.4),and(borrower.eq.4,lender.eq.7)",
    );
  });
});
