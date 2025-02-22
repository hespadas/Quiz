// src/components/WaitScreen.jsx
import React from "react";

const WaitScreen = ({ message = "Loading..." }) => (
  <div style={styles.overlay}>
    <div style={styles.content}>
      <div className="spinner" />
      <p>{message}</p>
    </div>
  </div>
);

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  content: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    textAlign: "center",
  },
};

export default WaitScreen;
