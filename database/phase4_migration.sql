-- FlavourVault Phase 4 Database Migration
-- Add tags and favourites functionality to recipes table

-- Step 1: Add new columns
ALTER TABLE public.recipes 
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN is_favourite BOOLEAN DEFAULT FALSE;

-- Step 2: Create indexes for performance
CREATE INDEX idx_recipes_tags ON public.recipes USING GIN(tags);
CREATE INDEX idx_recipes_is_favourite ON public.recipes(is_favourite);
CREATE INDEX idx_recipes_ingredients ON public.recipes USING GIN(ingredients);

-- Step 3: Verify RLS policies (existing policies automatically apply to new columns)
-- No additional RLS policies needed as the existing user_id-based policies cover new columns

-- Step 4: Add constraints
ALTER TABLE public.recipes 
ADD CONSTRAINT check_tags_limit CHECK (array_length(tags, 1) <= 5 OR tags = '{}');

-- Step 5: Create function to get all unique tags for autocomplete
CREATE OR REPLACE FUNCTION get_user_tags(user_uuid UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN (
    SELECT ARRAY(
      SELECT DISTINCT unnest(tags)
      FROM public.recipes 
      WHERE user_id = user_uuid 
      AND tags IS NOT NULL 
      AND array_length(tags, 1) > 0
      ORDER BY unnest(tags)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Grant execute permission on function
GRANT EXECUTE ON FUNCTION get_user_tags(UUID) TO authenticated;

-- Step 7: Update existing recipes to have default values (already handled by DEFAULT clauses)
-- All existing recipes will automatically have tags = '{}' and is_favourite = FALSE

-- Verification queries (run these to verify the migration worked)
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'recipes';
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'recipes';