let teachers = [];
let assignments = [];
let exams = [];
let currentYear = new Date().getFullYear().toString();
let subjectCodes = [];
let shifts = [];
let packetCodes = [];
let totalExamsOptions = [];
let totalExamsChart, completedExamsChart, workloadChart;

window.onload = function() {
    try {
        teachers = JSON.parse(localStorage.getItem("teachers")) || [];
        assignments = JSON.parse(localStorage.getItem("assignments")) || [];
        exams = JSON.parse(localStorage.getItem("exams")) || [];
        subjectCodes = JSON.parse(localStorage.getItem("subjectCodes")) || [];
        shifts = JSON.parse(localStorage.getItem("shifts")) || [];
        packetCodes = JSON.parse(localStorage.getItem("packetCodes")) || [];
        totalExamsOptions = JSON.parse(localStorage.getItem("totalExamsOptions")) || [];

        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        const themeSelect = document.getElementById("themeSelect");
        if (themeSelect) themeSelect.value = savedTheme;

        console.log("Initial data loaded:", { teachers, assignments, exams });

        loadTeachers();
        loadAssignments();
        updateFormOptions();
        loadExamsIntoForm();

        document.getElementById("saveTeacherBtn").addEventListener("click", addTeacher);
        document.getElementById("saveSetupBtn").addEventListener("click", saveSetup);
        document.getElementById("saveAssignmentBtn").addEventListener("click", () => saveAssignment(null));
        document.getElementById("saveExamBtn").addEventListener("click", saveExam);
    } catch (e) {
        console.error("Error initializing data:", e);
        teachers = [];
        assignments = [];
        exams = [];
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

        // Remove the notification with slide-up animation after 3 seconds
        setTimeout(() => {
            notification.style.animation = "slideUp 0.5s ease forwards";
            notification.addEventListener("animationend", () => {
                notification.remove();
            });
        }, 3000);

        console.log("Notification shown:", message);
    } catch (e) {
        console.error("Error showing notification:", e);
    }
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const isVisible = section.style.display === "block";
    document.querySelectorAll(".form-section, .data-section").forEach(s => s.style.display = "none");
    section.style.display = isVisible ? "none" : "block";
    console.log(`Toggled section ${sectionId} to ${isVisible ? "hidden" : "visible"}`);
}

