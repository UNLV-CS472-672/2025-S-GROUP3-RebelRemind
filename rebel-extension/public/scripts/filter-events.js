// filter-events.js
import { fetchEvents } from "./fetch-events";

export async function filterEvents(today, viewMode) {
  const [ac, ic, rc, uc] = await fetchEvents(today, viewMode);

  return new Promise((resolve) => {
    chrome.storage.sync.get(["selectedSports", "selectedInterests", "preferences", "involvedClubs"], (storageData) => {
      const selectedInterests = storageData.selectedInterests || [];
      const selectedSports = storageData.selectedSports || [];
      const involvedClubs = storageData.involvedClubs || [];
      const preferences = storageData.preferences || {};
    
      const filteredAC = preferences.academicCalendar ? ac : [];
      const filteredIC = preferences.involvementCenter
        ? Array.isArray(ic) ? ic.filter((e) => involvedClubs.includes(e.organization)) : []
        : [];
      const filteredRC = preferences.rebelCoverage
      ? Array.isArray(rc) ? rc.filter((e) => selectedSports.includes(e.sport))
      : []
      : [];
      const filteredUC = preferences.UNLVCalendar
        ? Array.isArray(uc) ? uc.filter((e) => selectedInterests.includes(e.category)) : []
        : [];
          
      resolve([filteredAC, filteredIC, filteredRC, filteredUC]);
    });
    
  });
}
