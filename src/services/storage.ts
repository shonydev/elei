import { Business } from '../types';
import { INITIAL_BUSINESSES } from '../data/initialBusinesses';

const STORAGE_KEY = 'elei_los_angeles_businesses_v11';

export function loadBusinesses(): Business[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
      return INITIAL_BUSINESSES;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Purge any old placeholder cafes that were not in the user's CSV
      const cleaned = parsed.filter((b) => !b.id.startsWith('la-'));
      if (cleaned.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        return cleaned;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
    return INITIAL_BUSINESSES;
  } catch (error) {
    console.error('Error loading businesses from localStorage:', error);
    return INITIAL_BUSINESSES;
  }
}

export function saveBusinesses(businesses: Business[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
  } catch (error) {
    console.error('Error saving businesses to localStorage:', error);
  }
}

export function resetToDefaults(): Business[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
  return INITIAL_BUSINESSES;
}

export function exportBusinessesJson(businesses: Business[]): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(businesses, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `cafeterias-los-angeles-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
