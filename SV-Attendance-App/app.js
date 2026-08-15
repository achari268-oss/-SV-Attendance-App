const KEY = "sv_attendance_v2";

const defaultData = {
  loggedIn: false,

  teacher: {
    name: "Teacher"
  },

  classes: [
    {
      id: "a",
      name: "BCA A",
      students: []
    },
    {
      id: "b",
      name: "BCA B",
      students: []
    },
    {
      id: "c",
      name: "BCA C",
      students: []
    },
    {
      id: "d",
      name: "BCA D",
      students: []
    }
  ],

  checkins: []
};

let data = load();
let page = "home";
let selectedClass = null;


/* =========================
   DATA
========================= */

function load() {
  try {
    const saved = localStorage.getItem(KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      // Make sure old data does not break the new app
      if (!parsed.teacher) {
        parsed.teacher = {
          name: "Teacher"
        };
      }

      if (!parsed.classes) {
        parsed.classes = structuredClone(defaultData.classes);
      }

      if (!parsed.checkins) {
        parsed.checkins = [];
      }

      delete parsed.teacher.college;

      return parsed;
    }

    return structuredClone(defaultData);

  } catch (error) {
    return structuredClone(defaultData);
  }
}


function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
}


/* =========================
   HELPERS
========================= */

function esc(value) {
  return String(value || "").replace(
    /[&<>"']/g,
    function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    }
  );
}


function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .map(function (x) {
      return x[0];
    })
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


function toast(message) {
  const x = document.createElement("div");

  x.className = "toast";
  x.textContent = message;

  document.body.appendChild(x);

  setTimeout(function () {
    x.remove();
  }, 2500);
}


/* =========================
   MAIN RENDER
========================= */

function render() {

  document.getElementById("app").innerHTML =
    data.loggedIn ? appShell() : login();

  if (!data.loggedIn) {
    return;
  }

  if (page === "home") {
    home();
  }

  if (page === "attendance") {
    teacherAttendance();
  }

  if (page === "profile") {
    profile();
  }

  if (page === "settings") {
    settings();
  }

  if (page === "class") {
    classPage();
  }
}


/* =========================
   LOGIN
========================= */

function login() {

  return `
    <div class="screen login">

      <div class="login-card">

        <div class="logo">
          <img
            src="./icon-192.png"
            alt="SV Attendance App"
            style="
              width:100%;
              height:100%;
              object-fit:contain;
              border-radius:22px;
            ">
        </div>

        <h1>SV Attendance</h1>

        <p class="muted">
          Smart Attendance, Better Education
        </p>


        <div class="field">

          <label>Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter password">

        </div>


        <button
          class="btn primary full"
          onclick="doLogin()">

          LOGIN

        </button>


        <p
          class="muted"
          style="font-size:12px;margin-top:14px">

          Enter password to continue

        </p>

      </div>

    </div>
  `;
}


function doLogin() {

  const password =
    document.getElementById("password").value.trim();


  if (!password) {

    toast("Enter password");

    return;
  }


  data.loggedIn = true;

  save();

  page = "home";

  render();

  toast("Login successful");
}


/* =========================
   APP SHELL
========================= */

function appShell() {

  return `

    <div class="shell">

      <header class="top">

        <div>

          <div
            class="muted"
            style="font-size:12px">

            SV ATTENDANCE APP

          </div>


          <h1 id="title">

            ${
              page === "class"
                ? "Class"
                : "Home"
            }

          </h1>

        </div>


        <div style="font-size:22px">

          🔔

        </div>

      </header>


      <main id="content"></main>


      <nav class="nav">


        <button
          class="${page === "home" ? "active" : ""}"
          onclick="go('home')">

          <span class="nav-icon">
            ⌂
          </span>

          Home

        </button>


        <button
          class="${page === "attendance" ? "active" : ""}"
          onclick="go('attendance')">

          <span class="nav-icon">
            ✓
          </span>

          Attendance

        </button>


        <button
          class="${page === "profile" ? "active" : ""}"
          onclick="go('profile')">

          <span class="nav-icon">
            ●
          </span>

          Profile

        </button>


        <button
          class="${page === "settings" ? "active" : ""}"
          onclick="go('settings')">

          <span class="nav-icon">
            ⚙
          </span>

          Settings

        </button>


      </nav>

    </div>

  `;
}


/* =========================
   NAVIGATION
========================= */

function go(p) {

  page = p;

  selectedClass = null;

  render();
}


/* =========================
   HOME
========================= */

