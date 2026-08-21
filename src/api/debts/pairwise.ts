/** PostgREST `or` matching the one debts row between two members, either way. */
export const pairwiseDebtOrFilter = (
  memberId: number,
  profileMemberId: number,
) =>
  `and(borrower.eq.${memberId},lender.eq.${profileMemberId}),and(borrower.eq.${profileMemberId},lender.eq.${memberId})`;
