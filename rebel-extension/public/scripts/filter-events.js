// filter-events.js
import { fetchEvents } from "./fetch-events";

export async function filterEvents(today, viewMode) {
  const [ac, ic, rc, uc] = await fetchEvents(today, viewMode);

  return new Promise((resolve) => {
    chrome.storage.sync.get(["selectedInterests", "preferences"], (storageData) => {
      const selectedInterests = storageData.selectedInterests || [];
      const preferences = storageData.preferences || {};

      const filteredAC = preferences.academicCalendar ? ac : [];
      const filteredIC = preferences.involvementCenter ? ic : [];
      const filteredRC = preferences.rebelCoverage ? rc : [];
      const filteredUC = preferences.UNLVCalendar
        ? uc.filter((e) => selectedInterests.includes(e.category))
        : [];

      resolve([filteredAC, filteredIC, filteredRC, filteredUC]);
    });
  });
}
