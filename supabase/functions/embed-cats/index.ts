// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Initialize Supabase client
const supabaseClient = createClient(
  'https://qpummxvizckytrrsiaig.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdW1teHZpemNreXRycnNpYWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI1NjgzMDgsImV4cCI6MjAyODE0NDMwOH0.DYJIU3x0pd5Ub6PDz1vlJCs07O9WFIXokQLD0By8HbQ'
);

const session = new Supabase.ai.Session('gte-small');

Deno.serve(async (req) => {
  try {
    // fetch expense_categories
    const { data: exp_cats, error } = await supabaseClient
      .from('expense_categories')
      .select('id, name, embedding');

    if (error) {
      throw new Error('Error fetching expense categories: ' + error.message);
    }

    // Define an array to collect all promises
    const promises = exp_cats.map(async (exp_cat) => {
      if (!exp_cat.embedding) {
        // Generate the embedding from the expense title
        const embedding = await session.run(exp_cat.name, {
          mean_pool: true,
          normalize: true,
        });

        // Update the embedding in the database
        const { error } = await supabaseClient
          .from('expense_categories')
          .update({ 'embedding': embedding })
          .eq('id', exp_cat.id);

        if (error) {
          throw new Error('Error setting expense category defaults: ' + error.message);
        }
      }
    });

    await Promise.all(promises);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({error: error.message}), {
      headers: {'Content-Type': 'application/json'},
    });
  }
});
