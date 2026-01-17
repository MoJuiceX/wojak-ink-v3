# Fix: NFT Modal History Tab Initially Appears Empty

## Problem
When opening an NFT detail modal and clicking the History tab, it initially appears empty until scrolling.

## Current Behavior
- History tab seems empty on first view
- Content only appears after scrolling
- "Minted" info is hidden initially

## Your Task

1. Find the NFT Modal component:
   - `src/components/Gallery/NFTModal.tsx`
   - `src/components/NFTDetail/NFTDetailModal.tsx`
   - Or similar

2. Look for the History tab content and check for:
   - Incorrect initial scroll position
   - Content positioned below the fold
   - Animation that starts with opacity: 0

3. If there's a scroll container, ensure it starts at the top:

```tsx
const historyRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (activeTab === 'history' && historyRef.current) {
    historyRef.current.scrollTop = 0;
  }
}, [activeTab]);

// In JSX:
<div ref={historyRef} className="overflow-y-auto max-h-[400px]">
  {/* History content */}
</div>
```

4. Check if the "Minted" info has proper positioning:

```tsx
<div className="history-tab">
  {/* This should be visible immediately */}
  <div className="minted-info py-4">
    <span className="text-gray-400">Minted</span>
    <span className="text-white">{mintDate}</span>
  </div>

  {/* Transaction history */}
  {transactions.map((tx) => (
    <HistoryItem key={tx.id} transaction={tx} />
  ))}
</div>
```

5. If using AnimatePresence/motion, ensure initial state is visible:

```tsx
<motion.div
  initial={{ opacity: 1 }}  // Not opacity: 0
  animate={{ opacity: 1 }}
  // ...
>
```

## Files to Check
- `src/components/Gallery/NFTModal.tsx`
- `src/components/NFTDetail/HistoryTab.tsx`
- Any modal-related components

## Success Criteria
- History tab shows content immediately when clicked
- "Minted" info visible at top
- No need to scroll to see initial content
