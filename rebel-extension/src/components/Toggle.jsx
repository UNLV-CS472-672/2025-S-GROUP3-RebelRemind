import "./css/Toggle.css";

function Toggle({ isChecked, onChange }) {
    return (
      <label className="switch">
        <input type="checkbox" checked={isChecked} onChange={onChange} />
        <span className="slider">
        <span className={`${isChecked ? "weeklyLabel" : "dailyLabel"}`}>
            {isChecked ? <span>Weekly</span> :<span>Daily</span>}
          </span>
        </span>
      </label>
    );
  }
  
  export default Toggle;