function updateFormOptions() {
    try {
        const teacherIdEl = document.getElementById("teacherId");
        const subjectCodeEl = document.getElementById("subjectCode");
        const shiftEl = document.getElementById("shift");
        const packetCodeEl = document.getElementById("packetCode");
        const filterTeacherEl = document.getElementById("filterTeacher");

        if (!teacherIdEl || !subjectCodeEl || !shiftEl || !packetCodeEl || !filterTeacherEl) 
            throw new Error("Form options elements missing");

        teacherIdEl.innerHTML = '<option value="">Select Teacher</option>' + 
            teachers.map(t => `<option value="${t.id}">${t.name} (${t.id})</option>`).join("");
        subjectCodeEl.innerHTML = '<option value="">Select Subject Code</option>' + 
            subjectCodes.map(c => `<option value="${c}">${c}</option>`).join("");
        shiftEl.innerHTML = '<option value="">Select Shift</option>' + 
            shifts.map(s => `<option value="${s}">${s}</option>`).join("");
        packetCodeEl.innerHTML = '<option value="">Select Packet Code</option>' + 
            packetCodes.map(p => `<option value="${p}">${p}</option>`).join("");
        filterTeacherEl.innerHTML = '<option value="">All Teachers</option>' + 
            teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join("");

        document.getElementById("subjectCodesInput").value = subjectCodes.join(", ");
        document.getElementById("shiftsInput").value = shifts.join(", ");
        document.getElementById("packetCodesInput").value = packetCodes.join(", ");
        document.getElementById("totalExamsInput").value = totalExamsOptions.join(", ");
        
        loadExamsIntoForm(); // Sync exam scheduler options
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
        teachers.push(teacher);
        localStorage.setItem("teachers", JSON.stringify(teachers));
        
        nameEl.value = "";
        emailEl.value = "";
        phoneEl.value = "";
        
        // Redirect to main page
        document.querySelectorAll(".form-section, .data-section").forEach(s => s.style.display = "none");
        document.querySelectorAll(".data-section").forEach(s => s.style.display = "block");
        
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
        if (confirm("Are you sure? This will also delete all assignments and exams for this teacher.")) {
            teachers = teachers.filter(t => t.id !== id);
            assignments = assignments.filter(a => a.teacherId !== id);
            exams = exams.filter(e => e.checkingTeacher === id);
            localStorage.setItem("teachers", JSON.stringify(teachers));
            localStorage.setItem("assignments", JSON.stringify(assignments));
            localStorage.setItem("exams", JSON.stringify(exams));
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
    const tableBody = document.querySelector("#teacherTable tbody");
    tableBody.innerHTML = "";
    teachers.forEach(teacher => {
        tableBody.innerHTML += `
            <tr>
                <td>${teacher.name}</td>
                <td>${teacher.email}</td>
                <td>${teacher.phone}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editTeacher('${teacher.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteTeacher('${teacher.id}')">Delete</button>
                </td>
            </tr>`;
    });
}

function markAssignmentCompleted(id) {
    try {
        const assignment = assignments.find(a => a.id === id);
        if (!assignment) throw new Error(`Assignment with ID ${id} not found`);
        
        if (assignment.status === "Completed") {
            showNotification("Assignment is already completed!", "error");
            return;
        }

        assignment.status = "Completed";
        localStorage.setItem("assignments", JSON.stringify(assignments));
        console.log(`Assignment ${id} marked as Completed`);
        
        loadAssignments();
        loadAnalytics(); // Update analytics to reflect the change
        showNotification("Assignment marked as completed!");
    } catch (e) {
        console.error("Error marking assignment completed:", e);
        alert("Failed to mark assignment as completed. Check console for details.");
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
        const teacherIdEl = document.getElementById("teacherId");
        const subjectCodeEl = document.getElementById("subjectCode");
        const shiftEl = document.getElementById("shift");
        const packetCodeEl = document.getElementById("packetCode");
        const totalExamsEl = document.getElementById("totalExams");
        const isExternalEl = document.getElementById("isExternal");
        const statusEl = document.getElementById("status");

        if (!teacherIdEl || !subjectCodeEl || !shiftEl || !packetCodeEl || !totalExamsEl || !isExternalEl || !statusEl) {
            throw new Error("Assignment form elements missing");
        }

        const teacherId = teacherIdEl.value;
        const subjectCode = subjectCodeEl.value;
        const shift = shiftEl.value;
        const packetCode = packetCodeEl.value;
        const totalExams = totalExamsEl.value;
        const isExternal = isExternalEl.checked;
        const status = statusEl.value;

        if (!teacherId || !subjectCode || !shift || !packetCode || !totalExams || !status) {
            console.error("Validation failed - Missing required fields");
            alert("All fields are required!");
            return;
        }

        const totalExamsNum = parseInt(totalExams);
        if (isNaN(totalExamsNum) || totalExamsNum <= 0) {
            console.error("Validation failed - Invalid total exams");
            alert("Total Exams must be a positive number!");
            return;
        }

        const assignment = {
            id: assignmentId || "a" + (assignments.length + 1),
            teacherId,
            subjectCode,
            shift,
            packetCode,
            totalExams: totalExamsNum,
            isExternal,
            status: status || "Assigned",
            date: new Date().toISOString().split("T")[0],
            year: currentYear,
            examReturned: assignmentId ? (assignments.find(a => a.id === assignmentId)?.examReturned || false) : false
        };

        if (assignmentId) {
            const index = assignments.findIndex(a => a.id === assignmentId);
            if (index !== -1) assignments[index] = assignment;
            else throw new Error(`Assignment ID ${assignmentId} not found`);
        } else {
            assignments.push(assignment);
        }

        localStorage.setItem("assignments", JSON.stringify(assignments));
        
        teacherIdEl.value = "";
        subjectCodeEl.value = "";
        shiftEl.value = "";
        packetCodeEl.value = "";
        totalExamsEl.value = "";
        isExternalEl.checked = false;
        statusEl.value = "Assigned";
        
        // Redirect to main page
        document.querySelectorAll(".form-section, .data-section").forEach(s => s.style.display = "none");
        document.querySelectorAll(".data-section").forEach(s => s.style.display = "block");
        
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
        } else if (type === "exams") {
            headers = "ID,Title,Subject,Shift,Date,CheckingTeacher,Deadline,Status\n";
            rows = exams.map(e => `${e.id},${e.title},${e.subject},${e.shift},${e.date},${teachers.find(t => t.id === e.checkingTeacher)?.name || "Unknown"},${e.checkingDeadline},${e.status}`).join("\n");
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
        const isExternalEl = document.getElementById("isExternal");
        const statusEl = document.getElementById("status");
        const saveBtn = document.getElementById("saveAssignmentBtn");

        teacherIdEl.value = assignment.teacherId || "";
        subjectCodeEl.value = assignment.subjectCode || "";
        shiftEl.value = assignment.shift || "";
        packetCodeEl.value = assignment.packetCode || "";
        totalExamsEl.value = assignment.totalExams || "";
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
    const tableBody = document.querySelector("#assignmentTable tbody");
    let filteredAssignments = [...assignments];
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const teacherFilter = document.getElementById("filterTeacher").value;
    const statusFilter = document.getElementById("filterStatus").value;

    if (searchTerm) filteredAssignments = filteredAssignments.filter(a => 
        teachers.find(t => t.id === a.teacherId)?.name.toLowerCase().includes(searchTerm));
    if (teacherFilter) filteredAssignments = filteredAssignments.filter(a => a.teacherId === teacherFilter);
    if (statusFilter) filteredAssignments = filteredAssignments.filter(a => a.status === statusFilter);

    tableBody.innerHTML = "";
    filteredAssignments.forEach(a => {
        const teacher = teachers.find(t => t.id === a.teacherId)?.name || "Unknown";
        tableBody.innerHTML += `
            <tr>
                <td>${teacher}</td>
                <td>${a.subjectCode}</td>
                <td>${a.shift}</td>
                <td>${a.packetCode}</td> <!-- Added Packet Code -->
                <td>${a.totalExams}</td>
                <td>${a.status}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editAssignment('${a.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteAssignment('${a.id}')">Delete</button>
                    <button class="action-btn mark-completed-btn" onclick="markAssignmentCompleted('${a.id}')" ${a.status === "Completed" ? "disabled" : ""}>
                        Mark Completed
                    </button>
                </td>
            </tr>`;
    });
}

function loadAnalytics() {
    try {
        const analyticsSection = document.getElementById("analyticsSection");
        const totalExamsCanvas = document.getElementById("totalExamsChart");
        const completedExamsCanvas = document.getElementById("completedExamsChart");
        const workloadCanvas = document.getElementById("workloadChart");

        if (!totalExamsCanvas || !completedExamsCanvas || !workloadCanvas) {
            console.error("Chart canvases not found in DOM");
            analyticsSection.innerHTML = "<h2>Analytics</h2><p>Error: Chart elements not found.</p>";
            return;
        }

        // Check if data is available
        if (teachers.length === 0 || assignments.length === 0) {
            console.warn("No data available for analytics");
            analyticsSection.innerHTML = "<h2>Analytics</h2><p>No data available yet. Add teachers and assignments to see analytics.</p>";
            return;
        }

        const teacherStats = teachers.map(teacher => {
            const teacherAssignments = assignments.filter(a => a.teacherId === teacher.id);
            const totalExams = teacherAssignments.reduce((sum, a) => sum + a.totalExams, 0);
            const completedExams = teacherAssignments.filter(a => a.status === "Completed").reduce((sum, a) => sum + a.totalExams, 0);
            const scheduledExams = exams.filter(e => e.checkingTeacher === teacher.id).length;
            return { name: teacher.name, totalExams, completedExams, scheduledExams };
        });

        const labels = teacherStats.map(stat => stat.name);
        const totalExamsData = teacherStats.map(stat => stat.totalExams);
        const completedExamsData = teacherStats.map(stat => stat.completedExams);
        const workloadData = teacherStats.map(stat => 
            ((stat.totalExams / (assignments.reduce((sum, a) => sum + a.totalExams, 0) || 1)) * 100).toFixed(2)
        );

        console.log("Analytics Data:", { labels, totalExamsData, completedExamsData, workloadData });

        // Destroy existing charts if they exist
        if (totalExamsChart) totalExamsChart.destroy();
        if (completedExamsChart) completedExamsChart.destroy();
        if (workloadChart) workloadChart.destroy();

        // Total Exams Bar Chart
        totalExamsChart = new Chart(totalExamsCanvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Total Exams",
                    data: totalExamsData,
                    backgroundColor: "#3498db",
                    borderColor: "#2980b9",
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: true } }
            }
        });

        // Completed Exams Bar Chart
        completedExamsChart = new Chart(completedExamsCanvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Completed Exams",
                    data: completedExamsData,
                    backgroundColor: "#2ecc71",
                    borderColor: "#27ae60",
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: true } }
            }
        });

        // Workload Pie Chart
        workloadChart = new Chart(workloadCanvas, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    label: "Workload %",
                    data: workloadData,
                    backgroundColor: ["#e74c3c", "#f1c40f", "#9b59b6", "#3498db", "#2ecc71"],
                    borderColor: "#fff",
                    borderWidth: 2
                }]
            },
            options: {
                plugins: { legend: { position: "right" } }
            }
        });

        console.log("Analytics charts rendered successfully");
    } catch (e) {
        console.error("Error loading analytics:", e);
        const analyticsSection = document.getElementById("analyticsSection");
        analyticsSection.innerHTML = "<h2>Analytics</h2><p>Error loading analytics. Check console for details.</p>";
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

// Exam Scheduler Functions
function loadExamsIntoForm() {
    try {
        const subjectEl = document.getElementById("examSubject");
        const shiftEl = document.getElementById("examShift");
        const teacherEl = document.getElementById("checkingTeacher");
        
        subjectEl.innerHTML = '<option value="">Select Subject</option>' + subjectCodes.map(c => `<option value="${c}">${c}</option>`).join("");
        shiftEl.innerHTML = '<option value="">Select Shift</option>' + shifts.map(s => `<option value="${s}">${s}</option>`).join("");
        teacherEl.innerHTML = '<option value="">Select Teacher</option>' + teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    } catch (e) {
        console.error("Error loading exams into form:", e);
    }
}

function saveExam() {
    try {
        const title = document.getElementById("examTitle").value.trim();
        const subject = document.getElementById("examSubject").value;
        const shift = document.getElementById("examShift").value;
        const date = document.getElementById("examDate").value;
        const checkingTeacher = document.getElementById("checkingTeacher").value;
        const checkingDeadline = document.getElementById("checkingDeadline").value;
        const status = document.getElementById("examStatus").value;

        if (!title || !subject || !shift || !date || !checkingTeacher || !checkingDeadline || !status) {
            alert("All fields are required!");
            return;
        }

        const exam = {
            id: "e" + (exams.length + 1),
            title,
            subject,
            shift,
            date,
            checkingTeacher,
            checkingDeadline,
            status,
            year: currentYear
        };

        exams.push(exam);
        localStorage.setItem("exams", JSON.stringify(exams));
        console.log("Exam saved:", exam);

        document.getElementById("examTitle").value = "";
        document.getElementById("examSubject").value = "";
        document.getElementById("examShift").value = "";
        document.getElementById("examDate").value = "";
        document.getElementById("checkingTeacher").value = "";
        document.getElementById("checkingDeadline").value = "";
        document.getElementById("examStatus").value = "Pending";
        toggleSection("examSchedulerSection");
        showNotification("Exam schedule saved successfully!");
        loadAnalytics();
    } catch (e) {
        console.error("Error saving exam:", e);
        alert("Failed to save exam. Check console for details.");
    }
}

function showExamCalendar() {
    try {
        const calendarDiv = document.getElementById("examCalendar");
        calendarDiv.style.display = "block";
        calendarDiv.innerHTML = "<h3>Exam Calendar</h3>";

        const examByDate = {};
        exams.forEach(e => {
            examByDate[e.date] = examByDate[e.date] || [];
            examByDate[e.date].push(e);
        });

        let calendarHTML = "<table><thead><tr><th>Date</th><th>Exams</th></tr></thead><tbody>";
        for (const [date, examsOnDate] of Object.entries(examByDate)) {
            calendarHTML += `<tr><td>${date}</td><td>${examsOnDate.map(e => `${e.title} (${e.shift}, ${teachers.find(t => t.id === e.checkingTeacher)?.name || "Unknown"})`).join("<br>")}</td></tr>`;
        }
        calendarHTML += "</tbody></table>";
        calendarDiv.innerHTML += calendarHTML;
    } catch (e) {
        console.error("Error showing exam calendar:", e);
    }
}

function toggleSettings() {
    const modal = document.getElementById("settingsModal");
    modal.style.display = modal.style.display === "block" ? "none" : "block";
}

// New function to show only Assignments
function showAssignmentsOnly() {
    document.querySelectorAll(".form-section, .data-section").forEach(s => s.style.display = "none");
    document.getElementById("assignmentsSection").style.display = "block";
    loadAssignments();
}

// New function to show only Analytics with graphs
function showAnalyticsOnly() {
    document.querySelectorAll(".form-section, .data-section").forEach(s => s.style.display = "none");
    const analyticsSection = document.getElementById("analyticsSection");
    analyticsSection.style.display = "block";
    loadAnalytics(); // Load charts when section is shown
}

function goToMainPage() {
    document.querySelectorAll(".form-section, .data-section").forEach(s => s.style.display = "none");
    document.getElementById("teachersSection").style.display = "block";
    document.getElementById("analyticsSection").style.display = "block";
    loadTeachers();
    loadAnalytics();
    console.log("Redirected to main page with Teachers and Analytics");
}
