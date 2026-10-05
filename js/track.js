// ==========================================
// CivicAlert - Track Complaint
// ==========================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const container = document.getElementById("complaintContainer");

// ==========================================
// Check Login
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadComplaints(user.uid);

});

// ==========================================
// Load Complaints
// ==========================================

async function loadComplaints(userId) {

    container.innerHTML = "";

    const q = query(

        collection(db, "complaints"),

        where("userId", "==", userId)

    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {

        container.innerHTML = `

        <div class="empty">

            <h2>No Complaints Found</h2>

            <p>You haven't submitted any complaints yet.</p>

        </div>

        `;

        return;

    }

    querySnapshot.forEach((document) => {

        const data = document.data();

        let statusClass = "";

        switch (data.status) {

            case "Pending":
                statusClass = "pending";
                break;

            case "In Progress":
                statusClass = "progress";
                break;

            case "Fixed":
                statusClass = "fixed";
                break;

            default:
                statusClass = "pending";
        }

        // Format Date
        let complaintDate = "N/A";

        if (data.createdAt && data.createdAt.toDate) {

            complaintDate =
                data.createdAt.toDate().toLocaleString();

        }

        container.innerHTML += `

        <div class="complaint-card">

            <h2>${data.title}</h2>

            <p><strong>Complaint ID :</strong> ${document.id}</p>

            <p><strong>Category :</strong> ${data.category}</p>

            <p><strong>Description :</strong></p>

            <p>${data.description}</p>

            <p><strong>Location :</strong></p>

            <p>${data.location}</p>

            <p><strong>Latitude :</strong> ${data.latitude ?? "Not Available"}</p>

            <p><strong>Longitude :</strong> ${data.longitude ?? "Not Available"}</p>

            <p><strong>Image :</strong> ${data.imageName || "No Image"}</p>

            <p><strong>Submitted :</strong> ${complaintDate}</p>

            <span class="status ${statusClass}">
                ${data.status}
            </span>

            <br>

            <button
                class="map-btn"
                onclick="openMap(${data.latitude || 0}, ${data.longitude || 0})">

                📍 View on Map

            </button>

        </div>

        `;

    });

}

// ==========================================
// Open Google Maps
// ==========================================

window.openMap = function(latitude, longitude) {

    if (!latitude || !longitude) {

        alert("Location not available.");

        return;

    }

    window.open(

        `https://www.google.com/maps?q=${latitude},${longitude}`,

        "_blank"

    );

};