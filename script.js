let teachers = JSON.parse(localStorage.getItem("teachers")) || [];
let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
let currentYear = new Date().getFullYear().toString();
let subjectCodes = JSON.parse(localStorage.getItem("subjectCodes")) || [];
let shifts = JSON.parse(localStorage.getItem("shifts")) || [];
let packetCodes = JSON.parse(localStorage.getItem("packetCodes")) || [];
let totalExamsOptions = JSON.parse(localStorage.getItem("totalExamsOptions")) || [];

window.onload = function() {
    loadTeachers();
    loadAssignments();
};

function closeTab() {
    const tabOverlay = document.getElementById("tabOverlay");
    tabOverlay.style.display = "none";
    tabOverlay.innerHTML = "";
}

function showTeacherForm() {
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
            <button type="button" onclick="addTeacher()">Save Teacher</button>
        </form>`;
    const tabOverlay = document.getElementById("tabOverlay");
    tabOverlay.innerHTML = form;
    tabOverlay.style.display = "flex";
}

function addTeacher() {
    const teacher = {
        id: "t" + (teachers.length + 1),
        name: document.getElementById("teacherName").value,
        email: document.getElementById("teacherEmail").value,
        phone: document.getElementById("teacherPhone").value
    };
    teachers.push(teacher);
    localStorage.setItem("teachers", JSON.stringify(teachers));
    closeTab();
    loadTeachers();
}

function editTeacher(id) {
    const teacher = teachers.find(t => t.id === id);
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
            <button type="button" onclick="saveTeacherEdit('${id}')">Save Changes</button>
        </form>`;
    const tabOverlay = document.getElementById("tabOverlay");
    tabOverlay.innerHTML = form;
    tabOverlay.style.display = "flex";
}

function saveTeacherEdit(id) {
    const teacherIndex = teachers.findIndex(t => t.id === id);
    teachers[teacherIndex] = {
        id: id,
        name: document.getElementById("editTeacherName").value,
        email: document.getElementById("editTeacherEmail").value,
        phone: document.getElementById("editTeacherPhone").value
    };
    localStorage.setItem("teachers", JSON.stringify(teachers));
    closeTab();
    loadTeachers();
    loadAssignments();
}

function deleteTeacher(id) {
    if (confirm("Are you sure? This will also delete all assignments for this teacher.")) {
        teachers = teachers.filter(t => t.id !== id);
        assignments = assignments.filter(a => a.teacherId !== id);
        localStorage.setItem("teachers", JSON.stringify(teachers));
        localStorage.setItem("assignments", JSON.stringify(assignments));
        loadTeachers();
        loadAssignments();
    }
}

function loadTeachers() {
    const tableBody = document.querySelector("#teacherTable tbody");
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
}

function showSetupForm() {
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
            <button type="button" onclick="saveSetup()">Save Options</button>
        </form>`;
    const tabOverlay = document.getElementById("tabOverlay");
    tabOverlay.innerHTML = form;
    tabOverlay.style.display = "flex";
}

function saveSetup() {
    subjectCodes = document.getElementById("subjectCodesInput").value.split(",").map(s => s.trim());
    shifts = document.getElementById("shiftsInput").value.split(",").map(s => s.trim());
    packetCodes = document.getElementById("packetCodesInput").value.split(",").map(s => s.trim());
    totalExamsOptions = document.getElementById("totalExamsInput").value.split(",").map(s => s.trim());
    localStorage.setItem("subjectCodes", JSON.stringify(subjectCodes));
    localStorage.setItem("shifts", JSON.stringify(shifts));
    localStorage.setItem("packetCodes", JSON.stringify(packetCodes));
    localStorage.setItem("totalExamsOptions", JSON.stringify(totalExamsOptions));
    closeTab();
}

function showAssignmentForm(assignmentId = null) {
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
            <button type="button" onclick="saveAssignment('${assignment ? assignment.id : null}')">Save ${assignment ? "Changes" : "Assignment"}</button>
        </form>`;
    const tabOverlay = document.getElementById("tabOverlay");
    tabOverlay.innerHTML = form;
    tabOverlay.style.display = "flex";

    if (assignment) {
        document.getElementById("teacherId").value = assignment.teacherId;
        document.getElementById("subjectCode").value = assignment.subjectCode;
        document.getElementById("shift").value = assignment.shift;
        document.getElementById("packetCode").value = assignment.packetCode;
        document.getElementById("totalExams").value = assignment.totalExams;
    }
}

function saveAssignment(assignmentId) {
    const assignment = {
        id: assignmentId || "a" + (assignments.length + 1),
        teacherId: document.getElementById("teacherId").value,
        subjectCode: document.getElementById("subjectCode").value,
        shift: document.getElementById("shift").value,
        packetCode: document.getElementById("packetCode").value,
        totalExams: parseInt(document.getElementById("totalExams").value) || 0,
        examType: document.getElementById("examType").value,
        isExternal: document.getElementById("isExternal").checked,
        date: new Date().toISOString().split("T")[0],
        year: currentYear
    };

    if (assignmentId) {
        const index = assignments.findIndex(a => a.id === assignmentId);
        assignments[index] = assignment;
    } else {
        assignments.push(assignment);
    }

    localStorage.setItem("assignments", JSON.stringify(assignments));
    closeTab();
    loadAssignments();
}

function editAssignment(id) {
    showAssignmentForm(id);
}

function deleteAssignment(id) {
    if (confirm("Are you sure you want to delete this assignment?")) {
        assignments = assignments.filter(a => a.id !== id);
        localStorage.setItem("assignments", JSON.stringify(assignments));
        loadAssignments();
    }
}

function loadAssignments() {
    const tableBody = document.querySelector("#assignmentTable tbody");
    tableBody.innerHTML = "";
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

function showRecords() {
    const recordsDiv = document.getElementById("records");
    recordsDiv.style.display = recordsDiv.style.display === "block" ? "none" : "block";
}
