export async function filterEvents(ic_events, rc_events, uc_events) {

// filtering logic
const [filt_ic_events, filt_rc_events, filt_uc_events] = [ic_events, rc_events, uc_events];

return [filt_ic_events, filt_rc_events, filt_uc_events];
}