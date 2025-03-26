import "@testing-library/jest-dom";


console.log("✅ jest-dom matchers loaded");

if (typeof TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
}

