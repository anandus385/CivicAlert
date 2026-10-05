// ===============================
// Firebase Imports
// ===============================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ===============================
// Check Login
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    try {

        // ===============================
        // Load User Profile
        // ===============================

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            const data = userSnap.data();

            document.getElementById("userName").textContent =
                data.name;

            document.getElementById("profileName").textContent =
                data.name;

            document.getElementById("profileEmail").textContent =
                data.email;

            document.getElementById("profilePhone").textContent =
                data.phone;

        }

        // ===============================
        // Load Complaint Statistics
        // ===============================

        loadChart(user.uid);

    }

    catch (error) {

        console.error(error);

    }

});


// ===============================
// Logout
// ===============================

document.getElementById("logoutBtn").addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    }

    catch (error) {

        alert(error.message);

    }

});



// ===============================
// Complaint Analytics
// ===============================

async function loadChart(userId) {

    let pending = 0;
    let progress = 0;
    let fixed = 0;

    const q = query(

        collection(db, "complaints"),

        where("userId", "==", userId)

    );

    const snapshot = await getDocs(q);

    snapshot.forEach((document) => {

        const data = document.data();

        if (data.status === "Pending") {

            pending++;

        }

        else if (data.status === "In Progress") {

            progress++;

        }

        else if (data.status === "Fixed") {

            fixed++;

        }

    });

    const ctx = document.getElementById("complaintChart");

    new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [

                "Pending",

                "In Progress",

                "Fixed"

            ],

            datasets: [

                {

                    data: [

                        pending,

                        progress,

                        fixed

                    ],

                    backgroundColor: [

                        "#ff9800",

                        "#2196f3",

                        "#4caf50"

                    ],

                    borderWidth: 2

                }

            ]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}