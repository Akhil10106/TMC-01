let teachers = [];
let assignments = [];
let currentYear = new Date().getFullYear().toString();
let subjectCodes = [];
let shifts = [];
let packetCodes = [];
let totalExamsOptions = [];

window.onload = function() {
    try {
        teachers = JSON.parse(localStorage.getItem("teachers")) || [];
        assignments = JSON.parse(localStorage.getItem("assignments")) || [];
        subjectCodes = JSON.parse(localStorage.getItem("subjectCodes")) || [];
        shifts = JSON.parse(localStorage.getItem("shifts")) || [];
        packetCodes = JSON.parse(localStorage.getItem("packetCodes")) || [];
        totalExamsOptions = JSON.parse(localStorage.getItem("totalExamsOptions")) || [];
        
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        const themeSelect = document.getElementById("themeSelect");
        if (themeSelect) themeSelect.value = savedTheme;
        else console.error("Theme select element not found!");
        
        console.log("Initial load - Teachers:", teachers);
        console.log("Initial load - Assignments:", assignments);
        
        loadTeachers();
        loadAssignments();
    } catch (e) {
        console.error("Error initializing data:", e);
        teachers = [];
        assignments = [];
        subjectCodes = [];
        shifts = [];
        packetCodes = [];
        totalExamsOptions = [];
    }
};

function changeTheme() {
    try {
        const themeSelect = document.getElementById("themeSelect");
        if (!themeSelect) throw new Error("Theme select element not found");
        const theme = themeSelect.value;
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        console.log("Theme changed to:", theme);
    } catch (e) {
        console.error("Error changing theme:", e);
    }
}

function closeTab() {
    try {
        if (confirm("Are you sure you want to close without saving?")) {
            const tabOverlay = document.getElementById("tabOverlay");
            if (!tabOverlay) throw new Error("Tab overlay not found");
            tabOverlay.style.display = "none";
            tabOverlay.innerHTML = "";
            console.log("Tab closed");
        }
    } catch (e) {
        console.error("Error closing tab:", e);
    }
}

function showTeacherForm() {
    try {
        const form = `
            <form id="teacherForm">
                <button class="close-btn" onclick="closeTab()">✕</button>
                <h3>Add Teacher</h3>
                <label>Add Teacher Name</label>
                <input type="text" id="teacherName" placeholder="Name">
                <label>Add Teacher Email</label>
                <input type="email" id="teacherEmail" placeholder="Email">
                <label>Add Teacher Phone</label>
                <input type="text" id="teacherPhone" placeholder="Phone">
                <button type="button" id="saveTeacherBtn">Save Teacher</button>
            </form>`;
        const tabOverlay = document.getElementById("tabOverlay");
        if (!tabOverlay) throw new Error("Tab overlay not found");
        tabOverlay.innerHTML = form;
        tabOverlay.style.display = "flex";
        console.log("Teacher form displayed");

        const saveBtn = document.getElementById("saveTeacherBtn");
        if (saveBtn) saveBtn.addEventListener("click", addTeacher);
        else console.error("Save teacher button not found!");
    } catch (e) {
        console.error("Error showing teacher form:", e);
    }
}

function addTeacher() {
    try {
        const nameEl = document.getElementById("teacherName");
        const emailEl = document.getElementById("teacherEmail");
        const phoneEl = document.getElementById("teacherPhone");
        
        if (!nameEl || !emailEl || !phoneEl) throw new Error("Teacher form elements missing");
        
        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const phone = phoneEl.value.trim();
        
        if (!name || !email) {
            console.error("Validation failed - Name or Email missing");
            alert("Name and Email are required!");
            return;
        }
        
        const teacher = { id: "t" + (teachers.length + 1), name, email, phone };
        console.log("Adding teacher:", teacher);
        
        teachers.push(teacher);
        localStorage.setItem("teachers", JSON.stringify(teachers));
        console.log("Teachers updated:", teachers);
        
        closeTab();
        loadTeachers();
    } catch (e) {
        console.error("Error adding teacher:", e);
        alert("Failed to save teacher. Check console for details.");
    }
}

