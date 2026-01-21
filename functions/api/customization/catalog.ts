/**
 * Customization Catalog API
 * GET /api/customization/catalog
 *
 * Returns all purchasable customization items grouped by category.
 */

interface Env {
  DB: D1Database;
}

interface CatalogItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price_oranges: number;
  css_class: string | null;
  css_value: string | null;
  sort_order: number;
}

interface CatalogResponse {
  categories: {
    [key: string]: {
      label: string;
      items: CatalogItem[];
    };
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  font_color: 'Font Color',
  font_style: 'Font Style',
  font_family: 'Font Family',
  page_background: 'Background',
  avatar_glow: 'Avatar Glow',
  avatar_size: 'Avatar Size',
  bigpulp_position: 'BigPulp Position',
  dialogue_style: 'Dialogue Style',
  collection_layout: 'Collection Layout',
  card_style: 'Card Style',
  entrance_animation: 'Entrance Animation',
  visitor_counter_style: 'Visitor Counter',
  stats_style: 'Stats Style',
  category_tabs_style: 'Category Tabs',
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(`
      SELECT id, category, name, description, price_oranges, css_class, css_value, sort_order
      FROM customization_catalog
      WHERE is_active = 1
      ORDER BY category, sort_order
    `).all<CatalogItem>();

    // Group by category
    const categories: CatalogResponse['categories'] = {};

    for (const item of results) {
      if (!categories[item.category]) {
        categories[item.category] = {
          label: CATEGORY_LABELS[item.category] || item.category,
          items: [],
        };
      }
      categories[item.category].items.push(item);
    }

    return new Response(JSON.stringify({ categories }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Customization Catalog] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch catalog' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
