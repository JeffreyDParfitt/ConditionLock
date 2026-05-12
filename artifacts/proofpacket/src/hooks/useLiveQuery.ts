import { useEffect, useState } from 'react';
import { db } from '../storage/db';

export function useLiveQuery<T>(querier: () => Promise<T>, deps: any[] = []): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    // Use RxJS observable from dexie
    const observable = db.on('changes', function (changes) {
      querier().then(res => {
        if (mounted) setData(res);
      });
    });

    querier().then(res => {
      if (mounted) setData(res);
    });

    return () => {
      mounted = false;
      // Note: simple polling/refreshing on changes
    };
  }, deps);

  return data;
}

// Actually better to use Dexie liveQuery
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
