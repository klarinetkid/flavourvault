# Phase 4 Database Migration Guide

## Overview
This migration adds tags and favourites functionality to the FlavourVault recipes table.

## What This Migration Does

### New Columns Added
- `tags` (TEXT[]): Array of tag strings, maximum 5 tags per recipe
- `is_favourite` (BOOLEAN): User-specific favourite status, defaults to FALSE

### Performance Optimizations
- GIN index on `tags` column for efficient array searches
- Index on `is_favourite` for favourite filtering
- GIN index on `ingredients` for ingredient searches

### Constraints Added
- Maximum 5 tags per recipe constraint
- Database function for retrieving user's unique tags

## How to Execute the Migration

### Option 1: Supabase Dashboard (Recommended)
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `phase4_migration.sql`
5. Click **Run** to execute the migration
6. Verify the migration completed successfully

### Option 2: Supabase CLI (Advanced)
```bash
# If you have Supabase CLI installed
supabase db reset --linked
# Then apply the migration through the dashboard
```

## Verification Steps

After running the migration, verify it worked correctly:

### 1. Check New Columns
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'recipes' 
AND column_name IN ('tags', 'is_favourite');
```

Expected result:
- `tags` column with type `ARRAY` and default `{}`
- `is_favourite` column with type `boolean` and default `false`

### 2. Check Indexes
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'recipes' 
AND indexname LIKE 'idx_recipes_%';
```

Expected indexes:
- `idx_recipes_tags`
- `idx_recipes_is_favourite` 
- `idx_recipes_ingredients`

### 3. Test the Function
```sql
SELECT get_user_tags('your-user-id-here');
```

Should return an empty array `{}` for new users.

### 4. Test Existing Data
```sql
SELECT id, name, tags, is_favourite 
FROM recipes 
LIMIT 5;
```

All existing recipes should have:
- `tags = {}`
- `is_favourite = false`

## Rollback Plan

If you need to rollback this migration:

```sql
-- Remove the function
DROP FUNCTION IF EXISTS get_user_tags(UUID);

-- Remove indexes
DROP INDEX IF EXISTS idx_recipes_tags;
DROP INDEX IF EXISTS idx_recipes_is_favourite;
DROP INDEX IF EXISTS idx_recipes_ingredients;

-- Remove columns (WARNING: This will delete data!)
ALTER TABLE public.recipes 
DROP COLUMN IF EXISTS tags,
DROP COLUMN IF EXISTS is_favourite;
```

## Safety Notes

- ✅ **Safe Migration**: This migration only adds columns with default values
- ✅ **No Data Loss**: Existing recipes remain unchanged
- ✅ **RLS Compatible**: Existing Row Level Security policies automatically apply
- ✅ **Performance**: Indexes are added for optimal query performance

## Troubleshooting

### Common Issues

**Permission Denied**
- Ensure you're using a database user with sufficient privileges
- Check that you're connected to the correct database

**Function Creation Failed**
- Verify the `authenticated` role exists in your database
- Check Supabase logs for detailed error messages

**Index Creation Failed**
- Ensure the table exists and has data
- Check for any conflicting index names

## Next Steps

After successful migration:
1. Update your TypeScript interfaces
2. Test the application to ensure existing functionality works
3. Begin implementing the new features

## Support

If you encounter issues:
1. Check the Supabase dashboard logs
2. Verify your database connection
3. Review the error messages carefully
4. Consider running the verification queries above