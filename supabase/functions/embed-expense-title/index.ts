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
    // Extract the expense data from the request
    const {title} = await req.json();

    // Generate the embedding from the expense title
    const embedding = await session.run(title, {
      mean_pool: true,
      normalize: true,
    });

    // Fetch all embeddings from the expense_categories table
    const {data, error} = await supabaseClient
      .rpc('get_category_with_embedding', {
        query_embedding: embedding
      });

    if (error) {
      throw new Error('Error setting expense category: ' + error.message);
    }

    return new Response(JSON.stringify({success: true, name: data}), {
      headers: {'Content-Type': 'application/json'},
    });
  } catch (error) {
    return new Response(JSON.stringify({error: error.message}), {
      headers: {'Content-Type': 'application/json'},
    });
  }
});
