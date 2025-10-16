// Student Management System JavaScript
let students = [];
let studentIdCounter = 1;
let studentToDelete = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadStudentsFromStorage();
    setupEventListeners();
    updateDisplay();
});

function setupEventListeners() {
    // Form submission
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
    
    // Search and filter
    document.getElementById('searchInput').addEventListener('input', filterStudents);
    document.getElementById('courseFilter').addEventListener('change', filterStudents);
    
    // Modal close on outside click
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDeleteModal();
        }
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: studentIdCounter++,
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        dateOfBirth: document.getElementById('dateOfBirth').value,
        course: document.getElementById('course').value,
        gpa: parseFloat(document.getElementById('gpa').value),
        year: document.getElementById('year').value
    };

    // Validate email uniqueness
    if (students.some(student => student.email === formData.email)) {
        alert('A student with this email already exists!');
        return;
    }

    students.push(formData);
    saveStudentsToStorage();
    updateDisplay();
    clearForm();
    
    // Show success message
    showNotification('Student added successfully!', 'success');
}

function updateDisplay() {
    displayStudents();
    updateStatistics();
}

function displayStudents() {
    const tbody = document.getElementById('studentsTableBody');
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="9">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
                    </svg>
                    <h3>No students registered yet</h3>
                    <p>Add your first student using the form above</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${student.course}</td>
            <td>${student.year}</td>
            <td>${student.gpa.toFixed(2)}</td>
            <td>${calculateAge(student.dateOfBirth)}</td>
            <td class="actions">
                <button class="btn-small btn-edit" onclick="editStudent(${student.id})">Edit</button>
                <button class="btn-small btn-delete" onclick="showDeleteModal(${student.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateStatistics() {
    const totalStudents = students.length;
    const uniqueCourses = [...new Set(students.map(s => s.course))].length;
    const averageGPA = totalStudents > 0 ? 
        (students.reduce((sum, s) => sum + s.gpa, 0) / totalStudents).toFixed(2) : '0.0';
    const honorStudents = students.filter(s => s.gpa >= 3.5).length;

    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('activeCourses').textContent = uniqueCourses;
    document.getElementById('averageGPA').textContent = averageGPA;
    document.getElementById('honorStudents').textContent = honorStudents;
}

function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    // Populate form with student data
    document.getElementById('firstName').value = student.firstName;
    document.getElementById('lastName').value = student.lastName;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone;
    document.getElementById('dateOfBirth').value = student.dateOfBirth;
    document.getElementById('course').value = student.course;
    document.getElementById('gpa').value = student.gpa;
    document.getElementById('year').value = student.year;

    // Remove student from array (will be re-added when form is submitted)
    students = students.filter(s => s.id !== id);
    saveStudentsToStorage();
    updateDisplay();

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function showDeleteModal(id) {
    studentToDelete = id;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    studentToDelete = null;
}

function confirmDelete() {
    if (studentToDelete) {
        students = students.filter(s => s.id !== studentToDelete);
        saveStudentsToStorage();
        updateDisplay();
        showNotification('Student deleted successfully!', 'success');
    }
    closeDeleteModal();
}

function clearForm() {
    document.getElementById('studentForm').reset();
}

function filterStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const courseFilter = document.getElementById('courseFilter').value;
    // We only want to filter rows that are actual student data, not the empty state row
    const rows = document.querySelectorAll('#studentsTableBody tr:not(.empty-state)'); 

    rows.forEach(row => {
        const cells = row.cells;
        if (cells.length < 9) return;

        const name = cells[1].textContent.toLowerCase();
        const email = cells[2].textContent.toLowerCase();
        const course = cells[4].textContent;

        const matchesSearch = name.includes(searchTerm) || 
                            email.includes(searchTerm) || 
                            course.toLowerCase().includes(searchTerm);
        const matchesCourse = !courseFilter || course === courseFilter;

        row.style.display = matchesSearch && matchesCourse ? '' : 'none';
    });
}

function exportData() {
    if (students.length === 0) {
        alert('No data to export!');
        return;
    }

    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Date of Birth', 'Course', 'GPA', 'Year', 'Age'];
    const csvContent = [
        headers.join(','),
        ...students.map(student => [
            student.id,
            student.firstName,
            student.lastName,
            student.email,
            student.phone,
            student.dateOfBirth,
            student.course,
            student.gpa,
            student.year,
            calculateAge(student.dateOfBirth)
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification('Data exported successfully!', 'success');
}

function saveStudentsToStorage() {
    localStorage.setItem('students', JSON.stringify(students));
    // Save the counter to prevent ID conflicts on refresh
    localStorage.setItem('studentIdCounter', studentIdCounter.toString()); 
}

function loadStudentsFromStorage() {
    const savedStudents = localStorage.getItem('students');
    const savedCounter = localStorage.getItem('studentIdCounter');
    
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    }
    
    if (savedCounter) {
        studentIdCounter = parseInt(savedCounter);
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // The @keyframes slideIn is now in style.css

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}                           