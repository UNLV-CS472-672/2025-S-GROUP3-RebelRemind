// Hacky fix for css issues
function EventsStyle() {
    return (
        <>
            <style>{`
.no-events {
  text-align: center;
  color: #888;
  font-style: italic;
  margin: 0.5rem 0;
}

.weekday-title {
  font-weight: bold;
  color: #8b0000;
  margin-bottom: 0.25rem;
}

.weekday-divider {
  border-top: 1px solid #ccc;
  margin-bottom: 0.75rem;
}

.event-list {
  padding-left: 32px;
  margin-bottom: 1rem;
}

.event-list-daily {
  list-style: none !important;
  padding-left: 0 !important;
}
.event-list-daily ::marker {
  content: none;
}

.event-item {
  margin-bottom: 0.5rem;
  list-style-type: disc;
  font-size: 16px;
  font-family: "Lato", "Helvetica", "Arial", sans-serif;
  color: #212529;
}
.event-item:hover {
  color: #1f1f1f88 !important;
}

.event-link {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  text-decoration: none;
  color: inherit;
}

.event-name {
  flex: 1;
  white-space: normal;
  word-break: break-word;
}

.event-org {
  font-weight: 600;
}

.event-time {
  min-width: 80px;
  text-align: right;
  font-weight: 600;
  font-family: "Lato", "Helvetica", "Arial", sans-serif;
  display: flex;
  justify-content: right;
}

.showCompletedCheckbox {
  visibility: hidden;
}

.completedText {
  cursor: pointer;
  width: 135px;
}
.completedText:hover {
  font-weight: bold;
}

.checkboxOverride {
  position: relative;
  width: 25px;
  height: 25px;
}

.checkboxOverride input[type="checkbox"]:checked + label:after {
  opacity: 1;
}

.checkboxOverride label {
  background: #EEEEEE;
  border: 1px solid #DDDDDD;
  cursor: pointer !important;
  height: 25px;
  left: 0;
  position: absolute;
  top: 0;
  width: 25px;
}

.checkboxOverride label:after {
  border-style: none none solid solid;
  content: "";
  height: 5px;
  left: 6px;
  opacity: 0;
  position: absolute;
  top: 7px;
  transform: rotate(-45deg);
  width: 10px;
}

.checkboxWrapper {
  position: relative;
  display: inline-block;
}

.checkboxTooltip {
  position: absolute;
  top: -30px;
  right: 0;
  transform: translateX(0);
  background-color: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 10;
  max-width: max-content;
}

.checkboxWrapper:hover .checkboxTooltip {
  opacity: 1;
}
`}</style>
        </>

    )
};

export default EventsStyle;