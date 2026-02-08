import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WatchlistItem } from '@/types';

interface WatchlistStore {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
  updateProgress: (id: number, progress: number) => void;
  clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      watchlist: [],
      
      addToWatchlist: (item) => {
        const { watchlist } = get();
        const exists = watchlist.some((w) => w.id === item.id);
        
        if (!exists) {
          set({
            watchlist: [...watchlist, { ...item, added_at: new Date().toISOString() }],
          });
        }
      },
      
      removeFromWatchlist: (id) => {
        set({
          watchlist: get().watchlist.filter((item) => item.id !== id),
        });
      },
      
      isInWatchlist: (id) => {
        return get().watchlist.some((item) => item.id === id);
      },
      
      updateProgress: (id, progress) => {
        set({
          watchlist: get().watchlist.map((item) =>
            item.id === id ? { ...item, progress } : item
          ),
        });
      },
      
      clearWatchlist: () => {
        set({ watchlist: [] });
      },
    }),
    {
      name: 'nigntour-watchlist',
    }
  )
);
