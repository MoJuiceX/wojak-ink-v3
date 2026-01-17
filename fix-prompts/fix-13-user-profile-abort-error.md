# Fix: UserProfile Context AbortError

## Problem
Console shows an error on page load:
```
[UserProfile] Error fetching profile: AbortError: signal is aborted without reason
```

## Current Behavior
- Error appears in console on navigation
- Doesn't seem to break functionality
- Indicates cleanup issue in useEffect

## Root Cause
This typically happens when a component unmounts while an async fetch is still in progress. The AbortController signal is aborted but the error isn't handled gracefully.

## Your Task

1. Find the UserProfile context at `src/contexts/UserProfileContext.tsx`

2. Look for the fetch call around line 31 and its error handling:

```tsx
// Current code probably looks like:
useEffect(() => {
  const controller = new AbortController();

  fetchProfile(controller.signal)
    .catch((error) => {
      console.error('[UserProfile] Error fetching profile:', error);
    });

  return () => controller.abort();
}, []);
```

3. Update the error handling to ignore AbortError:

```tsx
useEffect(() => {
  const controller = new AbortController();

  const loadProfile = async () => {
    try {
      const profile = await fetchProfile(controller.signal);
      setProfile(profile);
    } catch (error) {
      // Ignore AbortError - this is expected on unmount
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('[UserProfile] Error fetching profile:', error);
    }
  };

  loadProfile();

  return () => controller.abort();
}, []);
```

4. If using fetch directly, check for abort in the catch:

```tsx
fetch(url, { signal: controller.signal })
  .then(res => res.json())
  .then(data => setProfile(data))
  .catch((error) => {
    if (error.name === 'AbortError') {
      // Request was cancelled - this is fine
      return;
    }
    console.error('[UserProfile] Error:', error);
  });
```

5. If using TanStack Query, ensure it handles cancellation:

```tsx
const { data } = useQuery({
  queryKey: ['profile'],
  queryFn: ({ signal }) => fetchProfile(signal),
  // Query will handle abort automatically
});
```

## Files to Check
- `src/contexts/UserProfileContext.tsx`

## Success Criteria
- No AbortError in console during normal navigation
- Profile still loads correctly
- Clean unmount without error spam