function home() {

  document.getElementById("title").textContent =
    "Home";


  const total =
    data.classes.reduce(
      function (sum, c) {
        return sum + c.students.length;
      },
      0
    );


  const present =
    data.classes.reduce(
      function (sum, c) {

        return (
          sum +
          c.students.filter(
            function (s) {
              return s.status === "Present";
            }
          ).length
        );

      },
      0
    );


  const absent =
    total - present;


  document.getElementById("content").innerHTML = `

    <div class="top">

      <div>

        <p class="muted">

          Welcome,
          ${esc(data.teacher.name)}
          👋

        </p>


        <h2>
          My Classes
        </h2>

      </div>


      <button
        class="btn primary small"
        onclick="openAddClass()">

        + Add Class

      </button>

    </div>


    <div class="grid">


      ${data.classes.map(function (c) {

        return `

          <button
            class="card class-card"
            onclick="openClass('${c.id}')">


            <div class="avatar">

              👥

            </div>


            <strong>

              ${esc(c.name)}

            </strong>


            <span class="muted">

              ${c.students.length}
              Students

            </span>


            <span style="font-size:24px">

              ›

            </span>


          </button>

        `;

      }).join("")}


      <button
        class="card class-card add-card"
        onclick="openAddClass()">

        <strong>
          ＋
        </strong>

        <span>
          Add class
        </span>

      </button>


    </div>


    <div class="section-title">

      <h2>
        Today's Summary
      </h2>

    </div>


    <div class="card">

      <div class="stat-grid">


        <div class="stat">

          <b>
            ${total}
          </b>

          <span>
            Total Students
          </span>

        </div>


        <div class="stat">

          <b>
            ${present}
          </b>

          <span>
            Present
          </span>

        </div>


        <div class="stat">

          <b>
            ${absent}
          </b>

          <span>
            Absent
          </span>

        </div>


      </div>

    </div>


    <div
      class="card"
      style="margin-top:16px">

      <div style="font-size:28px">
        📅
      </div>


      <h3>
        Teacher Attendance
      </h3>


      <p class="muted">

        Mark your attendance for today

      </p>


      <button
        class="btn primary"
        onclick="checkin()">

        Check-in

      </button>

    </div>

  `;
}


/* =========================
   CLASS
========================= */

function openClass(id) {

  selectedClass = id;

  page = "class";

  render();
}


function classPage() {

  const c =
    data.classes.find(
      function (x) {
        return x.id === selectedClass;
      }
    );


  if (!c) {

    go("home");

    return;
  }


  document.getElementById("title").textContent =
    c.name;


  const present =
    c.students.filter(
      function (s) {
        return s.status === "Present";
      }
    ).length;


  const absent =
    c.students.length - present;


  document.getElementById("content").innerHTML = `

    <button
      class="btn secondary small"
      onclick="go('home')">

      ← Back

    </button>


    <div class="section-title">

      <div>

        <h2>
          ${esc(c.name)}
        </h2>

        <p class="muted">

          ${c.students.length}
          Students

        </p>

      </div>


      <button
        class="btn primary small"
        onclick="openAddStudent('${c.id}')">

        + Add Student

      </button>

    </div>


    <div class="card">

      <div class="stat-grid">


        <div class="stat">

          <b>
            ${c.students.length}
          </b>

          <span>
            Total
          </span>

        </div>


        <div class="stat">

          <b>
            ${present}
          </b>

          <span>
            Present
          </span>

        </div>


        <div class="stat">

          <b>
            ${absent}
          </b>

          <span>
            Absent
          </span>

        </div>


      </div>

    </div>


    <div class="section-title">

      <h2>
        Students
      </h2>

    </div>


    ${
      c.students.length

        ? c.students
            .map(function (s) {
              return studentRow(c.id, s);
            })
            .join("")

        : `

          <div class="card">

            <p class="muted">

              No students yet.
              Add the first student.

            </p>

          </div>

        `
    }

  `;
}


/* =========================
   STUDENTS
========================= */

function studentRow(cid, s) {

  return `

    <div class="student">


      <div class="avatar">

        ${initials(s.name)}

      </div>


      <div class="student-main">

        <strong>

          ${esc(s.name)}

        </strong>


        <div class="muted">

          ID:
          ${esc(s.id)}

        </div>

      </div>


      <div class="attendance-buttons">
        <button
          class="status present ${
            s.status === "Present" ? "active" : ""
          }"
          onclick="markStatus(
              '${cid}',
              '${s.id}',
              'Present'
            )">
          ✓ Present
        </button>

        <button
          class="status absent ${
            s.status === "Absent" ? "active" : ""
          }"
          onclick="markStatus(
              '${cid}',
              '${s.id}',
              'Absent'
            )">
          × Absent
        </button>
      </div>


    </div>

  `;
}
async function markStatus(cid, sid, status) {
    const c = data.classes.find(function (x) {
        return x.id === cid;
    });

    if (!c) {
        return;
    }

    const s = c.students.find(function (x) {
        return x.id === sid;
    });

    if (!s) {
        return;
    }

    // Set attendance status
    s.status = status;

    // Save the updated attendance
    save();

    // Refresh the screen
    render();

    // Show confirmation
    toast(
        `${s.name}: ${s.status}`
    );

    // Send SMS only when student is marked Absent
    if (s.status === "Absent") {
        await sendAttendanceSMS(s);
    }
}

