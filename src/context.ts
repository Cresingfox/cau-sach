import { createContext, useContext } from 'react';
import type { Database, Page, User } from './types';
export interface AppContextValue { db: Database; user: User; commit: (fn: (db: Database) => Database, message?: string) => boolean; go: (page: Page) => void; showIntro: () => void; showTour: () => void; reset: () => void; logout: () => void; }
export const AppContext = createContext<AppContextValue>(null!);
export const useApp = () => useContext(AppContext);