function editTeacher(id) {
    try {
        const teacher = teachers.find(t => t.id === id);
        if (!teacher) throw new Error(`Teacher with ID ${id} not found`);
        
        const form = `
            <form id="editTeacherForm">
                <button class="close-btn" onclick="closeTab()">✕</button>
                <h3>Edit Teacher</h3>
                <label>Edit Teacher Name</label>
                <input type="text" id="editTeacherName" value="${teacher.name}">
                <label>Edit Teacher Email</label>
                <input type="email" id="editTeacherEmail" value="${teacher.email}">
                <label>Edit Teacher Phone</label>
                <input type="text" id="editTeacherPhone" value="${teacher.phone}">
                <button type="button" id="saveEditTeacherBtn">Save Changes</button>
            </form>`;
        const tabOverlay = document.getElementById("tabOverlay");
        if (!tabOverlay) throw new Error("Tab overlay not found");
        tabOverlay.innerHTML = form;
        tabOverlay.style.display = "flex";
        console.log("Edit teacher form displayed for ID:", id);

        const saveBtn = document.getElementById("saveEditTeacherBtn");
        if (saveBtn) saveBtn.addEventListener("click", () => saveTeacherEdit(id));
        else console.error("Save edit teacher button not found!");
    } catch (e) {
        console.error("Error editing teacher:", e);
    }
}

function saveTeacherEdit(id) {
    try {
        const nameEl = document.getElementById("editTeacherName");
        const emailEl = document.getElementById("editTeacherEmail");
        const phoneEl = document.getElementById("editTeacherPhone");
        
        if (!nameEl || !emailEl || !phoneEl) throw new Error("Edit teacher form elements missing");
        
        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const phone = phoneEl.value.trim();
        
        if (!name || !email) {
            console.error("Validation failed - Name or Email missing");
            alert("Name and Email are required!");
            return;
        }
        
        const teacherIndex = teachers.findIndex(t => t.id === id);
        if (teacherIndex === -1) throw new Error(`Teacher index not found for ID ${id}`);
        
        teachers[teacherIndex] = { id, name, email, phone };
        console.log("Teacher updated:", teachers[teacherIndex]);
        
        localStorage.setItem("teachers", JSON.stringify(teachers));
        closeTab();
        loadTeachers();
        loadAssignments();
    } catch (e) {
        console.error("Error saving teacher edit:", e);
        alert("Failed to save changes. Check console for details.");
    }
}

function deleteTeacher(id) {
    try {
        if (confirm("Are you sure? This will also delete all assignments for this teacher.")) {
            teachers = teachers.filter(t => t.id !== id);
            assignments = assignments.filter(a => a.teacherId !== id);
            localStorage.setItem("teachers", JSON.stringify(teachers));
            localStorage.setItem("assignments", JSON.stringify(assignments));
            console.log("Teacher deleted, ID:", id);
            loadTeachers();
            loadAssignments();
        }
    } catch (e) {
        console.error("Error deleting teacher:", e);
        alert("Failed to delete teacher. Check console for details.");
    }
}

