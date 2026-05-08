# Texture Category Sidebar + Pagination — Design Spec

**Date:** 2026-05-08  
**Scope:** `src/components/admin/AdminTextures.tsx`

---

## Problem

The admin texture list is a single flat grid that grows unbounded. With many textures,
the user must scroll far to find textures in a specific category. There is no way to
jump directly to a category.

## Solution

Add a **category sidebar** on the left and **page-based pagination** (18 per page) on
the right, all client-side using the already-loaded texture list.

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Halı dokuları                          [+ Yeni doku]   │
├─────────────┬───────────────────────────────────────────┤
│ Kategoriler │  [grid of 18 texture cards]               │
│             │                                           │
│ ● Tümü  42  │                                           │
│   Vintage 12│                                           │
│   Modern  8 │                                           │
│   Klasik 10 │                                           │
│   Genel  12 │                                           │
│             │  ‹  1  2  3  ›   Sayfa 1/3 · 42 doku     │
└─────────────┴───────────────────────────────────────────┘
```

- Sidebar width: fixed ~160 px, scrollable if many categories
- Main grid: responsive — 3 columns on wide, 2 on narrow, 1 on mobile
- Pagination bar: prev/next arrows + page number buttons + "Page X / Y · N textures" label

---

## Data Flow

No backend changes. The full texture list is already fetched once on mount and stored
in `textures` state. All filtering and pagination is pure derived computation:

1. **Categories** — derived by collecting unique `category` values from `textures`, sorted
   alphabetically, with "Tümü" prepended.
2. **Filtered list** — `selectedCategory === 'Tümü'` → all textures; otherwise filter by
   `texture.category === selectedCategory`.
3. **Page slice** — `filteredTextures.slice((page - 1) * 18, page * 18)`.
4. Changing `selectedCategory` resets `page` to 1.

---

## State

Two new state variables added to `AdminTextures`:

| Variable | Type | Default | Purpose |
|---|---|---|---|
| `selectedCategory` | `string` | `'Tümü'` | Which category is active in sidebar |
| `currentPage` | `number` | `1` | Current page within the filtered list |

---

## Components

All changes are confined to `AdminTextures.tsx`. No new files needed.

### Sidebar (inline in `AdminTextures`)

- Renders a `<nav>` with one button per category
- Each button shows: category name + count badge
- Active item gets a dark background (matches existing admin style)
- On click: set `selectedCategory`, reset `currentPage` to 1

### Pagination bar (inline in `AdminTextures`)

- Shows `‹ 1 2 3 › · Sayfa X/Y · N doku`
- Prev/next arrows disabled at boundaries
- Active page button gets dark background
- Hidden entirely when `totalPages <= 1`

---

## Visual Style

Follows the existing card/border style already used in `AdminTextures`:

- Sidebar items: `rounded-lg px-3 py-2 text-sm`, active: `bg-foreground text-background`
- Count badge: `text-xs rounded-full px-1.5 py-0.5 bg-muted`
- Page buttons: `w-8 h-8 rounded-md border text-sm`, active: `bg-foreground text-background`

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Only one page of results | Pagination bar hidden |
| Category deleted / renamed externally | Sidebar rebuilds from live data on next `loadTextures()` |
| No textures | Sidebar shows "Tümü 0", empty state message preserved |
| Adding a texture with a new category | After `loadTextures()` the new category appears automatically in the sidebar |

---

## Out of Scope

- Search / text filter within a category
- Drag-to-reorder between categories
- Renaming or deleting categories directly (categories are implicit strings on textures)
- Backend pagination (all data is already loaded client-side)
