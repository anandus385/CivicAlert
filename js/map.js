// ==========================================
// CivicAlert - Map Page
// ==========================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ==========================================
// Check User Login
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    loadMap();

});

// ==========================================
// Initialize Map
// ==========================================

const map = L.map("map").setView([20.5937, 78.9629], 5);

// OpenStreetMap Tiles

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap Contributors"
    }
).addTo(map);

// ==========================================
// Load Complaints
// ==========================================

async function loadMap() {

    const snapshot = await getDocs(collection(db, "complaints"));

    const bounds = [];

    snapshot.forEach((document) => {

        const data = document.data();

        // Skip if no coordinates are available
        if (!data.latitude || !data.longitude)
            return;

        const marker = L.marker([
            data.latitude,
            data.longitude
        ]).addTo(map);

        marker.bindPopup(`

            <h3>${data.title}</h3>

            <p><strong>Category:</strong> ${data.category}</p>

            <p><strong>Status:</strong> ${data.status}</p>

            <p><strong>Location:</strong> ${data.location}</p>

            <p><strong>Reported By:</strong> ${data.userEmail}</p>

        `);

        bounds.push([
            data.latitude,
            data.longitude
        ]);

    });

    // Zoom to show all markers
    if (bounds.length > 0) {

        map.fitBounds(bounds);

    }

}