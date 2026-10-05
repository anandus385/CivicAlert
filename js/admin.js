import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const ADMIN_EMAIL = "admin@civicalert1.com";

const container = document.getElementById("complaintsContainer");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let complaints = [];

// ==============================
// Check Admin Login
// ==============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    if (user.email !== ADMIN_EMAIL) {

        alert("Access Denied!");

        window.location.href = "dashboard.html";

        return;

    }

    // Load Area Code
    await loadAreaCode();

    // Load Complaints
    await loadComplaints();

});
// =======================================
// Load Current Area Code
// =======================================

async function loadAreaCode() {

    try {

        const docRef = doc(db, "areaCodes", "main");

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

            document.getElementById("newAreaCode").value =
                docSnap.data().code;

        }

    }

    catch(error){

        console.error(error);

    }

}
// ==============================
// Update Area Access Code
// ==============================

document.getElementById("updateCodeBtn").addEventListener("click", async () => {

    const newCode = document
        .getElementById("newAreaCode")
        .value
        .trim();

    if (newCode === "") {

        alert("Please enter an Area Access Code.");

        return;

    }

    try {

        await setDoc(doc(db, "areaCodes", "main"), {

            code: newCode

        });

        alert("✅ Area Access Code Updated Successfully!");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
// ==============================
// Load Complaints
// ==============================

async function loadComplaints() {

    complaints = [];

    const snapshot = await getDocs(collection(db, "complaints"));

    let total = 0;
    let pending = 0;
    let progress = 0;
    let fixed = 0;

    snapshot.forEach((document) => {

        const data = document.data();

        complaints.push({
            id: document.id,
            ...data
        });

        total++;

        if (data.status === "Pending") pending++;
        else if (data.status === "In Progress") progress++;
        else if (data.status === "Fixed") fixed++;

    });

    document.getElementById("totalComplaints").textContent = total;
    document.getElementById("pendingCount").textContent = pending;
    document.getElementById("progressCount").textContent = progress;
    document.getElementById("fixedCount").textContent = fixed;

    displayComplaints(complaints);

}

// ==============================
// Display Complaints
// ==============================

function displayComplaints(list) {

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <h2>No Complaints Found</h2>
            </div>
        `;

        return;

    }

    list.forEach((data) => {

        let badgeClass = "pending";

        if (data.status === "In Progress")
            badgeClass = "progress";

        if (data.status === "Fixed")
            badgeClass = "fixed";

        let complaintDate = "N/A";

        if (data.createdAt && data.createdAt.toDate) {

            complaintDate =
                data.createdAt.toDate().toLocaleString();

        }

        container.innerHTML += `

        <div class="card">

            <h3>${data.title}</h3>

            <p><strong>User :</strong> ${data.userEmail}</p>

            <p><strong>Category :</strong> ${data.category}</p>

            <p><strong>Description :</strong> ${data.description}</p>

            <p>
    <strong>Location:</strong>
    ${data.location}
</p>

<a
    href="https://www.google.com/maps?q=${data.latitude},${data.longitude}"
    target="_blank"
    style="
        color:#1565c0;
        text-decoration:none;
        font-weight:bold;
    ">
    📍 View on Google Maps
</a>

            <p><strong>Latitude :</strong> ${data.latitude || "-"}</p>

            <p><strong>Longitude :</strong> ${data.longitude || "-"}</p>

            <p><strong>Image :</strong> ${data.imageName || "No Image"}</p>

            <p><strong>Submitted :</strong> ${complaintDate}</p>

            <span class="badge ${badgeClass}">
                ${data.status}
            </span>

            <div class="update-section">

                <select id="${data.id}">

                    <option value="Pending" ${data.status==="Pending"?"selected":""}>Pending</option>

                    <option value="In Progress" ${data.status==="In Progress"?"selected":""}>In Progress</option>

                    <option value="Fixed" ${data.status==="Fixed"?"selected":""}>Fixed</option>

                </select>

                <button
                    class="updateBtn"
                    data-id="${data.id}">
                    Update
                </button>

            </div>

        </div>

        `;

    });

    document.querySelectorAll(".updateBtn").forEach((button) => {

        button.addEventListener("click", async () => {

            const id = button.dataset.id;

            const status =
                document.getElementById(id).value;

            await updateDoc(doc(db, "complaints", id), {

                status: status

            });

            alert("Status Updated Successfully!");

            loadComplaints();

        });

    });

}

// ==============================
// Search
// ==============================

searchInput.addEventListener("input", filterComplaints);

// ==============================
// Filter
// ==============================

statusFilter.addEventListener("change", filterComplaints);

function filterComplaints() {

    const search =
        searchInput.value.toLowerCase();

    const status =
        statusFilter.value;

    const filtered = complaints.filter((item) => {

        const matchesSearch =

            item.title.toLowerCase().includes(search) ||

            item.category.toLowerCase().includes(search) ||

            item.userEmail.toLowerCase().includes(search);

        const matchesStatus =

            status === "All" ||

            item.status === status;

        return matchesSearch && matchesStatus;

    });

    displayComplaints(filtered);

}

// ==============================
// Logout
// ==============================

document.getElementById("logoutBtn").addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});