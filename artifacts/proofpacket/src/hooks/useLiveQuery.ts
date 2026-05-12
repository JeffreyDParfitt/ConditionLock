import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

export function useDexieQuery<T>(querier: () => Promise<T>, deps: any[] = []): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    const subscription = liveQuery(querier).subscribe({
      next: (val) => setData(val),
      error: (err) => console.error(err)
    });
    return () => subscription.unsubscribe();
  }, deps);

  return data;
}
