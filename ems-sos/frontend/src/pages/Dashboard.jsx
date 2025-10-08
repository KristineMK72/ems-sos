import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../api";

export default function Dashboard({ token }) {
  const [incidents, setIncidents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Fetch any existing active incidents on load
    const fetchIncidents = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/incidents`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setIncidents(data);
        } catch (err) {
            console.error("Failed to fetch incidents:", err);
        }
    };
    fetchIncidents();

    // 2. Setup WebSocket connection for real-time updates
    const socket = io(API_BASE);
    
    socket.on('connect', () => {
        setIsConnected(true);
        console.log("Socket connected to EMS channel.");
    });

    socket.on("incident:new", (payload) => {
      console.log("New incident received:", payload);
      setIncidents((s) => [payload, ...s]);
    });

    socket.on("incident:update", (payload) => {
      console.log("Incident update received:", payload);
    });

    socket.on('disconnect', () => {
        setIsConnected(false);
    });
    
    return () => {
        socket.disconnect();
    };
  }, [token]);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>EMS Incident Dashboard</h2>
      <p>System Status: <span style={{ color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>
          {isConnected ? 'LIVE (Real-time Alerts Active)' : 'Disconnected (Check Backend)'}
      </span></p>
      
      {incidents.length === 0 ? (
          <p style={{ marginTop: '20px', fontSize: '1.2em' }}>No active incidents are currently reported.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {incidents.map((inc) => (
            <li key={inc.id} style={{ border: '2px solid #dc3545', padding: '15px', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#fff0f0', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <strong style={{ fontSize: '1.3em', color: '#dc3545' }}>🚨 NEW INCIDENT #{inc.id}</strong>
              <p>User ID: {inc.user_id}</p>
              <p>Time: {new Date(inc.created_at).toLocaleTimeString()}</p>
              <p>Note: {inc.description || "No specific note."}</p>
              <p>Current Location: <strong>Lat: {inc.lat.toFixed(5)}, Lng: {inc.lng.toFixed(5)}</strong></p>
              <button style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', marginTop: '10px', cursor: 'pointer' }}>Route to PSAP / Dispatch</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}