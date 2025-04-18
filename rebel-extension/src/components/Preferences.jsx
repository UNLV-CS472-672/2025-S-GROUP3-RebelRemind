import React, { useEffect, useState } from "react";

/**
 * Preferences Component
 *
 * This component allows users to manage their event preferences and campus interests,
 * including involvement in clubs, sports, and event categories.
 * It syncs preferences with Chrome Storage and displays dynamic UI controls
 * based on user selection (e.g., checklists, dropdowns, filters).
 * 
 * Authored by: Sebastian Yepez
 * Documentation generated by ChatGPT
 * 
 * @component
 * @returns {JSX.Element} The full Preferences management UI.
 */
const Preferences = () => {
    /** Core preferences shown as checkboxes */
    const preferencesList = [
        { key: "academicCalendar", label: "Academic Calendar" },
        { key: "UNLVCalendar", label: "UNLV Calendar" },
        { key: "involvementCenter", label: "Involvement Center" },
        { key: "canvasIntegration", label: "Canvas Integration" },
        { key: "rebelCoverage", label: "Rebel Sports" },
        { key: "userEvents", label: "Your Events" },
    ];

    // Search term used for filtering club results
    const [searchTerm, setSearchTerm] = useState("");

    // Clubs user is involved in
    const [involvedClubs, setInvolvedClubs] = useState([]);

    // Full list of clubs (could be dynamic in a real API)
    const allClubs = [
        "UNLV ACM", "Finance Club", "Hackathon Society", "IEEE", "UNLVolunteers", 
        "1st Generation Club", "Actuarial Science Club", "African Student Alliance", 
        "AI and Data Science Club", "Alpha Delta Phi"
    ];

    // Sports & selected options
    const mensSports = ["Baseball", "Basketball", "Football", "Golf", "Soccer", "Swim & Dive", "Tennis"];
    const womensSports = ["Basketball", "Cross Country", "Golf", "Soccer", "Softball", "Swim & Dive", "Tennis", "Track & Field", "Volleyball"];
    const [selectedMenSports, setSelectedMenSports] = useState([]);
    const [selectedWomenSports, setSelectedWomenSports] = useState([]);

    // Interests
    const allInterests = [
        "Art", "Science", "Theater", "Research Talks", 
        "Thesis Defenses", "Live Music", "Cultural Events"
    ];
    const [selectedInterests, setSelectedInterests] = useState([]);

    // Preferences toggle UI sections
    const [showClubs, setShowClubs] = useState(true);
    const [showSports, setShowSports] = useState(true);
    const [showInterests, setShowInterests] = useState(true);

    // Default preferences for a new or reset user
    const defaultPreferences = {
        academicCalendar: false,
        UNLVCalendar: false,
        involvementCenter: false,
        canvasIntegration: false,
        rebelCoverage: false,
        userEvents: false,
    };

    // Preferences state
    const [preferences, setPreferences] = useState(defaultPreferences);

    // Track whether data is loaded before triggering "unsaved changes" banner
    const [loaded, setLoaded] = useState(false);

    // Initial states for change detection
    const [initialPreferences, setInitialPreferences] = useState({});
    const [initialClubs, setInitialClubs] = useState([]);
    const [initialMenSports, setInitialMenSports] = useState([]);
    const [initialWomenSports, setInitialWomenSports] = useState([]);
    const [initialInterests, setInitialInterests] = useState([]);

    // Unsaved banner trigger
    const [unsaved, setUnsaved] = useState(false);

    /**
     * On mount, retrieve stored user preferences from Chrome Storage
     * and initialize all state and initial values for diff tracking.
     */
    useEffect(() => {
        chrome.storage.sync.get([
            "preferences",
            "involvedClubs",
            "rebelMenSports",
            "rebelWomenSports",
            "selectedInterests"
        ], (data) => {
            const prefs = data.preferences || defaultPreferences;
            const clubs = data.involvedClubs || [];
            const men = data.rebelMenSports || [];
            const women = data.rebelWomenSports || [];
            const interests = data.selectedInterests || [];

            setPreferences(prefs);
            setInitialPreferences(prefs);
            setInvolvedClubs(clubs);
            setInitialClubs(clubs);
            setSelectedMenSports(men);
            setInitialMenSports(men);
            setSelectedWomenSports(women);
            setInitialWomenSports(women);
            setSelectedInterests(interests);
            setInitialInterests(interests);

            setLoaded(true); // Trigger comparison only after data is loaded
        });
    }, []);

    /**
     * Watch for any preference changes and set the `unsaved` flag
     * if differences are detected between current and initial values.
     */
    useEffect(() => {
        if (!loaded) return;

        const hasChanges =
            JSON.stringify(preferences) !== JSON.stringify(initialPreferences) ||
            JSON.stringify(involvedClubs) !== JSON.stringify(initialClubs) ||
            JSON.stringify(selectedMenSports) !== JSON.stringify(initialMenSports) ||
            JSON.stringify(selectedWomenSports) !== JSON.stringify(initialWomenSports) ||
            JSON.stringify(selectedInterests) !== JSON.stringify(initialInterests);

        setUnsaved(hasChanges);
    }, [loaded, preferences, involvedClubs, selectedMenSports, selectedWomenSports, selectedInterests]);

    /**
     * Toggle a boolean preference by key.
     * @param {string} key - Preference key to toggle
     */
    const handlePreferenceChange = (key) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    /**
     * Save current preferences and selections to Chrome Storage.
     * Also updates the initial values so "unsaved" doesn't show.
     * Requests for Canvas assignments to be updated in storage and an alarm to be started if Canvas integration is enabled.
     * Stops alarm for refreshing Canvas assignments if Canvas integration is disabled.
     */
    const savePreferences = () => {
        chrome.storage.sync.set(
            {
                preferences,
                involvedClubs,
                rebelMenSports: selectedMenSports,
                rebelWomenSports: selectedWomenSports,
                selectedInterests,
            },
            () => {
                setInitialPreferences(preferences);
                setInitialClubs(involvedClubs);
                setInitialMenSports(selectedMenSports);
                setInitialWomenSports(selectedWomenSports);
                setInitialInterests(selectedInterests);
                setUnsaved(false);
                alert("Preferences saved!");
            }
        );
        if (preferences.canvasIntegration) { // Checks Canvas integration preference
            chrome.storage.local.get("canvasPAT", (data) => {
                if (data.canvasPAT) {
                    chrome.runtime.sendMessage({ type: "UPDATE_ASSIGNMENTS" }); // Get assignments if Canvas Access Token is present
                    chrome.runtime.sendMessage({ type: "START_CANVAS_ALARM" }); // Start alarm to trigger future fetches
                }
                else {
                    alert("Please enter a Canvas Access Token!"); // Tell users they need an access token to use Canvas integration
                }
            });
        }
        else {
            chrome.runtime.sendMessage({ type: "CLEAR_CANVAS_ALARM"}); // Stops Canvas alarm if integration is shut off
        }
    };

    /** Toggle selection of a men's sport */
    const toggleMenSport = (sport) => {
        setSelectedMenSports((prev) =>
            prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
        );
    };

    /** Toggle selection of a women's sport */
    const toggleWomenSport = (sport) => {
        setSelectedWomenSports((prev) =>
            prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
        );
    };

    /** Clubs filtered by search and excluding those already joined */
    const filteredClubs = allClubs
        .filter((club) => !involvedClubs.includes(club))
        .filter((club) => club.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 8); // Limit results to 8

    /** Add a club to the user's list */
    const handleAddClub = (club) => {
        if (!involvedClubs.includes(club)) {
            setInvolvedClubs((prev) => [...prev, club]);
        }
    };

    /** Remove a club from the user's list */
    const handleRemoveClub = (club) => {
        setInvolvedClubs((prev) => prev.filter((c) => c !== club));
    };

    return (
        <div style={{padding: '0.2rem'}}>
            {/* Preferences Grid */}
            <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '1rem' }}>
                    {/* Left column preferences */}
                    <div style={{ display: 'flex', flexDirection: 'column', rowGap: '1rem' }}>
                        {preferencesList.slice(0, 3).map(({ key, label }) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={preferences[key]} onChange={() => handlePreferenceChange(key)} />
                                {label}
                            </label>
                        ))}
                    </div>
                    {/* Right column preferences */}
                    <div style={{ display: 'flex', flexDirection: 'column', rowGap: '1rem' }}>
                        {preferencesList.slice(3).map(({ key, label }) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={preferences[key]} onChange={() => handlePreferenceChange(key)} />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interests Section */}
            {preferences.UNLVCalendar && (
                <div style={{ marginTop: "2rem" }}>
                    <div onClick={() => setShowInterests(prev => !prev)} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <span style={{ fontWeight: "bold" }}>Your Interests</span>
                        <span>{showInterests ? "▲" : "▼"}</span>
                    </div>
                    {showInterests && (
                        <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "space-evenly" }}>
                            {allInterests.map((interest) => (
                                <label key={interest} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedInterests.includes(interest)}
                                        onChange={() =>
                                            setSelectedInterests((prev) =>
                                                prev.includes(interest)
                                                    ? prev.filter((i) => i !== interest)
                                                    : [...prev, interest]
                                            )
                                        }
                                    />
                                    {interest}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Club Selector */}
            {preferences.involvementCenter && (
                <div style={{ marginTop: "1rem" }}>
                    <div onClick={() => setShowClubs(prev => !prev)} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <span style={{ fontWeight: "bold" }}>Your Organizations</span>
                        <span>{showClubs ? "▲" : "▼"}</span>
                    </div>
                    {showClubs && (
                        <div style={{ marginTop: "1rem" }}>
                            <input
                                type="text"
                                placeholder="Search for orgs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
                            />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {filteredClubs.map((club) => (
                                    <button key={club} onClick={() => handleAddClub(club)} style={{ padding: '0.3rem 0.6rem', 
                                                                                            borderRadius: '9999px', background: '#555' }}>
                                        {club}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {involvedClubs.map((club) => (
                                    <div key={club} style={{ color: 'white', display: 'flex', alignItems: 'center', 
                                                             background: '#8b0000', borderRadius: '9999px', padding: '0.3rem', fontSize: '0.9rem' }}>
                                        <span style={{ padding: '0.3rem' }}>{club}</span>
                                        <button onClick={() => handleRemoveClub(club)} style={{ background: 'none', border: 'none', 
                                                    fontWeight: 'bold', cursor: 'pointer' }} aria-label={`Remove ${club}`}>
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sports Selector */}
            {preferences.rebelCoverage && (
                <div style={{ marginTop: "1rem" }}>
                    <div onClick={() => setShowSports(prev => !prev)} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <span style={{ fontWeight: "bold" }}>Rebel Sports Coverage</span>
                        <span>{showSports ? "▲" : "▼"}</span>
                    </div>
                    {showSports && (
                        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "1rem" }}>
                            <div>
                                <p>Men’s Sports</p>
                                {mensSports.map((sport) => (
                                    <label key={sport} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedMenSports.includes(sport)}
                                            onChange={() => toggleMenSport(sport)}
                                        />
                                        {sport}
                                    </label>
                                ))}
                            </div>
                            <div>
                                <p>Women’s Sports</p>
                                {womensSports.map((sport) => (
                                    <label key={sport} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedWomenSports.includes(sport)}
                                            onChange={() => toggleWomenSport(sport)}
                                        />
                                        {sport}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-3" style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="rounded" onClick={savePreferences}>Save Preferences</button>
                <button className="rounded" onClick={() => {
                    const confirmReset = window.confirm("Are you sure you want to reset all your preferences?");
                    if (!confirmReset) return;

                    chrome.storage.sync.remove([
                        "preferences", "involvedClubs", "rebelMenSports", "rebelWomenSports", "selectedInterests"
                    ], () => {
                        setPreferences(defaultPreferences);
                        setInvolvedClubs([]);
                        setSelectedMenSports([]);
                        setSelectedWomenSports([]);
                        setSelectedInterests([]);

                        setInitialPreferences(defaultPreferences);
                        setInitialClubs([]);
                        setInitialMenSports([]);
                        setInitialWomenSports([]);
                        setInitialInterests([]);

                        setUnsaved(false);
                    });
                }}>
                    Reset Preferences
                </button>
            </div>

            {/* Unsaved Changes Notification */}
            {unsaved && (
                <div style={{ marginTop: '1rem', color: 'crimson', fontSize: '0.9rem' }}>
                    You have unsaved changes!
                </div>
            )}
        </div>
    );
};

export default Preferences;
