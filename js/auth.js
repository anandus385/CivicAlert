import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const password =
            document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;
            const areaCode =
    document.getElementById("areaCode").value.trim();

        // Check passwords
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
// Check Area Access Code

const codeRef = doc(db, "areaCodes", "main");

const codeSnap = await getDoc(codeRef);

if (!codeSnap.exists()) {

    alert("Area code not configured.");

    return;

}

const storedCode = codeSnap.data().code;

if (areaCode !== storedCode) {

    alert("Invalid Area Access Code.");

    return;

}
            // Create Firebase Authentication User
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            // Save Additional Details in Firestore
await setDoc(doc(db, "users", user.uid), {
    name: name,
    phone: phone,
    email: email,
    areaCode: areaCode,
    createdAt: new Date()
});
            alert("Registration Successful!");

            registerForm.reset();

            window.location.href = "login.html";

        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    });

}


const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value;

        const password = document.getElementById("loginPassword").value;

        try {

            // Login User
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            alert("Login Successful!");

            loginForm.reset();

            // Admin Login
            if (user.email === "admin@civicalert1.com") {

                window.location.href = "admin.html";

            } else {

                window.location.href = "dashboard.html";

            }

        } catch (error) {

            alert(error.message);
            console.error(error);

        }

    });

}