# Bulk Select & Delete Textures

**Date:** 2026-05-09  
**Status:** Approved

## Overview

Add bulk selection and deletion to the AdminTextures component. Users can select individual textures, all textures on the current page, or all textures across all pages, then delete the selection in one action.

## UI Changes

### Selection toolbar (above the grid)

A row above the texture grid containing:
- "Select page (N)" button — selects all textures on the current page (up to 18)
- "Select all (N)" button — selects every texture across all pages regardless of pagination
- A count badge: "N selected"
- A red "Delete selected (N)" button, visible only when selection count > 0

### Per-card checkbox

Each texture card gets a checkbox overlay in the top-left corner:
- Hidden by default, visible on hover
- Always visible when any selection is active (so the user can see/manage their selection)

### Confirmation dialog

Before executing bulk delete, a confirmation dialog appears:
- Title: "Delete N textures?"
- Body: "This action cannot be undone."
- Cancel / Delete buttons

## State

A single `Set<string>` of selected texture IDs lives in `AdminTextures` state.

- Selecting a card: toggle its ID in the set
- "Select page": add all IDs from `pagedTextures` to the set
- "Select all": add all IDs from `filteredTextures` to the set (current category filter applies)
- Navigating pages or changing category: selection is preserved (IDs persist)
- After successful deletion: clear the set and reload

## Delete Logic

Loop through selected IDs calling the existing `adminDeleteTexture(id)` sequentially. Track success/fail counts and show a single toast summary when done. No new API function needed.

## Scope

- Only `src/components/admin/AdminTextures.tsx` is modified
- No new files, no API changes
