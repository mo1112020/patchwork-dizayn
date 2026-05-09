# Bulk Select & Delete Textures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bulk selection and deletion to the AdminTextures page — per-card checkboxes, select-page/select-all toolbar buttons, and a confirmation dialog before bulk delete.

**Architecture:** All changes are confined to a single component (`AdminTextures.tsx`). Selection state is a `Set<string>` of texture IDs. The toolbar renders above the texture grid; checkboxes overlay each card. Bulk delete reuses the existing `adminDeleteTexture` API in a sequential loop.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui Dialog + Button

---

## File Structure

- **Modify:** `src/components/admin/AdminTextures.tsx`

---

### Task 1: Add selection state and handlers

**Files:**
- Modify: `src/components/admin/AdminTextures.tsx`

- [ ] **Step 1: Add three new state variables after `currentPage` state (around line 54)**

  In `AdminTextures`, after:
  ```tsx
  const [currentPage, setCurrentPage] = useState(1);
  ```
  Add:
  ```tsx
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  ```

- [ ] **Step 2: Add four selection handlers after `selectCategory` (around line 196)**

  After:
  ```tsx
  const selectCategory = (name: string) => {
    setSelectedCategory(name);
    setCurrentPage(1);
  };
  ```
  Add:
  ```tsx
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectPage = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      pagedTextures.forEach(t => next.add(t.id));
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredTextures.map(t => t.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    let lastError = '';
    for (const id of selectedIds) {
      const { error } = await adminDeleteTexture(id);
      if (error) { failCount++; lastError = error; } else { successCount++; }
    }
    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    clearSelection();
    if (successCount) toast({ title: `${successCount} doku silindi` });
    if (failCount) toast({ title: `${failCount} doku silinemedi`, description: lastError, variant: 'destructive' });
    loadTextures();
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/admin/AdminTextures.tsx
  git commit -m "feat: add bulk selection state and handlers to AdminTextures"
  ```

---

### Task 2: Add per-card checkbox overlay

**Files:**
- Modify: `src/components/admin/AdminTextures.tsx`

- [ ] **Step 1: Make each texture card relative and add a checkbox overlay**

  Find the texture card div (around line 241):
  ```tsx
  <div
    key={row.id}
    className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border p-4 bg-card"
  >
  ```
  Replace with:
  ```tsx
  <div
    key={row.id}
    className="group relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border p-4 bg-card"
  >
    <div className={`absolute top-2 left-2 z-10 transition-opacity ${selectedIds.size > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
      <input
        type="checkbox"
        checked={selectedIds.has(row.id)}
        onChange={() => toggleSelect(row.id)}
        className="w-4 h-4 cursor-pointer accent-foreground"
      />
    </div>
  ```

  The closing `</div>` for the card remains unchanged at the end of the card block.

- [ ] **Step 2: Visually highlight selected cards**

  In the same card div, change the `className` to also apply a ring when selected:
  ```tsx
  className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border p-4 bg-card transition-colors ${
    selectedIds.has(row.id) ? 'border-foreground bg-muted/40' : 'border-border'
  }`}
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/admin/AdminTextures.tsx
  git commit -m "feat: add per-card checkbox overlay to AdminTextures"
  ```

---

### Task 3: Add selection toolbar above the texture grid

**Files:**
- Modify: `src/components/admin/AdminTextures.tsx`

- [ ] **Step 1: Add toolbar above the grid**

  Find the grid div (around line 240):
  ```tsx
  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  ```
  Insert this toolbar immediately before it:
  ```tsx
  <div className="flex items-center gap-2 mb-3 flex-wrap">
    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={selectPage}>
      Sayfayı seç ({pagedTextures.length})
    </Button>
    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={selectAll}>
      Tümünü seç ({filteredTextures.length})
    </Button>
    {selectedIds.size > 0 && (
      <>
        <span className="text-xs text-muted-foreground">{selectedIds.size} seçildi</span>
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearSelection}>
          Seçimi temizle
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 text-xs gap-1 ml-auto"
          onClick={() => setBulkDeleteOpen(true)}
        >
          <Trash2 className="w-3 h-3" /> {selectedIds.size} dokuyu sil
        </Button>
      </>
    )}
  </div>
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add src/components/admin/AdminTextures.tsx
  git commit -m "feat: add bulk selection toolbar to AdminTextures"
  ```

---

### Task 4: Add bulk delete confirmation dialog

**Files:**
- Modify: `src/components/admin/AdminTextures.tsx`

- [ ] **Step 1: Add the confirmation dialog in the JSX return**

  In the `return` block of `AdminTextures`, after the closing `</>` of `<AddTexturesDialog ... />` and before the final `</>`, add:
  ```tsx
  <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{selectedIds.size} dokuyu sil?</DialogTitle>
        <DialogDescription>Bu işlem geri alınamaz.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => setBulkDeleteOpen(false)} disabled={bulkDeleting}>
          İptal
        </Button>
        <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting}>
          {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : `${selectedIds.size} dokuyu sil`}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  ```

- [ ] **Step 2: Verify the return block structure**

  The full return should end like:
  ```tsx
  return (
    <>
      <Card>...</Card>
      <EditTextureDialog ... />
      <AddTexturesDialog ... />
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        ...
      </Dialog>
    </>
  );
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/admin/AdminTextures.tsx
  git commit -m "feat: add bulk delete confirmation dialog to AdminTextures"
  ```

---

### Task 5: Manual verification

- [ ] **Step 1: Start dev server**
  ```bash
  npm run dev
  ```

- [ ] **Step 2: Navigate to the admin textures page and verify:**
  - Hovering a card shows the checkbox
  - Clicking "Sayfayı seç" checks all 18 visible cards and shows checkboxes permanently
  - Clicking "Tümünü seç" selects all textures across all pages (count matches total)
  - "Seçimi temizle" unchecks everything
  - Clicking "N dokuyu sil" opens the confirmation dialog
  - Confirming deletes all selected textures and shows a success toast
  - The grid reloads without the deleted textures

- [ ] **Step 3: Final commit if any polish was needed**
  ```bash
  git add src/components/admin/AdminTextures.tsx
  git commit -m "feat: bulk select and delete textures in admin panel"
  ```