function loadTeachers() {
    try {
        const tableBody = document.querySelector("#teacherTable tbody");
        if (!tableBody) throw new Error("Teacher table body not found");
        
        tableBody.innerHTML = "";
        teachers.forEach(teacher => {
            const row = `<tr>
                <td data-label="Name">${teacher.name}</td>
                <td data-label="Email">${teacher.email}</td>
                <td data-label="Phone">${teacher.phone}</td>
                <td data-label="Actions">
                    <button class="action-btn edit-btn" onclick="editTeacher('${teacher.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteTeacher('${teacher.id}')">Delete</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        });
        console.log("Teachers loaded:", teachers.length);
    } catch (e) {
        console.error("Error loading teachers:", e);
    }
}

function showSetupForm() {
    try {
        const form = `
            <form id="setupForm">
                <button class="close-btn" onclick="closeTab()">✕</button>
                <h3>Setup Options</h3>
                <label>Select Subject Code</label>
                <input type="text" id="subjectCodesInput" placeholder="e.g., MATH101, ENG102" value="${subjectCodes.join(", ")}">
                <label>Select Shift</label>
                <input type="text" id="shiftsInput" placeholder="e.g., Morning, Afternoon" value="${shifts.join(", ")}">
                <label>Select Packet Code</label>
                <input type="text" id="packetCodesInput" placeholder="e.g., P001, P002" value="${packetCodes.join(", ")}">
                <label>Select Total Exams</label>
                <input type="text" id="totalExamsInput" placeholder="e.g., 25, 50, 100" value="${totalExamsOptions.join(", ")}">
                <button type="button" id="saveSetupBtn">Save Options</button>
            </form>`;
        const tabOverlay = document.getElementById("tabOverlay");
        if (!tabOverlay) throw new Error("Tab overlay not found");
        tabOverlay.innerHTML = form;
        tabOverlay.style.display = "flex";
        console.log("Setup form displayed");

        const saveBtn = document.getElementById("saveSetupBtn");
        if (saveBtn) saveBtn.addEventListener("click", saveSetup);
        else console.error("Save setup button not found!");
    } catch (e) {
        console.error("Error showing setup form:", e);
    }
}

function saveSetup() {
    try {
        const subjectCodesEl = document.getElementById("subjectCodesInput");
        const shiftsEl = document.getElementById("shiftsInput");
        const packetCodesEl = document.getElementById("packetCodesInput");
        const totalExamsEl = document.getElementById("totalExamsInput");
        
        if (!subjectCodesEl || !shiftsEl || !packetCodesEl || !totalExamsEl) throw new Error("Setup form elements missing");
        
        subjectCodes = subjectCodesEl.value.split(",").map(s => s.trim()).filter(s => s);
        shifts = shiftsEl.value.split(",").map(s => s.trim()).filter(s => s);
        packetCodes = packetCodesEl.value.split(",").map(s => s.trim()).filter(s => s);
        totalExamsOptions = totalExamsEl.value.split(",").map(s => s.trim()).filter(s => s);
        
        localStorage.setItem("subjectCodes", JSON.stringify(subjectCodes));
        localStorage.setItem("shifts", JSON.stringify(shifts));
        localStorage.setItem("packetCodes", JSON.stringify(packetCodes));
        localStorage.setItem("totalExamsOptions", JSON.stringify(totalExamsOptions));
        console.log("Setup saved:", { subjectCodes, shifts, packetCodes, totalExamsOptions });
        
        closeTab();
    } catch (e) {
        console.error("Error saving setup:", e);
        alert("Failed to save setup options. Check console for details.");
    }
}

function showAssignmentForm(assignmentId = null) {
    try {
        let teacherOptions = '<option value="">Select Teacher</option>';
        teachers.forEach(teacher => {
            teacherOptions += `<option value="${teacher.id}">${teacher.name} (${teacher.id})</option>`;
        });

        let subjectCodeOptions = '<option value="">Select Subject Code</option>';
        subjectCodes.forEach(code => {
            subjectCodeOptions += `<option value="${code}">${code}</option>`;
        });

        let shiftOptions = '<option value="">Select Shift</option>';
        shifts.forEach(shift => {
            shiftOptions += `<option value="${shift}">${shift}</option>`;
        });

        let packetCodeOptions = '<option value="">Select Packet Code</option>';
        packetCodes.forEach(code => {
            packetCodeOptions += `<option value="${code}">${code}</option>`;
        });

        let totalExamsOptionsHtml = '<option value="">Select Total Exams</option>';
        totalExamsOptions.forEach(num => {
            totalExamsOptionsHtml += `<option value="${num}">${num}</option>`;
        });

        const assignment = assignmentId ? assignments.find(a => a.id === assignmentId) : null;
        const form = `
            <form id="assignForm">
                <button class="close-btn" onclick="closeTab()">✕</button>
                <h3>${assignment ? "Edit Task" : "Assign Task"}</h3>
                <label>Select Teacher</label>
                <select id="teacherId">${teacherOptions}</select>
                <label>Select Subject Code</label>
                <select id="subjectCode">${subjectCodeOptions}</select>
                <label>Select Shift</label>
                <select id="shift">${shiftOptions}</select>
                <label>Select Packet Code</label>
                <select id="packetCode">${packetCodeOptions}</select>
                <label>Select Total Exams</label>
                <select id="totalExams">${totalExamsOptionsHtml}</select>
                <label>Exam Type</label>
                <input type="text" id="examType" placeholder="Exam Type" value="${assignment ? assignment.examType : ""}">
                <label><input type="checkbox" id="isExternal" ${assignment && assignment.isExternal ? "checked" : ""}> External</label>
                <button type="button" id="saveAssignmentBtn">Save ${assignment ? "Changes" : "Assignment"}</button>
            </form>`;
        const tabOverlay = document.getElementById("tabOverlay");
        if (!tabOverlay) throw new Error("Tab overlay not found");
        tabOverlay.innerHTML = form;
        tabOverlay.style.display = "flex";
        console.log("Assignment form displayed, ID:", assignmentId);

        if (assignment) {
            const teacherIdEl = document.getElementById("teacherId");
            const subjectCodeEl = document.getElementById("subjectCode");
            const shiftEl = document.getElementById("shift");
            const packetCodeEl = document.getElementById("packetCode");
            const totalExamsEl = document.getElementById("totalExams");
            if (teacherIdEl) teacherIdEl.value = assignment.teacherId || "";
            if (subjectCodeEl) subjectCodeEl.value = assignment.subjectCode || "";
            if (shiftEl) shiftEl.value = assignment.shift || "";
            if (packetCodeEl) packetCodeEl.value = assignment.packetCode || "";
            if (totalExamsEl) totalExamsEl.value = assignment.totalExams || "";
        }

        const saveBtn = document.getElementById("saveAssignmentBtn");
        if (saveBtn) saveBtn.addEventListener("click", () => saveAssignment(assignmentId));
        else console.error("Save assignment button not found!");
    } catch (e) {
        console.error("Error showing assignment form:", e);
    }
}

function saveAssignment(assignmentId) {
    try {
        console.log("saveAssignment triggered with ID:", assignmentId);

        const teacherIdEl = document.getElementById("teacherId");
        const subjectCodeEl = document.getElementById("subjectCode");
        const shiftEl = document.getElementById("shift");
        const packetCodeEl = document.getElementById("packetCode");
        const totalExamsEl = document.getElementById("totalExams");
        const examTypeEl = document.getElementById("examType");
        const isExternalEl = document.getElementById("isExternal");

        if (!teacherIdEl || !subjectCodeEl || !shiftEl || !packetCodeEl || !totalExamsEl || !examTypeEl || !isExternalEl) {
            throw new Error("Assignment form elements missing");
        }

        const teacherId = teacherIdEl.value;
        const subjectCode = subjectCodeEl.value;
        const shift = shiftEl.value;
        const packetCode = packetCodeEl.value;
        const totalExams = totalExamsEl.value;
        const examType = examTypeEl.value.trim();
        const isExternal = isExternalEl.checked;

        console.log("Form values:", { teacherId, subjectCode, shift, packetCode, totalExams, examType, isExternal });

        if (!teacherId || !subjectCode || !shift || !packetCode || !totalExams || !examType) {
            console.error("Validation failed - Missing required fields");
            alert("All fields are required!");
            return;
        }

        const assignment = {
            id: assignmentId || "a" + (assignments.length + 1),
            teacherId,
            subjectCode,
            shift,
            packetCode,
            totalExams: parseInt(totalExams) || 0,
            examType,
            isExternal,
            date: new Date().toISOString().split("T")[0],
            year: currentYear
        };

        console.log("Assignment to save:", assignment);

        if (assignmentId) {
            const index = assignments.findIndex(a => a.id === assignmentId);
            if (index !== -1) {
                assignments[index] = assignment;
                console.log("Updated assignment at index:", index);
            } else {
                throw new Error(`Assignment ID ${assignmentId} not found`);
            }
        } else {
            assignments.push(assignment);
            console.log("Added new assignment. Total:", assignments.length);
        }

        localStorage.setItem("assignments", JSON.stringify(assignments));
        console.log("localStorage updated:", JSON.parse(localStorage.getItem("assignments")));
        
        closeTab();
        loadAssignments();
    } catch (e) {
        console.error("Error saving assignment:", e);
        alert("Failed to save assignment. Check console for details.");
    }
}

function editAssignment(id) {
    try {
        console.log("Editing assignment with ID:", id);
        showAssignmentForm(id);
    } catch (e) {
        console.error("Error editing assignment:", e);
    }
}

function deleteAssignment(id) {
    try {
        if (confirm("Are you sure you want to delete this assignment?")) {
            assignments = assignments.filter(a => a.id !== id);
            localStorage.setItem("assignments", JSON.stringify(assignments));
            console.log("Assignment deleted, ID:", id);
            loadAssignments();
        }
    } catch (e) {
        console.error("Error deleting assignment:", e);
        alert("Failed to delete assignment. Check console for details.");
    }
}

function loadAssignments() {
    try {
        const tableBody = document.querySelector("#assignmentTable tbody");
        if (!tableBody) throw new Error("Assignment table body not found");
        
        tableBody.innerHTML = "";
        console.log("Rendering assignments:", assignments);
        
        if (assignments.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='8'>No assignments found.</td></tr>";
        } else {
            assignments.forEach(assignment => {
                const teacher = teachers.find(t => t.id === assignment.teacherId)?.name || "Unknown";
                const row = `<tr>
                    <td data-label="Teacher">${teacher}</td>
                    <td data-label="Subject">${assignment.subjectCode}</td>
                    <td data-label="Shift">${assignment.shift}</td>
                    <td data-label="Packet">${assignment.packetCode}</td>
                    <td data-label="Exams">${assignment.totalExams}</td>
                    <td data-label="Type">${assignment.examType}</td>
                    <td data-label="External">${assignment.isExternal ? "Yes" : "No"}</td>
                    <td data-label="Actions">
                        <button class="action-btn edit-btn" onclick="editAssignment('${assignment.id}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteAssignment('${assignment.id}')">Delete</button>
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        }
    } catch (e) {
        console.error("Error loading assignments:", e);
    }
}

function showRecords() {
    try {
        const recordsDiv = document.getElementById("records");
        const tableBody = document.querySelector("#recordsTable tbody");
        if (!recordsDiv || !tableBody) throw new Error("Records elements not found");
        
        tableBody.innerHTML = "";
        
        const records = assignments.reduce((acc, a) => {
            const key = `${a.year}-${a.teacherId}-${a.subjectCode}`;
            acc[key] = acc[key] || { 
                year: a.year, 
                teacher: teachers.find(t => t.id === a.teacherId)?.name || "Unknown", 
                subject: a.subjectCode, 
                exams: 0 
            };
            acc[key].exams += a.totalExams;
            return acc;
        }, {});

        Object.values(records).forEach(r => {
            tableBody.innerHTML += `<tr>
                <td data-label="Year">${r.year}</td>
                <td data-label="Teacher">${r.teacher}</td>
                <td data-label="Subject">${r.subject}</td>
                <td data-label="Exams">${r.exams}</td>
            </tr>`;
        });

        recordsDiv.style.display = recordsDiv.style.display === "block" ? "none" : "block";
        console.log("Records displayed");
    } catch (e) {
        console.error("Error showing records:", e);
    }
}