/* =========================
   ADD CLASS
========================= */

function openAddClass() {

  modal(`

    <h2>
      Add Class
    </h2>


    <div class="field">

      <label>
        Class name
      </label>


      <input
        id="newClass"
        placeholder="Example: BCA E">

    </div>


    <button
      class="btn primary full"
      onclick="addClass()">

      Add Class

    </button>

  `);
}


function addClass() {

  const name =
    document
      .getElementById("newClass")
      .value
      .trim();


  if (!name) {

    toast("Enter class name");

    return;
  }


  const id =
    Date.now().toString();


  data.classes.push({

    id: id,

    name: name,

    students: []

  });


  save();

  closeModal();

  render();

  toast("Class added");
}


/* =========================
   ADD STUDENT
========================= */

function openAddStudent(cid) {

  modal(`

    <h2>
      Add Student
    </h2>


    <input
      type="hidden"
      id="studentClass"
      value="${cid}">


    <div class="field">

      <label>
        Student name
      </label>


      <input
        id="studentName"
        placeholder="Enter student name">

    </div>


    <div class="field">

      <label>
        Student ID
      </label>


      <input
        id="studentId"
        placeholder="Example: BCA009">

    </div>


    <div class="field">

      <label>
        Phone number
      </label>


      <input
        id="studentPhone"
        type="tel"
        placeholder="Enter phone number">

    </div>


    <button
      class="btn primary full"
      onclick="addStudent()">

      Add Student

    </button>

  `);
}


function addStudent() {

  const cid =
    document
      .getElementById("studentClass")
      .value;


  const name =
    document
      .getElementById("studentName")
      .value
      .trim();


  const id =
    document
      .getElementById("studentId")
      .value
      .trim();


  const phone =
    document
      .getElementById("studentPhone")
      .value
      .trim();


  if (!name || !id) {

    toast(
      "Enter student name and ID"
    );

    return;
  }


  const c =
    data.classes.find(
      function (x) {
        return x.id === cid;
      }
    );


  if (!c) {
    return;
  }


  if (
    c.students.some(
      function (s) {
        return (
          s.id.toLowerCase() ===
          id.toLowerCase()
        );
      }
    )
  ) {

    toast(
      "Student ID already exists"
    );

    return;
  }


  c.students.push({

    id: id,

    name: name,

    phone: phone,

    status: "Present"

  });


  save();

  closeModal();

  render();

  toast("Student added");
}


/* =========================
   TEACHER ATTENDANCE
========================= */

function teacherAttendance() {

  document.getElementById("title").textContent =
    "Teacher Attendance";


  const today =
    new Date().toLocaleDateString(
      "en-IN"
    );


  const checked =
    data.checkins.some(
      function (x) {
        return x.date === today;
      }
    );


  document.getElementById("content").innerHTML = `

    <div class="section-title">

      <div>

        <h2>
          Teacher Attendance
        </h2>

        <p class="muted">
          ${today}
        </p>

      </div>

    </div>


    <div class="card">

      <div style="font-size:42px">

        ${checked ? "✅" : "📅"}

      </div>


      <h2>

        ${
          checked
            ? "Attendance Marked"
            : "Today's Check-in"
        }

      </h2>


      <p class="muted">

        ${
          checked
            ? "You have already checked in today."
            : "Mark your attendance for today."
        }

      </p>


      ${
        checked

          ? `

            <div class="status present">

              Checked in

            </div>

          `

          : `

            <button
              class="btn primary full"
              onclick="checkin()">

              Check-in Now

            </button>

          `
      }

    </div>


    <div class="section-title">

      <h2>
        History
      </h2>

    </div>


    ${
      data.checkins.length

        ? data.checkins
            .slice()
            .reverse()
            .map(function (x) {

              return `

                <div class="card history-item">

                  <strong>
                    ${esc(x.date)}
                  </strong>

                  <span class="muted">
                    ${esc(x.time)}
                  </span>

                </div>

              `;

            })
            .join("")

        : `

          <div class="card">

            <p class="muted">

              No attendance history yet.

            </p>

          </div>

        `
    }

  `;
}


