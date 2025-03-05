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
        
        console.log("Initial load - Teachers:", teachers);
        console.log("Initial load - Assignments:", assignments);
        
        loadTeachers();
        loadAssignments();
        loadAnalytics();
        updateFormOptions();
        document.getElementById("saveTeacherBtn").addEventListener("click", addTeacher);
        document.getElementById("saveSetupBtn").addEventListener("click", saveSetup);
        document.getElementById("saveAssignmentBtn").addEventListener("click", () => saveAssignment(null));
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

function showNotification(message, type = "success") {
    try {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        console.log("Notification shown:", message);
    } catch (e) {
        console.error("Error showing notification:", e);
    }
}

function toggleSection(sectionId) {
    try {
        const section = document.getElementById(sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);
        const isVisible = section.style.display === "block";
        document.querySelectorAll(".form-section, .data-section").forEach(s => s.style.display = "none");
        section.style.display = isVisible ? "none" : "block";
        console.log(`Toggled section ${sectionId} to ${isVisible ? "hidden" : "visible"}`);
    } catch (e) {
        console.error("Error toggling section:", e);
    }
}

function updateFormOptions() {
    try {
        const teacherIdEl = document.getElementById("teacherId");
        const subjectCodeEl = document.getElementById("subjectCode");
        const shiftEl = document.getElementById("shift");
        const packetCodeEl = document.getElementById("packetCode");
        const totalExamsEl = document.getElementById("totalExams");
        const filterTeacherEl = document.getElementById("filterTeacher");

        if (!teacherIdEl || !subjectCodeEl || !shiftEl || !packetCodeEl || !totalExamsEl || !filterTeacherEl) throw new Error("Form options elements missing");

        teacherIdEl.innerHTML = '<option value="">Select Teacher</option>' + teachers.map(t => `<option value="${t.id}">${t.name} (${t.id})</option>`).join("");
        subjectCodeEl.innerHTML = '<option value="">Select Subject Code</option>' + subjectCodes.map(c => `<option value="${c}">${c}</option>`).join("");
        shiftEl.innerHTML = '<option value="">Select Shift</option>' + shifts.map(s => `<option value="${s}">${s}</option>`).join("");
        packetCodeEl.innerHTML = '<option value="">Select Packet Code</option>' + packetCodes.map(p => `<option value="${p}">${p}</option>`).join("");
        totalExamsEl.innerHTML = '<option value="">Select Total Exams</option>' + totalExamsOptions.map(t => `<option value="${t}">${t}</option>`).join("");
        filterTeacherEl.innerHTML = '<option value="">All Teachers</option>' + teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join("");

        document.getElementById("subjectCodesInput").value = subjectCodes.join(", ");
        document.getElementById("shiftsInput").value = shifts.join(", ");
        document.getElementById("packetCodesInput").value = packetCodes.join(", ");
        document.getElementById("totalExamsInput").value = totalExamsOptions.join(", ");
    } catch (e) {
        console.error("Error updating form options:", e);
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
        
        nameEl.value = "";
        emailEl.value = "";
        phoneEl.value = "";
        loadTeachers();
        updateFormOptions();
        showNotification("Teacher added successfully!");
    } catch (e) {
        console.error("Error adding teacher:", e);
        alert("Failed to save teacher. Check console for details.");
    }
}

function editTeacher(id) {
    try {
        const teacher = teachers.find(t => t.id === id);
        if (!teacher) throw new Error(`Teacher with ID ${id} not found`);
        
        toggleSection("teacherFormSection");
        const nameEl = document.getElementById("teacherName");
        const emailEl = document.getElementById("teacherEmail");
        const phoneEl = document.getElementById("teacherPhone");
        const saveBtn = document.getElementById("saveTeacherBtn");
        
        nameEl.value = teacher.name;
        emailEl.value = teacher.email;
        phoneEl.value = teacher.phone;
        saveBtn.textContent = "Save Changes";
        saveBtn.onclick = () => saveTeacherEdit(id);
    } catch (e) {
        console.error("Error editing teacher:", e);
    }
}

