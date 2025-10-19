import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [buttonStates, setButtonStates] = useState({});

  const handleToggle = (id) => {
    setButtonStates((prev) => {
      const newStates = { ...prev, [id]: !prev[id] };

      const reefMap = {};
      ["a", "b", "c", "d", "e", "f"].forEach((pair) => {
        const sides = ["l", "r"].map((side) =>
          ["l2", "l3", "l4"].map((level) => {
            const key = `${pair}-${side}-${level}`;
            return !!newStates[key];
          })
        );
        reefMap[pair] = sides;
      });

      // Create algaeMap (simplified side-based)
      const algaeMap = {};
      ["a", "b", "c", "d", "e", "f"].forEach((side) => {
        algaeMap[side] = !!newStates[side];
      });

      // send reefMap to original webhook
      fetch("http://127.0.0.1:1477/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reefMap),
      }).catch((err) => console.error("Reef webhook failed:", err));

      // send algaeMap to new webhook
      fetch("http://127.0.0.1:1477/algae-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(algaeMap),
      }).catch((err) => console.error("Algae webhook failed:", err));

      return newStates;
    });
  };

  const renderPair = (pair) => (
    <div className={`pair ${pair}`} key={pair}>
      {["l", "r"].map((side) => (
        <div className={`stack ${side}`} key={side}>
          {["l4", "l3", "l2"].map((level) => {
            const id = `${pair}-${side}-${level}`;
            return (
              <button
                key={id}
                id={id}
                className={`toggle ${level} ${buttonStates[id] ? "selected" : ""}`}
                onClick={() => handleToggle(id)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );

  const renderAlgaeSide = (side) => (
    <div className={`algae-side ${side}`} key={side}>
      {/* Green circle below each algae side - now clickable */}
      <div 
        className={`green-circle ${buttonStates[side] ? "selected" : ""}`}
        onClick={() => handleToggle(side)}
      ></div>
    </div>
  );

  return (
    <div className="circle-container">
      {["a", "b", "c", "d", "e", "f"].map((pair) => renderPair(pair))}
      {["a", "b", "c", "d", "e", "f"].map((side) => renderAlgaeSide(side))}
    </div>
  );
}
