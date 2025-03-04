// Initialize data from localStorage or empty arrays
let teachers = JSON.parse(localStorage.getItem("teachers")) || [];
let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
let currentYear = new Date().getFullYear().toString();
let subjectCodes = JSON.parse(localStorage.getItem("subjectCodes")) || [];
let shifts = JSON.parse(localStorage.getItem("shifts")) || [];
let packetCodes = JSON.parse(localStorage.getItem("packetCodes")) || [];
let totalExamsOptions = JSON.parse(localStorage.getItem("totalExamsOptions")) || [];

// Load initial data
window.onload = function() {
    loadTeachers();
    loadAssignments();
};

function showTeacherForm() {
    const form = `
        <form id="teacherForm">
            <h3>Add Teacher</h3>
            <label>Add Teacher Name</label>
            <input type="text" id="teacherName" placeholder="Name">
            <label>Add Teacher Email</label>
            <input type="email" id="teacherEmail" placeholder="Email">
            <label>Add Teacher Phone</label>
            <input type="text" id="teacherPhone" placeholder="Phone">
            <button type="button" onclick="addTeacher()">Save Teacher</button>
        </form>`;
    document.getElementById("dashboard").innerHTML += form;
}

function addTeacher() {
    const teacher = {
        id: "t" + (teachers.length + 1),
        name: document.getElementById("teacherName").value,
        email: document.getElementById("teacherEmail").value,
        phone: document.getElementById("teacherPhone").value
    };
    teachers.push(teacher);
    localStorage.setItem("teachers", JSON.stringify(teachers)); // Save to localStorage
    document.getElementById("teacherForm").remove();
    loadTeachers();
}

function loadTeachers() {
    const tableBody = document.querySelector("#teacherTable tbody");
    tableBody.innerHTML = "";
    teachers.forEach(teacher => {
        const row = `<tr><td>${teacher.name}</td><td>${teacher.email}</td><td>${teacher.phone}</td></tr>`;
        tableBody.innerHTML += row;
    });
}

function showSetupForm() {
    const form = `
        <form id="setupForm">
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
    document.getElementById("dashboard").innerHTML += form;
}

function saveSetup() {
    subjectCodes = document.getElementById("subjectCodesInput").value.split(",").map(s => s.trim());
    shifts = document.getElementById("shiftsInput").value.split(",").map(s => s.trim());
    packetCodes = document.getElementById("packetCodesInput").value.split(",").map(s => s.trim());
    totalExamsOptions = document.getElementById("totalExamsInput").value.split(",").map(s => s.trim());
    
    // Save to localStorage
    localStorage.setItem("subjectCodes", JSON.stringify(subjectCodes));
    localStorage.setItem("shifts", JSON.stringify(shifts));
    localStorage.setItem("packetCodes", JSON.stringify(packetCodes));
    localStorage.setItem("totalExamsOptions", JSON.stringify(totalExamsOptions));
    
    document.getElementById("setupForm").remove();
    alert("Options saved!");
}

function showAssignmentForm() {
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

    const form = `
        <form id="assignForm">
            <h3>Assign Task</h3>
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
            <input type="text" id="examType" placeholder="Exam Type">
            <label><input type="checkbox" id="isExternal"> External</label>
            <button type="button" onclick="saveAssignment()">Save Assignment</button>
        </form>`;
    document.getElementById("dashboard").innerHTML += form;
}

function saveAssignment() {
    const assignment = {
        id: "a" + (assignments.length + 1),
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
    assignments.push(assignment);
    localStorage.setItem("assignments", JSON.stringify(assignments)); // Save to localStorage
    document.getElementById("assignForm").remove();
    loadAssignments();
}

function loadAssignments() {
    const tableBody = document.querySelector("#assignmentTable tbody");
    tableBody.innerHTML = "";
    assignments.forEach(assignment => {
        const teacher = teachers.find(t => t.id === assignment.teacherId)?.name || "Unknown";
        const row = `<tr>
            <td>${teacher}</td>
            <td>${assignment.subjectCode}</td>
            <td>${assignment.shift}</td>
            <td>${assignment.packetCode}</td>
            <td>${assignment.totalExams}</td>
            <td>${assignment.examType}</td>
            <td>${assignment.isExternal ? "Yes" : "No"}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function showRecords() {
    const recordsDiv = document.getElementById("records");
    recordsDiv.style.display = "block";
    const tableBody = document.querySelector("#recordsTable tbody");
    tableBody.innerHTML = "";
    assignments.forEach(assignment => {
        const teacher = teachers.find(t => t.id === assignment.teacherId)?.name || "Unknown";
        const row = `<tr>
            <td>${assignment.year}</td>
            <td>${teacher}</td>
            <td>${assignment.subjectCode}</td>
            <td>${assignment.totalExams}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}
