import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    where
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyAnolXD5R78VGCczSmVRXkCXVVVkoioXiY",
    authDomain: "todo-list-firebase-18758.firebaseapp.com",
    projectId: "todo-list-firebase-18758",
    storageBucket: "todo-list-firebase-18758.firebasestorage.app",
    messagingSenderId: "1000020399926",
    appId: "1:1000020399926:web:c00602280f34dff2acc597"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const tasksCollection = collection(db, "tasks");


const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");


let currentUser = null;


// Anonymous Authentication
signInAnonymously(auth)
    .then(() => {
        console.log("Anonymous authentication successful");
    })
    .catch((error) => {
        console.error("Authentication error:", error);
    });


// Wait for authentication
onAuthStateChanged(auth, (user) => {

    if (!user) {
        console.log("No authenticated user");
        return;
    }

    currentUser = user;

    console.log("User ID:", user.uid);


    const userTasksQuery = query(
        tasksCollection,
        where("userId", "==", user.uid)
    );


    onSnapshot(userTasksQuery, (snapshot) => {

        taskList.innerHTML = "";

        snapshot.forEach((document) => {

            const task = document.data();

            createTaskElement(
                document.id,
                task.title,
                task.done
            );

        });

        taskCount.textContent = snapshot.size;

    }, (error) => {

        console.error("Error loading tasks:", error);

    });

});


// Add task
addButton.addEventListener("click", async () => {

    const title = taskInput.value.trim();

    if (title === "" || !currentUser) {
        return;
    }

    try {

        await addDoc(tasksCollection, {

            title: title,
            done: false,
            createdAt: serverTimestamp(),
            userId: currentUser.uid

        });

        taskInput.value = "";

    } catch (error) {

        console.error("Error adding task:", error);

    }

});


// Add task with Enter
taskInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        addButton.click();
    }

});


// Create task element
function createTaskElement(id, title, done) {

    const taskDiv = document.createElement("div");

    taskDiv.className = "task";


    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = done;


    const titleSpan = document.createElement("span");

    titleSpan.className = "task-title";

    if (done) {
        titleSpan.classList.add("done");
    }

    titleSpan.textContent = title;


    // Mark as completed
    checkbox.addEventListener("change", async () => {

        try {

            await updateDoc(
                doc(db, "tasks", id),
                {
                    done: checkbox.checked
                }
            );

        } catch (error) {

            console.error(
                "Error updating task:",
                error
            );

        }

    });


    // Edit task
    const editButton = document.createElement("button");

    editButton.textContent = "Edit";
    editButton.className = "edit-button";


    editButton.addEventListener("click", async () => {

        const newTitle = prompt(
            "Edit task:",
            title
        );

        if (newTitle === null) {
            return;
        }

        const cleanedTitle = newTitle.trim();

        if (cleanedTitle === "") {
            return;
        }


        try {

            await updateDoc(
                doc(db, "tasks", id),
                {
                    title: cleanedTitle
                }
            );

        } catch (error) {

            console.error(
                "Error editing task:",
                error
            );

        }

    });


    // Delete task
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";


    deleteButton.addEventListener("click", async () => {

        try {

            await deleteDoc(
                doc(db, "tasks", id)
            );

        } catch (error) {

            console.error(
                "Error deleting task:",
                error
            );

        }

    });


    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(titleSpan);
    taskDiv.appendChild(editButton);
    taskDiv.appendChild(deleteButton);

    taskList.appendChild(taskDiv);

}