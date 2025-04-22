// components/GroupedListRenderer.jsx
import { Check, Undo2 } from "lucide-react";

function GroupByWeek({ groupedItems, isComplete, markComplete, undoComplete, isCanvas = false }) {
  const orderedWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div>
      {orderedWeekdays.map(day => {
        const items = groupedItems[day];
        if (!items || items.length === 0) return null;

        return (
          <div key={day}>
            <h4>{day}</h4>
            <ul className="m-0 p-0">
              {items.map(item => (
                <li
                  key={item.id}
                  className="flex justify-between items-start gap-2 w-full p-2 relative pl-0"
                >
                  <span className="absolute left-0 top-2 text-xl">•</span>
                  <div
                    className="break-words"
                    style={{
                      width: "312px",
                      flexShrink: 0,
                      flexGrow: 0,
                      color: isCanvas && isComplete(item.id) ? "gray" : "inherit",
                      textDecoration: isCanvas && isComplete(item.id) ? "line-through" : "none",
                    }}
                  >
                    {item.context_name ? (
                      <span style={{ fontWeight: "bold" }}>{item.context_name}</span>
                    ) : null}
                    {item.context_name ? ": " : null}
                    {item.title || item.name} {item.label}
                  </div>

                  {isCanvas && (
                    isComplete(item.id) ? (
                      <button
                        onClick={() => undoComplete(item.id)}
                        className="rounded flex items-center justify-center"
                        style={{ alignSelf: "center", height: "fit-content", padding: "0px 2px 3px 2px" }}
                        title="Undo Completed"
                      >
                        <Undo2 size={18} strokeWidth={2.5} />
                      </button>
                    ) : (
                      <button
                        onClick={() => markComplete(item)}
                        className="rounded flex items-center justify-center"
                        style={{ alignSelf: "center", height: "fit-content", padding: "0px 2px 3px 2px" }}
                        title="Assignment Completed"
                      >
                        <Check size={18} strokeWidth={2.5} />
                      </button>
                    )
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default GroupByWeek;
