/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,tsx, ts}"],
  theme: {
    spacing: {
      // Define pixel values
      px: "1px",
      0: "0px",
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      8: "32px",
      10: "40px",
      12: "48px",
      16: "64px",
      20: "80px",
      24: "96px",
      32: "128px",
      40: "160px",
      48: "192px",
      56: "224px",
      64: "256px",
    },
    fontSize: {
      // Define font sizes in pixels
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
      "5xl": "48px",
      "6xl": "64px",
    },
    // Continue redefining other properties as needed...
  },
  plugins: [],
};
