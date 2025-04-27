// filter-events.js
import { fetchEvents } from "./fetch-events";

export async function filterEvents(today, viewMode) {
  const [ac, ic, rc, uc] = await fetchEvents(today, viewMode);

  return new Promise((resolve) => {
    chrome.storage.sync.get(["selectedInterests", "preferences", "involvedClubs"], (storageData) => {
      const selectedInterests = storageData.selectedInterests || [];
      const involvedClubs = storageData.involvedClubs || [];
      const preferences = storageData.preferences || {};
    
      const filteredAC = preferences.academicCalendar ? ac : [];
      const filteredIC = preferences.involvementCenter
        ? ic.filter((e) => involvedClubs.includes(e.organization)) // <- notice this!
        : [];
      const filteredRC = preferences.rebelCoverage ? rc : [];
      const filteredUC = preferences.UNLVCalendar
        ? uc.filter((e) => selectedInterests.includes(e.category))
        : [];
    
      resolve([filteredAC, filteredIC, filteredRC, filteredUC]);
    });
    
  });
}
