import React, { useState, useEffect } from "react";
import "./App.css";
import { NT4_Client, NT4_TYPESTR } from './resources/nt4.js';

// Create the client
const ntClient = new NT4_Client(
  "roborio-1477-frc.local",  // server address of robot
  (topic) => {},              // onTopicAnnounce
  (topic) => {},              // onTopicUnAnnounce
  (topic, ts, value) => {},   // onNewTopicData
  () => { console.log("Connected to NT4!"); },
  () => { console.log("Disconnected from NT4!"); }
);

// Connect to robot
ntClient.ws_connect();

export default function App() {
  // Store all button states in an object
  const [buttonStates, setButtonStates] = useState({});
  const [toggleTopic, setToggleTopic] = useState(null);

  // Only create the toggleTopic after NT4 connects
  useEffect(() => {
    const onConnectBackup = ntClient.onConnect;
    ntClient.onConnect = () => {
      console.log("NT4 connected (useEffect)!");
      const topic = ntClient.publishNewTopic("Dashboard/Toggles", NT4_TYPESTR.JSON);
      setToggleTopic(topic);
      if (onConnectBackup) onConnectBackup(); // preserve original callback
    };
  }, []);

  const handleToggle = (id) => {
    setButtonStates((prev) => {
      const newStates = { ...prev, [id]: !prev[id] };

      // Only send to NT4 if connected and topic is ready
      if (ntClient.ws && ntClient.ws.readyState === WebSocket.OPEN && toggleTopic) {
        ntClient.addSample(toggleTopic, newStates);
      }

      return newStates;
    });
  };

  // Helper to render a stack
  const renderStack = (pair, side) => (
    <div className={`stack ${pair} ${side}`}>
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
  );

  return (
    <div className="circle-container">
      {["pair1", "pair2", "pair3", "pair4", "pair5", "pair6"].map((pair) => (
        <React.Fragment key={pair}>
          {renderStack(pair, "left")}
          {renderStack(pair, "right")}
        </React.Fragment>
      ))}
    </div>
  );
}
