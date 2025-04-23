import React from "react";
import { FaBell, FaBellSlash } from "react-icons/fa";
import Switch from "react-switch";


function NotificationToggle ({ enabled, setEnabled }) {
    const handleChange = (checked) => {
        setEnabled(checked);
      };
    return (
        <Switch
            onChange={handleChange}
            checked={enabled}
            offColor="#bbb"
            onColor="#8b0000"
            uncheckedIcon={false}
            checkedIcon={false}
            handleDiameter={30}
            height={40}
            width={80}
            handleStyle={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            }}
            uncheckedHandleIcon={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <FaBellSlash style={{ color: "#8b0000" }} />
            </div>
            }
            checkedHandleIcon={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <FaBell style={{ color: "#8b0000" }} />
            </div>
            }
        />
    );
}

export default NotificationToggle;