function saveTeacherEdit(id) {
    try {
        const nameEl = document.getElementById("teacherName");
        const emailEl = document.getElementById("teacherEmail");
        const phoneEl = document.getElementById("teacherPhone");
        
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
        nameEl.value = "";
        emailEl.value = "";
        phoneEl.value = "";
        document.getElementById("saveTeacherBtn").textContent = "Save Teacher";
        document.getElementById("saveTeacherBtn").onclick = addTeacher;
        toggleSection("teacherFormSection");
        loadTeachers();
        loadAssignments();
        updateFormOptions();
        showNotification("Teacher updated successfully!");
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
            updateFormOptions();
            showNotification("Teacher deleted successfully!");
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
        
        toggleSection("setupFormSection");
        updateFormOptions();
        showNotification("Setup options saved successfully!");
    } catch (e) {
        console.error("Error saving setup:", e);
        alert("Failed to save setup options. Check console for details.");
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
        const statusEl = document.getElementById("status");

        if (!teacherIdEl || !subjectCodeEl || !shiftEl || !packetCodeEl || !totalExamsEl || !examTypeEl || !isExternalEl || !statusEl) {
            throw new Error("Assignment form elements missing");
        }

        const teacherId = teacherIdEl.value;
        const subjectCode = subjectCodeEl.value;
        const shift = shiftEl.value;
        const packetCode = packetCodeEl.value;
        const totalExams = totalExamsEl.value;
        const examType = examTypeEl.value.trim();
        const isExternal = isExternalEl.checked;
        const status = statusEl.value;

        console.log("Form values:", { teacherId, subjectCode, shift, packetCode, totalExams, examType, isExternal, status });

        if (!teacherId || !subjectCode || !shift || !packetCode || !totalExams || !examType || !status) {
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
            status: status || "Assigned",
            date: new Date().toISOString().split("T")[0],
            year: currentYear,
            examReturned: assignmentId ? (assignments.find(a => a.id === assignmentId)?.examReturned || false) : false
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
        
        teacherIdEl.value = "";
        subjectCodeEl.value = "";
        shiftEl.value = "";
        packetCodeEl.value = "";
        totalExamsEl.value = "";
        examTypeEl.value = "";
        isExternalEl.checked = false;
        statusEl.value = "Assigned";
        toggleSection("assignmentFormSection");
        loadAssignments();
        loadAnalytics();
        showNotification("Assignment saved successfully!");
    } catch (e) {
        console.error("Error saving assignment:", e);
        alert("Failed to save assignment. Check console for details.");
    }
}

function updateExamReturnStatus(assignmentId) {
    try {
        const index = assignments.findIndex(a => a.id === assignmentId);
        if (index === -1) throw new Error(`Assignment ID ${assignmentId} not found`);
        
        assignments[index].examReturned = !assignments[index].examReturned;
        localStorage.setItem("assignments", JSON.stringify(assignments));
        console.log(`Exam return status updated for ID ${assignmentId}:`, assignments[index].examReturned);
        
        loadAssignments();
        loadAnalytics();
        showNotification(`Exams marked as ${assignments[index].examReturned ? "returned" : "unreturned"}!`);
    } catch (e) {
        console.error("Error updating exam return status:", e);
        alert("Failed to update exam return status. Check console for details.");
    }
}

function exportToCSV(type) {
    try {
        let csvContent = "data:text/csv;charset=utf-8,";
        let headers, rows;

        if (type === "teachers") {
            headers = "ID,Name,Email,Phone\n";
            rows = teachers.map(t => `${t.id},${t.name},${t.email},${t.phone}`).join("\n");
        } else if (type === "assignments") {
            headers = "ID,Teacher,Subject,Shift,Packet,Exams,Type,External,Status,Returned,Date,Year\n";
            rows = assignments.map(a => `${a.id},${teachers.find(t => t.id === a.teacherId)?.name || "Unknown"},${a.subjectCode},${a.shift},${a.packetCode},${a.totalExams},${a.examType},${a.isExternal},${a.status},${a.examReturned},${a.date},${a.year}`).join("\n");
        } else if (type === "records") {
            headers = "Year,Teacher,Subject,Total Exams\n";
            const records = assignments.reduce((acc, a) => {
                const key = `${a.year}-${a.teacherId}-${a.subjectCode}`;
                acc[key] = acc[key] || { year: a.year, teacher: teachers.find(t => t.id === a.teacherId)?.name || "Unknown", subject: a.subjectCode, exams: 0 };
                acc[key].exams += a.totalExams;
                return acc;
            }, {});
            rows = Object.values(records).map(r => `${r.year},${r.teacher},${r.subject},${r.exams}`).join("\n");
        } else {
            throw new Error("Invalid export type");
        }

        csvContent += headers + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${type}_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log(`${type} exported to CSV`);
        showNotification(`${type} exported successfully!`);
    } catch (e) {
        console.error("Error exporting to CSV:", e);
        alert("Failed to export data. Check console for details.");
    }
}

function editAssignment(id) {
    try {
        const assignment = assignments.find(a => a.id === id);
        if (!assignment) throw new Error(`Assignment with ID ${id} not found`);
        
        toggleSection("assignmentFormSection");
        const teacherIdEl = document.getElementById("teacherId");
        const subjectCodeEl = document.getElementById("subjectCode");
        const shiftEl = document.getElementById("shift");
        const packetCodeEl = document.getElementById("packetCode");
        const totalExamsEl = document.getElementById("totalExams");
        const examTypeEl = document.getElementById("examType");
        const isExternalEl = document.getElementById("isExternal");
        const statusEl = document.getElementById("status");
        const saveBtn = document.getElementById("saveAssignmentBtn");

        teacherIdEl.value = assignment.teacherId || "";
        subjectCodeEl.value = assignment.subjectCode || "";
        shiftEl.value = assignment.shift || "";
        packetCodeEl.value = assignment.packetCode || "";
        totalExamsEl.value = assignment.totalExams || "";
        examTypeEl.value = assignment.examType || "";
        isExternalEl.checked = assignment.isExternal || false;
        statusEl.value = assignment.status || "Assigned";
        saveBtn.textContent = "Save Changes";
        saveBtn.onclick = () => saveAssignment(id);
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
            loadAnalytics();
            showNotification("Assignment deleted successfully!");
        }
    } catch (e) {
        console.error("Error deleting assignment:", e);
        alert("Failed to delete assignment. Check console for details.");
    }
}

