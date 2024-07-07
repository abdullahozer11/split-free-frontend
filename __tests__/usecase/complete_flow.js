const { supabase } = require("../../jest.setup");

// Mock data for test
const email = "jest@splitfree.xyz";
const password = "jestjest";
let groupId = 0;
let expenseId = 0;
let expenseId2 = 0;
let memberId = 0;
let group = null;
let Alice = null;
let Michael = null;
let John = null;

describe("Flow complete", () => {
  test("should create new user", async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    expect(error).toBeNull();
  });

  test("user session should exist", async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.session).toBeDefined();
      expect(data.session.access_token).toBeDefined();
      expect(data.session.refresh_token).toBeDefined();
    } catch (error) {
      console.error("Error getting session:", error.message);
    }
  });

  test("should sign out successfully after signing up", async () => {
    try {
      const { error } = await supabase.auth.signOut();
      expect(error).toBeNull();
      const { data, error: error2 } = await supabase.auth.getSession();
      expect(error2).toBeNull();
      expect(data.session).toBeNull();
    } catch (error) {
      console.error("Error signing out:", error.message);
      throw error;
    }
  });

  test("user session should not exist", async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      expect(error).toBeNull();
      expect(data).toBeNull();
    } catch (error) {
      console.error("Error getting session:", error.message);
    }
  });

  test("should sign in successfully with correct credentials", async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.session).toBeDefined();
      expect(data.session.access_token).toBeDefined();
      expect(data.session.refresh_token).toBeDefined();
    } catch (error) {
      console.error("Error signing in:", error.message);
      throw error;
    }
  });

  test("should create a group", async () => {
    const member_names = ["Alice", "Michael", "John"];
    const title = "Holidays";
    try {
      const { data: _groupId, error } = await supabase.rpc("create_group", {
        member_names_input: member_names,
        title_input: title,
      });
      expect(error).toBeNull();
      expect(_groupId).toBeDefined();
      groupId = _groupId;
    } catch (error) {
      console.error("Error creating group:", error.message);
      throw error;
    }
  });

  test("should add members to group", async () => {
    try {
      const { data: newMember, error } = await supabase
        .from("members")
        .insert({
          name: "Alice",
          group_id: groupId,
        })
        .select()
        .single();
      expect(error).toBeNull();
      expect(newMember).toBeDefined();
      expect(newMember.id).toBeDefined();
      memberId = newMember.id;
    } catch (error) {
      console.error("Error adding members:", error.message);
      throw error;
    }
  });

  test("should remove member from the group", async () => {
    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", memberId);
      expect(error).toBeNull();
    } catch (error) {
      console.error("Error removing member:", error.message);
      throw error;
    }
  });

  test("should fetch groups", async () => {
    try {
      const { data: groups, error } = await supabase
        .from("groups")
        .select()
        .order("id", { ascending: true });
      expect(error).toBeNull();
      expect(groups).toBeDefined();
      expect(Array.isArray(groups)).toBeTruthy();
      expect(groups.length).toBeGreaterThan(0);
      expect(groups.length).toStrictEqual(1);
      const insertedGroup = groups[0];
      expect(insertedGroup.id).toBe(groupId);
      expect(insertedGroup.title).toBe("Holidays");
      expect(insertedGroup.settled).toBe(true);
      expect(insertedGroup.description).toBe(null);
      expect(insertedGroup.expense_total).toEqual(0);
    } catch (error) {
      console.error("Error fetching groups:", error.message);
      throw error;
    }
  });

  test("should fetch a group with details", async () => {
    try {
      const { data: _Group, error } = await supabase
        .from("groups")
        .select(
          "id, owner, title, expense_total, members(id, name, role, total_balance, profile(id, avatar_url)), debts(id, amount, borrower, lender)",
        )
        .eq("id", groupId)
        .single();
      expect(error).toBeNull();
      group = _Group;
      Alice = group.members[0].id;
      Michael = group.members[1].id;
      John = group.members[2].id;
      expect(group).toBeDefined();
      expect(group.id).toBe(groupId);
      expect(group.members.length).toEqual(3);
      expect(group.debts.length).toEqual(0);
    } catch (error) {
      console.error("Error fetching group with details:", error.message);
      throw error;
    }
  });

  test("should create expenses", async () => {
    try {
      const { data: newExpenseID, error } = await supabase.rpc(
        "create_expense",
        {
          amount_input: 30,
          currency_input: "EUR",
          date_input: new Date(),
          category_input: "Shopping",
          description_input: "",
          group_id_input: groupId,
          participants_input: [Alice, Michael],
          payers_input: [John],
          proof_input: "",
          title_input: "Bowling",
        },
      );
      expect(error).toBeNull();
      expect(newExpenseID).toBeDefined();
      expect(newExpenseID).toBeGreaterThan(0);
      expenseId = newExpenseID;
      const { data: newExpenseID2, error: error2 } = await supabase.rpc(
        "create_expense",
        {
          amount_input: 90,
          currency_input: "EUR",
          date_input: new Date(),
          category_input: "Entertainment",
          description_input: "",
          group_id_input: groupId,
          participants_input: [Alice, Michael, John],
          payers_input: [Alice],
          proof_input: "",
          title_input: "Ski trip",
        },
      );
      expect(error2).toBeNull();
      expect(newExpenseID2).toBeDefined();
      expect(newExpenseID2).toBeGreaterThan(0);
      expenseId2 = newExpenseID2;
    } catch (error) {
      console.error("Error creating expenses:", error.message);
      throw error;
    }
  });

  test("group settled status changes after inserting an expense", async () => {
    try {
      const { data: group, error } = await supabase
        .from("groups")
        .select()
        .eq("id", groupId)
        .single();
      expect(error).toBeNull();
      expect(group).toBeDefined();
      expect(group.settled).toBeFalsy();
    } catch (error) {
      console.error("Error setting group settled status:", error.message);
    }
  });

  test("should fetch expenses for a group", async () => {
    try {
      const { data: expenses, error } = await supabase
        .from("expenses")
        .select()
        .eq("group_id", groupId);
      expect(error).toBeNull();
      expect(expenses).toBeDefined();
      expect(Array.isArray(expenses)).toBeTruthy();
      expect(expenses.length).toBeGreaterThan(0);
    } catch (error) {
      console.error("Error fetching expenses:", error.message);
      throw error;
    }
  });

  test("should fetch debts_per_expense for a group", async () => {
    try {
      const { data: debts_per_expense, error } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(4);
      expect(
        debts_per_expense.find(
          (db) => db.lender === John && db.borrower === Michael,
        ).amount,
      ).toEqual(15);
      expect(
        debts_per_expense.find(
          (db) => db.lender === John && db.borrower === Alice,
        ).amount,
      ).toEqual(15);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === Michael,
        ).amount,
      ).toEqual(30);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(30);
    } catch (error) {
      console.error("Error fetching debts_per_expense:", error.message);
      throw error;
    }
  });

  test("should fetch debts for a group", async () => {
    try {
      const { data: debts, error } = await supabase
        .from("debts")
        .select("amount, lender, borrower, group_id")
        .eq("group_id", groupId);
      expect(error).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toEqual(3);
      expect(
        debts.find((db) => db.lender === Alice && db.borrower === John).amount,
      ).toEqual(15);
      expect(
        debts.find((db) => db.lender === Alice && db.borrower === Michael)
          .amount,
      ).toEqual(30);
      expect(
        debts.find((db) => db.lender === John && db.borrower === Michael)
          .amount,
      ).toEqual(15);
      // any debt.amount cannot be negative
      const negativeDebts = debts.filter((debt) => debt.amount < 0);
      expect(negativeDebts.length).toBe(0);
    } catch (error) {
      console.error("Error fetching debts:", error.message);
      throw error;
    }
  });

  test("should fetch total balances for group members", async () => {
    try {
      const { data: members, error } = await supabase
        .from("members")
        .select("id, total_balance")
        .eq("group_id", groupId);
      expect(error).toBeNull();
      expect(members).toBeDefined();
      expect(Array.isArray(members)).toBeTruthy();
      expect(members.length).toEqual(3);
      const totalBalance = members.reduce(
        (sum, member) => sum + member.total_balance,
        0,
      );
      expect(totalBalance).toEqual(0);
      expect(members.find((mb) => mb.id === Alice).total_balance).toEqual(45);
      expect(members.find((mb) => mb.id === Michael).total_balance).toEqual(
        -45,
      );
      expect(members.find((mb) => mb.id === John).total_balance).toEqual(0);
    } catch (error) {
      console.error("Error fetching balances:", error.message);
      throw error;
    }
  });

  test("should fetch expense_total for a group", async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("expense_total")
        .eq("id", groupId)
        .single();
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.expense_total).toEqual(120);
    } catch (error) {
      console.error("Error fetching expense total:", error.message);
      throw error;
    }
  });

  test("should delete expense", async () => {
    try {
      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);
      expect(deleteError).toBeNull();
      const { error: fetchError } = await supabase
        .from("expenses")
        .select()
        .eq("id", expenseId)
        .single();
      expect(fetchError).toBeDefined();
      // debts per expense reflects the change
      const { data: debts_per_expense, error: error2 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error2).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(2);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === Michael,
        ).amount,
      ).toEqual(30);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(30);
      // debts reflects the change
      const { data: debts, error: error3 } = await supabase
        .from("debts")
        .select()
        .eq("group_id", groupId);
      expect(error3).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toEqual(2);
      expect(
        debts.find((db) => db.lender === Alice && db.borrower === Michael)
          .amount,
      ).toEqual(30);
      expect(
        debts.find((db) => db.lender === Alice && db.borrower === John).amount,
      ).toEqual(30);
    } catch (error) {
      console.error("Error deleting expense:", error.message);
      throw error;
    }
  });

  test("should update expense", async () => {
    try {
      const { error: updateError } = await supabase.rpc("update_expense", {
        expense_id: expenseId2,
        amount_input: 93,
      });
      expect(updateError).toBeNull();
      const { data, error: fetchError } = await supabase
        .from("expenses")
        .select()
        .eq("id", expenseId2)
        .single();
      expect(fetchError).toBeNull();
      expect(data).toBeDefined();
      expect(data.amount).toEqual(93);
      // debts per expense reflects the change
      const { data: debts_per_expense, error: error4 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error4).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(2);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === Michael,
        ).amount,
      ).toEqual(31);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(31);
    } catch (error) {
      console.error("Error updating expense:", error.message);
      throw error;
    }
  });

  test("should create a decimal amount expense", async () => {
    try {
      // delete existing expenses
      await supabase.from("expenses").delete().eq("group_id", groupId);
      const { data: expenseId, error } = await supabase.rpc("create_expense", {
        group_id_input: groupId,
        amount_input: 1.5,
        title_input: "Decimal expense",
        payers_input: [Alice],
        participants_input: [Alice, John],
      });
      expect(error).toBeNull();
      // fetch the expense
      const { data: expense, error: fetchError } = await supabase
        .from("expenses")
        .select()
        .eq("id", expenseId)
        .single();
      expect(fetchError).toBeNull();
      expect(expense).toBeDefined();
      expect(expense.amount).toEqual(1.5);
      // fetch debts per expense
      const { data: debts_per_expense, error: error2 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error2).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(1);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(0.75);
      // fetch debts
      const { data: debts, error: error3 } = await supabase
        .from("debts")
        .select()
        .eq("group_id", groupId);
      expect(error3).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toEqual(1);
      expect(
        debts.find((db) => db.lender === Alice && db.borrower === John).amount,
      ).toEqual(0.75);
    } catch (error) {
      console.error("Error creating decimal amount expense:", error.message);
      throw error;
    }
  });

  test("should create odd expense amount", async () => {
    try {
      // delete existing expenses
      await supabase.from("expenses").delete().eq("group_id", groupId);
      const { data: fetchedExpenseId, error } = await supabase.rpc(
        "create_expense",
        {
          group_id_input: groupId,
          amount_input: 1,
          title_input: "Non-even expense",
          payers_input: [Alice],
          participants_input: [Alice, John],
        },
      );
      expect(error).toBeNull();
      expenseId = fetchedExpenseId;
      // fetch debts_per_expense
      const { data: debts_per_expense, error: error2 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error2).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(1);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(0.5);
      // fetch debts
      const { data: debts, error: error3 } = await supabase
        .from("debts")
        .select()
        .eq("group_id", groupId);
      expect(error3).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toEqual(1);
      expect(
        debts.find((db) => db.lender === Alice && db.borrower === John).amount,
      ).toEqual(0.5);
    } catch (error) {
      console.error("Error creating non-even expense:", error.message);
      throw error;
    }
  });

  test("can update expense amount to decimal value", async () => {
    try {
      const { error } = await supabase.rpc("update_expense", {
        expense_id: expenseId,
        amount_input: 3.4,
      });
      expect(error).toBeNull();
      const { data: expense, error: fetchError } = await supabase
        .from("expenses")
        .select()
        .eq("id", expenseId)
        .single();
      expect(fetchError).toBeNull();
      expect(expense).toBeDefined();
      expect(expense.amount).toEqual(3.4);
      // fetch debts_per_expense
      const { data: debts_per_expense, error: error2 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error2).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(1);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(1.7);
    } catch (error) {
      console.error("Error updating expense amount to decimal:", error.message);
      throw error;
    }
  });

  test("settle as expense an check its impact", async () => {
    try {
      const { error } = await supabase.rpc("settle_expense", {
        expense_id: expenseId,
        _group_id: groupId,
      });
      expect(error).toBeNull();
      const { data: expense, error: fetchError } = await supabase
        .from("expenses")
        .select()
        .eq("id", expenseId)
        .single();
      expect(fetchError).toBeNull();
      expect(expense).toBeDefined();
      expect(expense.settled).toBeTruthy();
      // fetch debts_per_expense
      const { data: debts_per_expense, error: error2 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error2).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(0);
      // group is also settled
      const { data: group, error: error3 } = await supabase
        .from("groups")
        .select()
        .eq("id", groupId)
        .single();
      expect(error3).toBeNull();
      expect(group).toBeDefined();
      expect(group.settled).toBeTruthy();
    } catch (error) {
      console.error("Error creating non-even expense:", error.message);
      throw error;
    }
  });

  test("equal debts should cancel each other", async () => {
    try {
      const { error } = await supabase.rpc("create_expense", {
        group_id_input: groupId,
        amount_input: 64,
        title_input: "Equal debts",
        payers_input: [Alice],
        participants_input: [Alice, John],
      });
      expect(error).toBeNull();
      const { error: error2 } = await supabase.rpc("create_expense", {
        group_id_input: groupId,
        amount_input: 64,
        title_input: "Equal debts",
        payers_input: [John],
        participants_input: [Alice, John],
      });
      expect(error2).toBeNull();
      // fetch debts per expense
      const { data: debts_per_expense, error: error3 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error3).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(2);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(32);
      expect(
        debts_per_expense.find(
          (db) => db.lender === John && db.borrower === Alice,
        ).amount,
      ).toEqual(32);
      // fetch de2
      const { data: debts, error: error4 } = await supabase
        .from("debts")
        .select()
        .eq("group_id", groupId);
      expect(error4).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toEqual(0);
    } catch (error) {
      console.error("Error creating equal debts:", error.message);
      throw error;
    }
  });

  test("equal debts with odd amount should cancel each other", async () => {
    try {
      // delete old expenses
      const { error: error5 } = await supabase
        .from("expenses")
        .delete()
        .eq("group_id", groupId);
      expect(error5).toBeNull();
      const { error } = await supabase.rpc("create_expense", {
        group_id_input: groupId,
        amount_input: 63,
        title_input: "Equal debts",
        payers_input: [Alice],
        participants_input: [Alice, John],
      });
      expect(error).toBeNull();
      const { error: error2 } = await supabase.rpc("create_expense", {
        group_id_input: groupId,
        amount_input: 63,
        title_input: "Equal debts",
        payers_input: [John],
        participants_input: [Alice, John],
      });
      expect(error2).toBeNull();
      // fetch debts per expense
      const { data: debts_per_expense, error: error3 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error3).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(2);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(31.5);
      expect(
        debts_per_expense.find(
          (db) => db.lender === John && db.borrower === Alice,
        ).amount,
      ).toEqual(31.5);
      // fetch debts
      const { data: debts, error: error4 } = await supabase
        .from("debts")
        .select()
        .eq("group_id", groupId);
      expect(error4).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toEqual(0);
    } catch (error) {
      console.error("Error creating equal debts:", error.message);
      throw error;
    }
  });

  test("bigger second debt overrides the firsts amount", async () => {
    try {
      // delete old expenses
      const { error: error5 } = await supabase
        .from("expenses")
        .delete()
        .eq("group_id", groupId);
      expect(error5).toBeNull();
      const { error } = await supabase.rpc("create_expense", {
        group_id_input: groupId,
        amount_input: 60,
        title_input: "Equal debts",
        payers_input: [Alice],
        participants_input: [Alice, John],
      });
      expect(error).toBeNull();
      const { error: error2 } = await supabase.rpc("create_expense", {
        group_id_input: groupId,
        amount_input: 64,
        title_input: "Equal debts",
        payers_input: [John],
        participants_input: [Alice, John],
      });
      expect(error2).toBeNull();
      // fetch debts per expense
      const { data: debts_per_expense, error: error3 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error3).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(2);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(30);
      expect(
        debts_per_expense.find(
          (db) => db.lender === John && db.borrower === Alice,
        ).amount,
      ).toEqual(32);
      // fetch debts
      const { data: debts, error: error4 } = await supabase
        .from("debts")
        .select()
        .eq("group_id", groupId);
      expect(error4).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toEqual(1);
      expect(
        debts.find((db) => db.lender === John && db.borrower === Alice).amount,
      ).toEqual(2);
    } catch (error) {
      console.error("Error creating equal debts:", error.message);
      throw error;
    }
  });

  test("should round up digits after 2 digits after comma", async () => {
    try {
      // delete existing expenses
      const { error: error5 } = await supabase
        .from("expenses")
        .delete()
        .eq("group_id", groupId);
      expect(error5).toBeNull();
      const { data: fetchedExpenseId, error } = await supabase.rpc(
        "create_expense",
        {
          group_id_input: groupId,
          amount_input: 1.001,
          title_input: "Round up digits",
          payers_input: [Alice],
          participants_input: [Alice, John, Michael],
        },
      );
      expect(error).toBeNull();
      // fetch the expense
      const { data: expense, error: fetchError } = await supabase
        .from("expenses")
        .select()
        .eq("id", fetchedExpenseId)
        .single();
      expect(fetchError).toBeNull();
      expect(expense).toBeDefined();
      expect(expense.amount).toEqual(1.0);
      // try to update to a three digit decimal
      const { error: updateError } = await supabase.rpc("update_expense", {
        expense_id: fetchedExpenseId,
        amount_input: 1.002,
      });
      expect(updateError).toBeNull();
      // fetch the updated expense
      const { data: updatedExpense, error: fetchUpdatedError } = await supabase
        .from("expenses")
        .select()
        .eq("id", fetchedExpenseId)
        .single();
      expect(fetchUpdatedError).toBeNull();
      expect(updatedExpense).toBeDefined();
      expect(updatedExpense.amount).toEqual(1.0);
      // fetch debts per expense
      const { data: debts_per_expense, error: error2 } = await supabase
        .from("debts_per_expense")
        .select()
        .eq("group_id", groupId);
      expect(error2).toBeNull();
      expect(debts_per_expense).toBeDefined();
      expect(Array.isArray(debts_per_expense)).toBeTruthy();
      expect(debts_per_expense.length).toEqual(2);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === John,
        ).amount,
      ).toEqual(0.33);
      expect(
        debts_per_expense.find(
          (db) => db.lender === Alice && db.borrower === Michael,
        ).amount,
      ).toEqual(0.33);
      // fetch debts
      const { data: debts, error: error3 } = await supabase
        .from("debts")
        .select()
        .eq("group_id", groupId);
      expect(error3).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toEqual(2);
      expect(
        debts.find((db) => db.lender === Alice && db.borrower === John).amount,
      ).toEqual(0.33);
      expect(
        debts.find((db) => db.lender === Alice && db.borrower === Michael)
          .amount,
      ).toEqual(0.33);
    } catch (error) {
      console.error("Error creating round up digits:", error.message);
      throw error;
    }
  });

  test("should delete a group", async () => {
    try {
      const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);
      expect(error).toBeNull();
      const { error: fetchError } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);
      expect(fetchError).toBeNull();
    } catch (error) {
      console.error("Error deleting group:", error.message);
      throw error;
    }
  });

  test("user can delete itself", async () => {
    try {
      await supabase.auth.signInWithPassword({ email, password });
      const { data, error: error3 } = await supabase.auth.getSession();
      expect(error3).toBeNull();
      expect(data).toBeDefined();
      expect(data.session.access_token).toBeDefined();
      expect(data.session.refresh_token).toBeDefined();
      const { error } = await supabase.rpc("deleteuser");
      expect(error).toBeNull();
      const { data: data2, error: error2 } = await supabase.auth.getSession();
      expect(error2).toBeNull();
      expect(data2).toBeNull();
    } catch (error) {
      console.error("Error getting session:", error.message);
    }
  });
});
