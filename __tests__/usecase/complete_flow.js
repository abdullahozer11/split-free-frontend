const { supabase } = require('../../jest.setup');

// Mock data for test
const email = 'jest@splitfree.xyz';
const password = 'jestjest';
let groupId = 0;
let memberId = 0;
let group = null;

describe('Flow complete', () => {

  test('should create new user', async () => {
    const {error} = await supabase.auth.signUp({email, password});
    expect(error).toBeNull();
  })

  test('user session should exist', async () => {
    try {
      const {data, error} = await supabase.auth.getSession();
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.session).toBeDefined();
      expect(data.session.access_token).toBeDefined();
      expect(data.session.refresh_token).toBeDefined();
    } catch (error) {
      console.error('Error getting session:', error.message);
    }
  })

  test('should sign out successfully after signing up', async () => {
    try {
      const { error } = await supabase.auth.signOut();
      expect(error).toBeNull();
      const {data, error: error2} = await supabase.auth.getSession();
      expect(error2).toBeNull();
      expect(data.session).toBeNull();
    } catch (error) {
      console.error('Error signing out:', error.message);
      throw error;
    }
  });

  test('user session should not exist', async () => {
    try {
      const {data, error} = await supabase.auth.getSession();
      expect(error).toBeNull();
      expect(data).toBeNull();
    } catch (error) {
      console.error('Error getting session:', error.message);
    }
  })

  test('should sign in successfully with correct credentials', async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.session).toBeDefined();
      expect(data.session.access_token).toBeDefined();
      expect(data.session.refresh_token).toBeDefined();
    } catch (error) {
      console.error('Error signing in:', error.message);
      throw error;
    }
  });

  test('should create a group', async () => {
    const member_names = ['Owner', 'Michael', 'John']
    const title = 'Holidays'
    try {
      const {data: _groupId, error} = await supabase
        .rpc('create_group', {
          member_names_input: member_names,
          title_input: title
        });
      expect(error).toBeNull();
      expect(_groupId).toBeDefined();
      groupId = _groupId;
    } catch (error) {
      console.error('Error creating group:', error.message);
      throw error;
    }
  })

  test('should add members to group', async () => {
    try {
      const {data: newMember, error} = await supabase
        .from('members')
        .insert({
          name: 'Alice',
          group_id: groupId
        })
        .select()
        .single();
      expect(error).toBeNull();
      expect(newMember).toBeDefined();
      expect(newMember.id).toBeDefined();
      memberId = newMember.id;
    } catch (error) {
      console.error('Error adding members:', error.message);
      throw error;
    }
  })

  test('should remove member from the group', async() => {
    try {
      const {error} = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);
      expect(error).toBeNull();
    } catch (error) {
      console.error('Error removing member:', error.message);
      throw error;
    }
  });

  test('should fetch groups', async () => {
    try {
      const {data: groups, error} = await supabase
        .from('groups')
        .select()
       .order('id', { ascending: true });
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
      console.error('Error fetching groups:', error.message);
      throw error;
    }
  })

  test('should fetch a group with details', async () => {
    try {
      const {data: _Group, error} = await supabase
        .from('groups')
        .select('id, owner, title, expense_total, members(id, name, role, total_balance, profile(id, avatar_url)), debts(id, amount, borrower, lender)')
        .eq('id', groupId)
        .single();
      expect(error).toBeNull();
      group = _Group;
      expect(group).toBeDefined();
      expect(group.id).toBe(groupId);
      expect(group.members.length).toEqual(3);
      expect(group.debts.length).toEqual(0);
    } catch (error) {
      console.error('Error fetching group with details:', error.message);
      throw error;
    }
  })

  test('should create an expense', async () => {
    try {
      const {data: newExpenseID, error} = await supabase
        .rpc('create_expense', {
          amount_input: 30,
          currency_input: "EUR",
          date_input: new Date(),
          category_input: 'Shopping',
          description_input: '',
          group_id_input: groupId,
          participants_input: [group.members[0].id, group.members[1].id],
          payers_input: [group.members[2].id],
          proof_input: '',
          title_input: 'Bowling',
        });
      expect(error).toBeNull();
      expect(newExpenseID).toBeDefined();
      expect(newExpenseID).toBeGreaterThan(0);
    } catch (error) {
      console.error('Error creating expense:', error.message);
      throw error;
    }
  });

  test('should fetch expenses for a group', async () => {
    try {
      const {data: expenses, error} = await supabase
        .from('expenses')
        .select()
        .eq('group_id', groupId);
      expect(error).toBeNull();
      expect(expenses).toBeDefined();
      expect(Array.isArray(expenses)).toBeTruthy();
      expect(expenses.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Error fetching expenses:', error.message);
      throw error;
    }
  })

  test('should fetch balances for a group', async () => {
    try {
      const {data: balances, error} = await supabase
        .from('balances')
        .select()
        .eq('group_id', groupId);
      expect(error).toBeNull();
      expect(balances).toBeDefined();
      expect(Array.isArray(balances)).toBeTruthy();
      expect(balances.length).toBeGreaterThan(0);
      const totalBalance = balances.reduce((sum, balance) => sum + balance.amount, 0);
      expect(totalBalance).toEqual(0);
    } catch (error) {
      console.error('Error fetching balances:', error.message);
      throw error;
    }
  })

  test('should fetch debts for a group', async() => {
    try {
      const {data: debts, error} = await supabase
        .from('debts')
        .select()
        .eq('group_id', groupId);
      expect(error).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toBeGreaterThan(0);
      // any debt.amount cannot be negative
      const negativeDebts = debts.filter(debt => debt.amount < 0);
      expect(negativeDebts.length).toBe(0);
    } catch (error) {
      console.error('Error fetching debts:', error.message);
      throw error;
    }
  });

    test('should fetch simple debts for a group', async() => {
    try {
      const {data: debts, error} = await supabase
        .from('debts_simple')
        .select()
        .eq('group_id', groupId);
      expect(error).toBeNull();
      expect(debts).toBeDefined();
      expect(Array.isArray(debts)).toBeTruthy();
      expect(debts.length).toBeGreaterThan(0);
      const negativeDebts = debts.filter(debt => debt.amount < 0);
      expect(negativeDebts.length).toBe(0);
    } catch (error) {
      console.error('Error fetching debts:', error.message);
      throw error;
    }
  });

  test('should delete a group', async () => {
    try {
      const {error} = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
      expect(error).toBeNull();
      const {error: fetchError} = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
      expect(fetchError).toBeNull();
    } catch (error) {
      console.error('Error deleting group:', error.message);
      throw error;
    }
  })

  test('user can delete itself', async () => {
    try {
      await supabase.auth.signInWithPassword({ email, password });
      const {data, error: error3} = await supabase.auth.getSession();
      expect(error3).toBeNull();
      expect(data).toBeDefined();
      expect(data.session.access_token).toBeDefined();
      expect(data.session.refresh_token).toBeDefined();
      const {error} = await supabase.rpc('deleteuser');
      expect(error).toBeNull();
      const {data: data2, error: error2} = await supabase.auth.getSession();
      expect(error2).toBeNull();
      expect(data2).toBeNull();
    } catch (error) {
      console.error('Error getting session:', error.message);
    }
  })
});