function loadAssignments() {
    try {
        const tableBody = document.querySelector("#assignmentTable tbody");
        const searchInput = document.getElementById("searchInput");
        const filterTeacher = document.getElementById("filterTeacher");
        const filterStatus = document.getElementById("filterStatus");
        if (!tableBody || !searchInput || !filterTeacher || !filterStatus) throw new Error("Assignment table or filter elements not found");

        let filteredAssignments = [...assignments];
        const searchTerm = searchInput.value.toLowerCase();
        const teacherFilter = filterTeacher.value;
        const statusFilter = filterStatus.value;

        if (searchTerm) {
            filteredAssignments = filteredAssignments.filter(a => 
                teachers.find(t => t.id === a.teacherId)?.name.toLowerCase().includes(searchTerm) ||
                a.subjectCode.toLowerCase().includes(searchTerm) ||
                a.examType.toLowerCase().includes(searchTerm)
            );
        }
        if (teacherFilter) {
            filteredAssignments = filteredAssignments.filter(a => a.teacherId === teacherFilter);
        }
        if (statusFilter) {
            filteredAssignments = filteredAssignments.filter(a => a.status === statusFilter);
        }

        tableBody.innerHTML = "";
        console.log("Rendering filtered assignments:", filteredAssignments);

        if (filteredAssignments.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='10'>No assignments found.</td></tr>";
        } else {
            filteredAssignments.forEach(assignment => {
                const teacher = teachers.find(t => t.id === assignment.teacherId)?.name || "Unknown";
                const row = `<tr>
                    <td data-label="Teacher">${teacher}</td>
                    <td data-label="Subject">${assignment.subjectCode}</td>
                    <td data-label="Shift">${assignment.shift}</td>
                    <td data-label="Packet">${assignment.packetCode}</td>
                    <td data-label="Exams">${assignment.totalExams}</td>
                    <td data-label="Type">${assignment.examType}</td>
                    <td data-label="External">${assignment.isExternal ? "Yes" : "No"}</td>
                    <td data-label="Status">${assignment.status}</td>
                    <td data-label="Returned">${assignment.examReturned ? "Yes" : "No"}</td>
                    <td data-label="Actions">
                        <button class="action-btn edit-btn" onclick="editAssignment('${assignment.id}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteAssignment('${assignment.id}')">Delete</button>
                        <button class="action-btn" onclick="updateExamReturnStatus('${assignment.id}')">${assignment.examReturned ? "Mark Unreturned" : "Mark Returned"}</button>
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        }
    } catch (e) {
        console.error("Error loading assignments:", e);
    }
}

function loadAnalytics() {
    try {
        const tableBody = document.querySelector("#analyticsTable tbody");
        if (!tableBody) throw new Error("Analytics table body not found");

        tableBody.innerHTML = "";
        const teacherStats = teachers.map(teacher => {
            const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
            const totalExams = teacherAssignments.reduce((sum, a) => sum + a.totalExams, 0);
            const completedExams = teacherAssignments.filter(a => a.status === "Completed").reduce((sum, a) => sum + a.totalExams, 0);
            return { name: teacher.name, totalExams, completedExams };
        });

        teacherStats.forEach(stat => {
            const row = `<tr>
                <td data-label="Teacher">${stat.name}</td>
                <td data-label="Total Exams">${stat.totalExams}</td>
                <td data-label="Completed Exams">${stat.completedExams}</td>
                <td data-label="Workload">${((stat.totalExams / (assignments.reduce((sum, a) => sum + a.totalExams, 0) || 1)) * 100).toFixed(2)}%</td>
            </tr>`;
            tableBody.innerHTML += row;
        });

        console.log("Analytics loaded");
    } catch (e) {
        console.error("Error loading analytics:", e);
    }
}

function showRecords() {
    try {
        const tableBody = document.querySelector("#recordsTable tbody");
        if (!tableBody) throw new Error("Records table body not found");
        
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

        console.log("Records displayed");
    } catch (e) {
        console.error("Error showing records:", e);
    }
}
