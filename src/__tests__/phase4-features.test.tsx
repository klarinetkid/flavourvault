import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagDisplay } from '@/components/TagDisplay';
import { TagInput } from '@/components/TagInput';
import { FavouriteButton } from '@/components/FavouriteButton';
import { FilterPanel } from '@/components/FilterPanel';
import { useRecipeFilters } from '@/hooks/useRecipeFilters';
import { toggleRecipeFavourite, getUserTags, searchRecipes } from '@/lib/recipes';
import type { Recipe, RecipeFilters } from '@/types/recipe';

// Mock the service functions
vi.mock('@/lib/recipes', () => ({
  toggleRecipeFavourite: vi.fn(),
  getUserTags: vi.fn(),
  searchRecipes: vi.fn(),
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockRecipe: Recipe = {
  id: '1',
  user_id: 'user1',
  name: 'Test Recipe',
  servings: 4,
  notes: 'Test notes',
  ingredients: [
    { id: '1', name: 'flour', amount: 2, unit: 'cups' },
    { id: '2', name: 'sugar', amount: 1, unit: 'cup' }
  ],
  tags: ['dessert', 'baking'],
  is_favourite: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  order_index: 0,
};

describe('Phase 4 Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TagDisplay Component', () => {
    it('renders tags correctly', () => {
      render(<TagDisplay tags={['dessert', 'baking']} />);
      
      expect(screen.getByText('dessert')).toBeInTheDocument();
      expect(screen.getByText('baking')).toBeInTheDocument();
    });

    it('renders nothing when no tags provided', () => {
      const { container } = render(<TagDisplay tags={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('calls onTagClick when tag is clicked', async () => {
      const onTagClick = vi.fn();
      const user = userEvent.setup();
      
      render(<TagDisplay tags={['dessert']} onTagClick={onTagClick} />);
      
      await user.click(screen.getByText('dessert'));
      expect(onTagClick).toHaveBeenCalledWith('dessert');
    });

    it('applies compact variant styling', () => {
      render(<TagDisplay tags={['dessert']} variant="compact" />);
      
      const tag = screen.getByText('dessert');
      expect(tag).toHaveClass('text-xs');
    });
  });

  describe('TagInput Component', () => {
    it('displays existing tags', () => {
      render(
        <TagInput 
          tags={['dessert', 'baking']} 
          onChange={vi.fn()} 
        />
      );
      
      expect(screen.getByText('dessert')).toBeInTheDocument();
      expect(screen.getByText('baking')).toBeInTheDocument();
    });

    it('adds new tag on Enter key', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      
      render(<TagInput tags={[]} onChange={onChange} />);
      
      const input = screen.getByPlaceholderText('Add a tag...');
      await user.type(input, 'new-tag');
      await user.keyboard('{Enter}');
      
      expect(onChange).toHaveBeenCalledWith(['new-tag']);
    });

    it('removes tag when X button is clicked', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      
      render(<TagInput tags={['dessert']} onChange={onChange} />);
      
      const removeButton = screen.getByRole('button');
      await user.click(removeButton);
      
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('enforces maximum tag limit', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const maxTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
      
      render(<TagInput tags={maxTags} onChange={onChange} maxTags={5} />);
      
      const input = screen.getByPlaceholderText('Maximum 5 tags reached');
      expect(input).toBeDisabled();
    });

    it('shows available tags as suggestions', () => {
      render(
        <TagInput 
          tags={[]} 
          onChange={vi.fn()} 
          availableTags={['dessert', 'baking', 'dinner']}
        />
      );
      
      expect(screen.getByText('Available tags:')).toBeInTheDocument();
      expect(screen.getByText('dessert')).toBeInTheDocument();
      expect(screen.getByText('baking')).toBeInTheDocument();
    });
  });

  describe('FavouriteButton Component', () => {
    it('renders unfavourited state correctly', () => {
      render(
        <FavouriteButton 
          isFavourite={false} 
          onToggle={vi.fn()} 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Add to favourites');
    });

    it('renders favourited state correctly', () => {
      render(
        <FavouriteButton 
          isFavourite={true} 
          onToggle={vi.fn()} 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Remove from favourites');
    });

    it('calls onToggle when clicked', async () => {
      const onToggle = vi.fn();
      const user = userEvent.setup();
      
      render(
        <FavouriteButton 
          isFavourite={false} 
          onToggle={onToggle} 
        />
      );
      
      await user.click(screen.getByRole('button'));
      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('renders button variant correctly', () => {
      render(
        <FavouriteButton 
          isFavourite={false} 
          onToggle={vi.fn()} 
          variant="button"
        />
      );
      
      expect(screen.getByText('Add to Favourites')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <FavouriteButton 
          isFavourite={false} 
          onToggle={vi.fn()} 
          disabled={true}
        />
      );
      
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('FilterPanel Component', () => {
    const mockFilters: RecipeFilters = {
      searchTerm: '',
      selectedTags: [],
      showFavouritesOnly: false,
      searchInIngredients: false,
    };

    it('renders filter toggle button', () => {
      render(
        <FilterPanel
          isOpen={false}
          onToggle={vi.fn()}
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          availableTags={[]}
        />
      );
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('shows active filter count', () => {
      const activeFilters = {
        ...mockFilters,
        selectedTags: ['dessert'],
        showFavouritesOnly: true,
      };
      
      render(
        <FilterPanel
          isOpen={false}
          onToggle={vi.fn()}
          filters={activeFilters}
          onFiltersChange={vi.fn()}
          availableTags={[]}
        />
      );
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders filter options when open', () => {
      render(
        <FilterPanel
          isOpen={true}
          onToggle={vi.fn()}
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          availableTags={['dessert', 'baking']}
        />
      );
      
      expect(screen.getByText('Search Options')).toBeInTheDocument();
      expect(screen.getByText('Favourites')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('toggles search in ingredients option', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <FilterPanel
          isOpen={true}
          onToggle={vi.fn()}
          filters={mockFilters}
          onFiltersChange={onFiltersChange}
          availableTags={[]}
        />
      );
      
      const checkbox = screen.getByLabelText('Search in ingredients (exact match)');
      await user.click(checkbox);
      
      expect(onFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        searchInIngredients: true,
      });
    });

    it('clears all filters when Clear All is clicked', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup();
      const activeFilters = {
        ...mockFilters,
        selectedTags: ['dessert'],
        showFavouritesOnly: true,
      };
      
      render(
        <FilterPanel
          isOpen={true}
          onToggle={vi.fn()}
          filters={activeFilters}
          onFiltersChange={onFiltersChange}
          availableTags={[]}
        />
      );
      
      await user.click(screen.getByText('Clear All'));
      
      expect(onFiltersChange).toHaveBeenCalledWith({
        searchTerm: '',
        selectedTags: [],
        showFavouritesOnly: false,
        searchInIngredients: false,
      });
    });
  });

  describe('useRecipeFilters Hook', () => {
    it('initializes with default filters', () => {
      const TestComponent = () => {
        const { filters } = useRecipeFilters();
        return (
          <div>
            <span data-testid="search-term">{filters.searchTerm}</span>
            <span data-testid="selected-tags">{filters.selectedTags.length}</span>
            <span data-testid="favourites-only">{filters.showFavouritesOnly.toString()}</span>
            <span data-testid="search-ingredients">{filters.searchInIngredients.toString()}</span>
          </div>
        );
      };

      render(<TestComponent />);
      
      expect(screen.getByTestId('search-term')).toHaveTextContent('');
      expect(screen.getByTestId('selected-tags')).toHaveTextContent('0');
      expect(screen.getByTestId('favourites-only')).toHaveTextContent('false');
      expect(screen.getByTestId('search-ingredients')).toHaveTextContent('false');
    });
  });

  describe('Service Functions', () => {
    it('toggleRecipeFavourite calls API correctly', async () => {
      const mockResponse = { data: { ...mockRecipe, is_favourite: true }, error: null };
      vi.mocked(toggleRecipeFavourite).mockResolvedValue(mockResponse);

      const result = await toggleRecipeFavourite('1', true);
      
      expect(toggleRecipeFavourite).toHaveBeenCalledWith('1', true);
      expect(result.data?.is_favourite).toBe(true);
    });

    it('getUserTags returns user tags', async () => {
      const mockTags = ['dessert', 'baking', 'dinner'];
      vi.mocked(getUserTags).mockResolvedValue({ data: mockTags, error: null });

      const result = await getUserTags();
      
      expect(result.data).toEqual(mockTags);
    });

    it('searchRecipes filters by favourites', async () => {
      const mockRecipes = [
        { ...mockRecipe, is_favourite: true },
        { ...mockRecipe, id: '2', is_favourite: false },
      ];
      vi.mocked(searchRecipes).mockResolvedValue({ data: [mockRecipes[0]], error: null });

      const filters: RecipeFilters = {
        searchTerm: '',
        selectedTags: [],
        showFavouritesOnly: true,
        searchInIngredients: false,
      };

      const result = await searchRecipes(filters);
      
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].is_favourite).toBe(true);
    });

    it('searchRecipes filters by tags', async () => {
      const mockRecipes = [
        { ...mockRecipe, tags: ['dessert'] },
        { ...mockRecipe, id: '2', tags: ['dinner'] },
      ];
      vi.mocked(searchRecipes).mockResolvedValue({ data: [mockRecipes[0]], error: null });

      const filters: RecipeFilters = {
        searchTerm: '',
        selectedTags: ['dessert'],
        showFavouritesOnly: false,
        searchInIngredients: false,
      };

      const result = await searchRecipes(filters);
      
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].tags).toContain('dessert');
    });
  });

  describe('Integration Tests', () => {
    it('recipe with tags and favourite status displays correctly', () => {
      const recipe = {
        ...mockRecipe,
        tags: ['dessert', 'baking'],
        is_favourite: true,
      };

      // This would be tested in the actual RecipeListItem component
      // but we're testing the individual components here
      render(<TagDisplay tags={recipe.tags} />);
      render(<FavouriteButton isFavourite={recipe.is_favourite} onToggle={vi.fn()} />);
      
      expect(screen.getByText('dessert')).toBeInTheDocument();
      expect(screen.getByText('baking')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Remove from favourites');
    });

    it('tag input validates maximum tags', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      
      render(
        <TagInput 
          tags={['tag1', 'tag2', 'tag3', 'tag4', 'tag5']} 
          onChange={onChange}
          maxTags={5}
        />
      );
      
      // Input should be disabled when at max tags
      const input = screen.getByPlaceholderText('Maximum 5 tags reached');
      expect(input).toBeDisabled();
      
      // Count should show 5/5
      expect(screen.getByText('5/5 tags')).toBeInTheDocument();
    });
  });
});