function checkin() {

  const now =
    new Date();


  const date =
    now.toLocaleDateString(
      "en-IN"
    );


  const time =
    now.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  if (
    data.checkins.some(
      function (x) {
        return x.date === date;
      }
    )
  ) {

    toast(
      "Already checked in today"
    );

    return;
  }


  data.checkins.push({

    date: date,

    time: time

  });


  save();

  page = "attendance";

  render();

  toast(
    "Attendance checked in successfully"
  );
}


/* =========================
   PROFILE
========================= */

function profile() {

  document.getElementById("title").textContent =
    "Profile";


  document.getElementById("content").innerHTML = `

    <div class="card">


      <div
        class="avatar"
        style="
          width:80px;
          height:80px;
          font-size:28px;
        ">

        ${initials(data.teacher.name)}

      </div>


      <h2>

        ${esc(data.teacher.name)}

      </h2>


      <p class="muted">

        Teacher

      </p>


      <div class="field">

        <label>
          Teacher name
        </label>


        <input
          id="teacherName"
          value="${esc(data.teacher.name)}">

      </div>


      <button
        class="btn primary full"
        onclick="saveProfile()">

        Save Profile

      </button>


    </div>

  `;
}


function saveProfile() {

  const name =
    document
      .getElementById("teacherName")
      .value
      .trim();


  if (!name) {

    toast(
      "Please enter teacher name"
    );

    return;
  }


  data.teacher.name =
    name;


  save();

  render();

  toast(
    "Profile saved"
  );
}


/* =========================
   SETTINGS
========================= */

function settings() {

  document.getElementById("title").textContent =
    "Settings";


  document.getElementById("content").innerHTML = `

    <div class="card">

      <h2>
        Settings
      </h2>


      <p class="muted">

        Manage your SV Attendance App

      </p>


      <button
        class="btn secondary full"
        onclick="exportData()">

        Export Attendance Data

      </button>


      <br><br>


      <button
        class="btn secondary full"
        onclick="resetData()">

        Reset App Data

      </button>


      <br><br>


      <button
        class="btn primary full"
        onclick="logout()">

        Logout

      </button>

    </div>

  `;
}


/* =========================
   LOGOUT
========================= */

function logout() {

  data.loggedIn = false;

  save();

  page = "home";

  selectedClass = null;

  render();

  toast("Logged out");
}


/* =========================
   RESET
========================= */

function resetData() {

  if (
    !confirm(
      "Delete all classes, students and attendance?"
    )
  ) {
    return;
  }


  localStorage.removeItem(KEY);


  data =
    structuredClone(
      defaultData
    );


  page = "home";

  selectedClass = null;


  render();

  toast(
    "App data reset"
  );
}


/* =========================
   EXPORT
========================= */

function exportData() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href = url;

  a.download =
    "SV-Attendance-Data.json";


  a.click();


  URL.revokeObjectURL(
    url
  );


  toast(
    "Data exported"
  );
}


/* =========================
   MODAL
========================= */

function modal(html) {

  const old =
    document.getElementById(
      "modal"
    );


  if (old) {
    old.remove();
  }


  const x =
    document.createElement(
      "div"
    );


  x.id = "modal";

  x.className =
    "modal-back";


  x.innerHTML = `

    <div class="modal">

      ${html}


      <button
        class="btn secondary full"
        style="margin-top:10px"
        onclick="closeModal()">

        Cancel

      </button>

    </div>

  `;


  document.body.appendChild(
    x
  );
}


function closeModal() {

  const x =
    document.getElementById(
      "modal"
    );


  if (x) {
    x.remove();
  }
}


/* =========================
   SERVICE WORKER
========================= */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    function () {

      navigator.serviceWorker
        .register(
          "service-worker.js"
        )
        .catch(
          function () {
            console.log(
              "Service worker not registered"
            );
          }
        );

    }
  );
}


/* =========================
   START AP
========================= */

render();
// your existing code above


async function sendAttendanceSMS(student) {
  if (!student.phone) {
    toast("No phone number for " + student.name);
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phone: student.phone,
        message: `SV Attendance: ${student.name} (${student.id}) is marked ABSENT today.`
      })
    });

    const result = await response.json();

    console.log("SMS Server Response:", result);

    if (response.ok && result.success) {
      toast("SMS sent to " + student.name);
    } else {
      toast("SMS failed");
      console.error(result);
    }

  } catch (error) {
    console.error("SMS Error:", error);
    toast("SMS server not connected");
  }
}


render();