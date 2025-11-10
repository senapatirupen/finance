Awesome update. We'll lock this in.

I'll restate the new rule set and then give you the final improved code (full-screen layout + new shift logic).

---

## Updated scheduling rules (final version so far)

Each task has:

* name
* owner
* start date
* duration
* end date (calculated)
* status = New / In Analysis / In Progress / Blocked / Done
* dependsOn (info only)
* notes

Behavior when you edit the Start Date of any task:

1. We only shift tasks whose status is **In Analysis** or **In Progress**.

   * We do **not** shift tasks with status:

     * New
     * Blocked
     * Done
   * We also do not MODIFY those statuses' own dates during global shift.

2. Tail protection:

   * Find the "tail tasks": among all tasks that are shift-eligible (In Analysis or In Progress), find the max start date.
   * Those tail tasks are considered "at the end".
   * The shift calculation should NOT apply to those tail tasks (they act as stoppers).
   * If you're editing a tail task and after edit it's still tail, then nobody else shifts.

   So now "at end of all the task" means:

   * "at the end of all shift-eligible tasks."

3. Blocked/New/Done tasks:

   * Never shifted by the global delta.
   * If you directly edit their start date, we just update that task’s date and stop. No global shift at all.
     (Because they are not in the calculation pool.)

4. When we *do* global shift:

   * Compute `delta = newDate - oldDate` for the edited task.
   * Apply that same delta to all other **shift-eligible & non-tail** tasks.
   * Do not touch:

     * Done / Blocked / New
     * tail tasks from before the shift
     * the edited task itself (we’ve already set it)
   * After that, re-render.

This matches:

* We only move "active work" (In Analysis, In Progress).
* We don't let tail tasks drag everyone unless they stop being tail by moving earlier.
* We don't move Blocked stuff because it's waiting on something; we don't move New because it's not committed; we don't move Done obviously.

5. Full-screen view:

   * We'll remove the card gutters around everything and make it more dashboard-like.
   * We'll stretch the layout so that the scheduler uses full viewport width (fluid container, smaller margins).
   * We'll make the navbar stick to top dark and the rest scroll.

Let's code.

---

## Final `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Project Scheduler - Active Timeline Control</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <style>
    body {
      background-color: #f8f9fa;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* navbar fixed height */
    header.navbar {
      flex-shrink: 0;
    }

    /* main workspace scrolls and uses full width */
    main.workspace {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: 1rem;
    }

    .status-chip {
      font-size: .7rem;
      padding: .4rem .5rem;
      border-radius: .5rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .status-new         { background-color:#0d6efd; color:#fff; }   /* blue */
    .status-analysis    { background-color:#6f42c1; color:#fff; }   /* purple */
    .status-progress    { background-color:#ffc107; color:#000; }   /* yellow */
    .status-blocked     { background-color:#dc3545; color:#fff; }   /* red */
    .status-done        { background-color:#198754; color:#fff; }   /* green */

    .badge-frozen {
      font-size: .6rem;
      background:#0d6efd;
    }

    .note-snippet {
      max-width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: .8rem;
      color:#6c757d;
    }

    .gantt-wrapper {
      background-color:#fff;
      border:1px solid #dee2e6;
      border-radius:.5rem;
      padding:1rem;
      box-shadow:0 .25rem .5rem rgba(0,0,0,.05);
    }
    .gantt-row {
      margin-bottom:1rem;
    }
    .gantt-bar {
      height: 20px;
      border-radius: 4px;
      background-color: rgba(13,110,253,.4);
    }

    .panel {
      background-color:#fff;
      border:1px solid #dee2e6;
      border-radius:.5rem;
      box-shadow:0 .25rem .5rem rgba(0,0,0,.05);
      margin-bottom:1rem;
    }

    .panel-header {
      background-color:#fff;
      border-bottom:1px solid #dee2e6;
      padding:.75rem 1rem;
      display:flex;
      justify-content:space-between;
      align-items:center;
    }

    .panel-body {
      padding:1rem;
    }

    .table-fixed td,
    .table-fixed th {
      vertical-align: middle;
    }

    .small-hint {
      font-size:.75rem;
      color:#6c757d;
    }

  </style>
</head>
<body>

  <!-- Navbar / header -->
  <header class="navbar navbar-dark bg-dark">
    <div class="container-fluid">
      <span class="navbar-brand fw-semibold">Project Scheduler</span>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-light btn-sm" data-bs-toggle="collapse" data-bs-target="#addTaskForm">
          + Add / Edit Task
        </button>
      </div>
    </div>
  </header>

  <!-- Main content area -->
  <main class="workspace container-fluid">

    <!-- Task Form -->
    <div class="collapse panel" id="addTaskForm">
      <div class="panel-header bg-primary text-white rounded-top">
        <strong>Create / Update Task</strong>
      </div>
      <div class="panel-body bg-white rounded-bottom">
        <form id="taskForm" class="row g-3">
          <input type="hidden" id="taskId" />

          <div class="col-md-3 col-lg-2">
            <label class="form-label">Task Name</label>
            <input type="text" id="taskName" class="form-control form-control-sm" required />
          </div>

          <div class="col-md-3 col-lg-2">
            <label class="form-label">Owner</label>
            <input type="text" id="taskOwner" class="form-control form-control-sm" placeholder="Susi / Ramesh" />
          </div>

          <div class="col-md-2 col-lg-2">
            <label class="form-label">Start Date</label>
            <input type="date" id="taskStart" class="form-control form-control-sm" required />
          </div>

          <div class="col-md-2 col-lg-2">
            <label class="form-label">Duration (days)</label>
            <input type="number" id="taskDuration" class="form-control form-control-sm" min="1" value="1" required />
          </div>

          <div class="col-md-2 col-lg-2">
            <label class="form-label">Status</label>
            <select id="taskStatus" class="form-select form-select-sm">
              <option>New</option>
              <option>In Analysis</option>
              <option>In Progress</option>
              <option>Blocked</option>
              <option>Done</option>
            </select>
          </div>

          <div class="col-md-3 col-lg-2">
            <label class="form-label">Depends On (info)</label>
            <select id="taskDependsOn" class="form-select form-select-sm">
              <option value="">-- None --</option>
            </select>
            <div class="form-text small-hint">
              Only for visibility. Does NOT drive shifting.
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <label class="form-label">Notes</label>
            <textarea id="taskNotes" class="form-control form-control-sm" rows="2"
              placeholder="Context, risk, blockers..."></textarea>
          </div>

          <div class="col-12">
            <div class="alert alert-info py-2 mb-2 small">
              Scheduling rules:<br/>
              • Only tasks in <b>In Analysis</b> or <b>In Progress</b> are considered "active" and can shift.<br/>
              • Tasks in <b>New</b>, <b>Blocked</b>, or <b>Done</b> are ignored in shift math and never moved.<br/>
              • Tail protection: the farthest active task(s) in the future won't move when others shift.<br/>
              • If you edit a tail task and it stays tail, nothing else shifts.<br/>
              • If you pull a tail task earlier so it's no longer tail, that can pull other active tasks.
            </div>
          </div>

          <div class="col-12">
            <button class="btn btn-primary btn-sm" type="submit">Save Task</button>
            <button class="btn btn-secondary btn-sm" type="button" id="formResetBtn">Reset</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Task Table -->
    <div class="panel">
      <div class="panel-header">
        <strong>Task List</strong>
        <span class="small-hint">
          Edit Start Date → auto shift active tasks (full-screen mode)
        </span>
      </div>
      <div class="panel-body p-0">
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 table-fixed" id="taskTable">
            <thead class="table-light">
            <tr>
              <th style="width:3rem">#</th>
              <th>Task</th>
              <th>Owner</th>
              <th>Start</th>
              <th>End</th>
              <th>Dur</th>
              <th>Status</th>
              <th>Depends On</th>
              <th>Notes</th>
              <th style="width:7rem">Actions</th>
            </tr>
            </thead>
            <tbody>
            <!-- rows injected by JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Timeline Preview -->
    <div class="gantt-wrapper">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <strong>Timeline Preview</strong>
        <span class="small-hint">
          "(Tail)" = last active task(s). They won't shift as followers.
        </span>
      </div>
      <div id="timelinePreview">
        <!-- bars injected by JS -->
      </div>
    </div>

  </main>

  <!-- Notes Modal -->
  <div class="modal fade" id="notesModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Edit Notes: <span id="notesTaskName" class="fw-semibold"></span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"
                  aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <textarea id="notesModalTextarea" class="form-control" rows="10"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary btn-sm" id="saveNotesBtn" data-bs-dismiss="modal">Save</button>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <script>
    // ------------------ HELPERS ------------------
    function addDays(dateStr, days) {
      const d = new Date(dateStr + "T00:00:00");
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0,10);
    }

    function diffInDays(from, to) {
      const d1 = new Date(from + "T00:00:00");
      const d2 = new Date(to + "T00:00:00");
      return Math.round((d2 - d1) / (1000*60*60*24));
    }

    function computeEndDate(task) {
      return addDays(task.startDate, task.durationDays - 1);
    }

    function statusClass(status){
      switch(status){
        case "New":          return "status-chip status-new";
        case "In Analysis":  return "status-chip status-analysis";
        case "In Progress":  return "status-chip status-progress";
        case "Blocked":      return "status-chip status-blocked";
        case "Done":         return "status-chip status-done";
        default:             return "status-chip bg-secondary text-white";
      }
    }

    // a task is "shift-eligible" if it's part of active plan movement
    function isShiftEligible(t) {
      return t.status === "In Analysis" || t.status === "In Progress";
    }

    // ------------------ DATA ------------------
    // Demo data
    let tasks = [
      {
        id: 1,
        name: "Task 1 - Analysis",
        owner: "Ramesh",
        startDate: "2025-11-05",
        durationDays: 2,
        status: "In Analysis",
        dependsOn: null,
        notes: "Initial requirement understanding."
      },
      {
        id: 2,
        name: "Task 2 - API Design",
        owner: "Susi",
        startDate: "2025-11-08",
        durationDays: 3,
        status: "In Progress",
        dependsOn: 1,
        notes: "Define request/response payloads."
      },
      {
        id: 3,
        name: "Task 3 - UI Work",
        owner: "Tonny",
        startDate: "2025-11-10",
        durationDays: 3,
        status: "Blocked",
        dependsOn: 2,
        notes: "Waiting for API design. Blocked."
      },
      {
        id: 4,
        name: "Task 4 - Old Work (Done)",
        owner: "Rohan",
        startDate: "2025-10-30",
        durationDays: 2,
        status: "Done",
        dependsOn: null,
        notes: "Completed spike, must stay frozen."
      },
      {
        id: 5,
        name: "Task 5 - Future Planning",
        owner: "Priya",
        startDate: "2025-11-12",
        durationDays: 2,
        status: "New",
        dependsOn: null,
        notes: "Not committed yet."
      }
    ];
    let nextId = 6;
    let currentNotesTaskId = null;

    // ------------------ TAIL DETECTION ------------------
    // Tail means: among shift-eligible tasks, whose startDate is the MAX.
    // These are "at the end of all the task" for scheduling.
    // Return array of task IDs.
    function getTailTaskIds(taskList = tasks) {
      const eligible = taskList.filter(isShiftEligible);
      if (eligible.length === 0) return [];
      // find max startDate
      let maxDate = eligible[0].startDate;
      eligible.forEach(t => {
        if (t.startDate > maxDate) {
          maxDate = t.startDate;
        }
      });
      // collect all with that maxDate
      return eligible
        .filter(t => t.startDate === maxDate)
        .map(t => t.id);
    }

    // ------------------ SHIFT LOGIC ------------------
    // Rules when user edits Start Date in table:
    //
    // 1. If the edited task is NOT shift-eligible (status New / Blocked / Done):
    //    -> update only that task, stop. No global shift.
    //
    // 2. If it's shift-eligible:
    //    - delta = new - old
    //    - Make preview with that single task updated
    //    - Find tailIDs in preview among shift-eligible tasks.
    //      If edited task is still in that preview tail:
    //         -> only update that task in real data, stop.
    //
    //    - ELSE we do global shift:
    //         tailBeforeShift = tail of *current* tasks (before applying delta)
    //         For each task:
    //            if NOT shift-eligible -> don't move
    //            else if id === editedId -> set to newDate
    //            else if id in tailBeforeShift -> don't move
    //            else -> shift by delta
    //
    function maybeShiftAllActiveTasks(taskIdChanged, oldDate, newDate) {
      const edited = tasks.find(t => t.id === taskIdChanged);
      if (!edited) return;

      const delta = diffInDays(oldDate, newDate);
      // If no change, just overwrite (if allowed) and done
      if (delta === 0) {
        if (edited.status !== "Done") {
          edited.startDate = newDate;
        }
        return;
      }

      // Case 1: edited task is not shift-eligible
      if (!isShiftEligible(edited)) {
        // Just update its own date unless it's Done (Done should really stay frozen,
        // but if user edits Done, we can allow manually here OR freeze. We'll freeze.)
        if (edited.status !== "Done") {
          edited.startDate = newDate;
        }
        return;
      }

      // Build preview with edited task date applied
      const previewTasks = tasks.map(t => {
        if (t.id === taskIdChanged) {
          return { ...t, startDate: newDate };
        }
        return { ...t };
      });

      // In preview, if edited task is still tail, no global shift
      const previewTail = getTailTaskIds(previewTasks);
      const editedStillTail = previewTail.includes(taskIdChanged);
      if (editedStillTail) {
        // just update edited in real tasks
        edited.startDate = newDate;
        return;
      }

      // We are doing a global shift.
      // Tail BEFORE shift:
      const tailBeforeShift = getTailTaskIds(tasks);

      tasks = tasks.map(t => {
        // Non-shift-eligible tasks: New, Blocked, Done => do not move
        if (!isShiftEligible(t)) {
          // BUT if it's the edited task and it's actually eligible (we passed that check),
          // we won't come here. So safe.
          return (t.id === taskIdChanged)
            ? { ...t, startDate: newDate } // edge case if logic refactors later
            : t;
        }

        // shift-eligible tasks below:

        // Edited task: force newDate
        if (t.id === taskIdChanged) {
          return { ...t, startDate: newDate };
        }

        // Tail tasks (before shift) should not move
        if (tailBeforeShift.includes(t.id)) {
          return t;
        }

        // Everyone else who is shift-eligible moves by delta
        return {
          ...t,
          startDate: addDays(t.startDate, delta)
        };
      });
    }

    // ------------------ RENDER: TABLE ------------------
    function renderTaskTable() {
      const tbody = document.querySelector("#taskTable tbody");
      tbody.innerHTML = "";

      tasks.forEach((task, index) => {
        const endDate = computeEndDate(task);
        const stClass = statusClass(task.status);

        const dependsName = task.dependsOn
          ? (tasks.find(t => t.id === task.dependsOn)?.name || "[Missing]")
          : "<span class='text-muted'>None</span>";

        // badge for Done
        const frozenBadge = (task.status === "Done")
          ? `<span class="badge badge-frozen ms-1">Frozen</span>`
          : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index+1}</td>
          <td class="fw-semibold">${task.name}</td>
          <td>${task.owner || ""}</td>
          <td>
            <input
              type="date"
              class="form-control form-control-sm task-start-input"
              data-task-id="${task.id}"
              value="${task.startDate}"
              ${task.status === "Done" ? "disabled" : ""}
            />
          </td>
          <td>${endDate}</td>
          <td>${task.durationDays}d</td>
          <td>
            <span class="${stClass}">${task.status}</span>
            ${frozenBadge}
          </td>
          <td>${dependsName}</td>
          <td>
            <div class="note-snippet" title="${task.notes?.replace(/"/g,'&quot;') || ""}">
              ${task.notes ? task.notes : "<span class='text-muted'>No notes</span>"}
            </div>
          </td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary btn-edit" data-task-id="${task.id}">Edit</button>
              <button class="btn btn-outline-secondary btn-notes" data-task-id="${task.id}">Notes</button>
              <button class="btn btn-outline-danger btn-delete" data-task-id="${task.id}">&times;</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      attachRowHandlers();
      renderTimeline();
      refillDependsOnDropdown();
    }

    // ------------------ RENDER: TIMELINE ------------------
    function renderTimeline() {
      const container = document.getElementById("timelinePreview");
      container.innerHTML = "";

      if (tasks.length === 0) {
        container.innerHTML = `<p class="text-muted fst-italic">No tasks yet.</p>`;
        return;
      }

      const starts = tasks.map(t => new Date(t.startDate + "T00:00:00"));
      const ends = tasks.map(t => new Date(computeEndDate(t) + "T00:00:00"));
      const minDate = new Date(Math.min(...starts));
      const maxDate = new Date(Math.max(...ends));
      const totalDays = Math.max(
        1,
        Math.round((maxDate - minDate)/(1000*60*60*24)) + 1
      );

      const tailIds = getTailTaskIds(tasks);

      tasks.forEach(t => {
        const startOffset =
          diffInDays(minDate.toISOString().slice(0,10), t.startDate);
        const barWidthPct = (t.durationDays / totalDays) * 100;
        const barMarginLeftPct = (startOffset / totalDays) * 100;

        const tailMark = (tailIds.includes(t.id) && isShiftEligible(t))
          ? " (Tail)"
          : "";

        const statusMark = (t.status === "Done")
          ? " (Done)"
          : (!isShiftEligible(t) && t.status !== "Done" ? " (No-Shift)" : "");

        const row = document.createElement("div");
        row.className = "gantt-row";

        row.innerHTML = `
          <div class="small d-flex justify-content-between">
            <span class="fw-semibold">${t.name}</span>
            <span class="text-muted">
              ${t.startDate} → ${computeEndDate(t)}${tailMark}${statusMark}
            </span>
          </div>
          <div class="position-relative bg-light border rounded" style="height:24px;">
            <div class="gantt-bar position-absolute"
                 style="left:${barMarginLeftPct}%; width:${barWidthPct}%;">
            </div>
          </div>
        `;
        container.appendChild(row);
      });
    }

    // ------------------ HANDLERS ------------------
    function attachRowHandlers() {
      // inline date change
      document.querySelectorAll(".task-start-input").forEach(input => {
        input.addEventListener("change", (e) => {
          const taskId = parseInt(e.target.getAttribute("data-task-id"));
          const newDate = e.target.value;
          const t = tasks.find(tsk => tsk.id === taskId);
          if (!t) return;
          const oldDate = t.startDate;

          // apply logic
          maybeShiftAllActiveTasks(taskId, oldDate, newDate);

          renderTaskTable();
        });
      });

      // edit form fill
      document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const taskId = parseInt(e.target.getAttribute("data-task-id"));
          const t = tasks.find(tsk => tsk.id === taskId);
          if (!t) return;
          fillFormForEdit(t);
        });
      });

      // notes modal
      document.querySelectorAll(".btn-notes").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const taskId = parseInt(e.target.getAttribute("data-task-id"));
          openNotesModal(taskId);
        });
      });

      // delete
      document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const taskId = parseInt(e.target.getAttribute("data-task-id"));
          tasks = tasks.filter(tsk => tsk.id !== taskId);
          renderTaskTable();
        });
      });
    }

    // ------------------ FORM LOGIC ------------------
    function refillDependsOnDropdown() {
      const select = document.getElementById("taskDependsOn");
      const currentIdVal = document.getElementById("taskId").value;
      select.innerHTML = `<option value="">-- None --</option>`;
      tasks.forEach(t => {
        if (currentIdVal && parseInt(currentIdVal) === t.id) return;
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = `#${t.id} ${t.name}`;
        select.appendChild(opt);
      });
    }

    function resetForm() {
      document.getElementById("taskId").value = "";
      document.getElementById("taskName").value = "";
      document.getElementById("taskOwner").value = "";
      document.getElementById("taskStart").value = "";
      document.getElementById("taskDuration").value = 1;
      document.getElementById("taskStatus").value = "New";
      document.getElementById("taskDependsOn").value = "";
      document.getElementById("taskNotes").value = "";
      refillDependsOnDropdown();
    }

    document.getElementById("formResetBtn").addEventListener("click", resetForm);

    function fillFormForEdit(task) {
      document.getElementById("taskId").value = task.id;
      document.getElementById("taskName").value = task.name;
      document.getElementById("taskOwner").value = task.owner;
      document.getElementById("taskStart").value = task.startDate;
      document.getElementById("taskDuration").value = task.durationDays;
      document.getElementById("taskStatus").value = task.status;
      document.getElementById("taskNotes").value = task.notes || "";
      refillDependsOnDropdown();
      document.getElementById("taskDependsOn").value = task.dependsOn || "";

      const formCollapse = new bootstrap.Collapse(
        document.getElementById('addTaskForm'),
        { show: true, toggle: false }
      );
      formCollapse.show();
    }

    document.getElementById("taskForm").addEventListener("submit", function(e){
      e.preventDefault();

      const idVal = document.getElementById("taskId").value;
      const nameVal = document.getElementById("taskName").value.trim();
      const ownerVal = document.getElementById("taskOwner").value.trim();
      const startVal = document.getElementById("taskStart").value;
      const durVal = parseInt(document.getElementById("taskDuration").value);
      const statusVal = document.getElementById("taskStatus").value;
      const depValRaw = document.getElementById("taskDependsOn").value;
      const depVal = depValRaw === "" ? null : parseInt(depValRaw);
      const notesVal = document.getElementById("taskNotes").value;

      if (!nameVal || !startVal || !durVal) {
        alert("Please fill Task Name, Start Date, and Duration.");
        return;
      }

      if (idVal) {
        // update existing
        const t = tasks.find(tsk => tsk.id === parseInt(idVal));
        if (t) {
          t.name = nameVal;
          t.owner = ownerVal;
          t.startDate = startVal;
          t.durationDays = durVal;
          t.status = statusVal;
          t.dependsOn = depVal;
          t.notes = notesVal;
        }
      } else {
        // create new task (default status "New" comes from UI)
        const newTask = {
          id: nextId++,
          name: nameVal,
          owner: ownerVal,
          startDate: startVal,
          durationDays: durVal,
          status: statusVal,
          dependsOn: depVal,
          notes: notesVal
        };
        tasks.push(newTask);
      }

      resetForm();
      renderTaskTable();
    });

    // ------------------ NOTES MODAL ------------------
    function openNotesModal(taskId){
      currentNotesTaskId = taskId;
      const t = tasks.find(tsk => tsk.id === taskId);
      if (!t) return;
      document.getElementById("notesTaskName").textContent = t.name;
      document.getElementById("notesModalTextarea").value = t.notes || "";

      const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
      notesModal.show();
    }

    document.getElementById("saveNotesBtn").addEventListener("click", () => {
      if (currentNotesTaskId == null) return;
      const t = tasks.find(tsk => tsk.id === currentNotesTaskId);
      if (!t) return;
      t.notes = document.getElementById("notesModalTextarea").value;
      renderTaskTable();
    });

    // ------------------ INIT ------------------
    resetForm();
    renderTaskTable();
  </script>
</body>
</html>
```

What’s new here for you:

* Full-screen dashboard layout (`body` flex, sticky dark header, fluid container workspace).
* Only `In Analysis` + `In Progress` tasks are considered "active / shift-eligible".
* Tasks in `New`, `Blocked`, and `Done`:

  * are ignored for global shift math
  * are not moved when other tasks move
  * if you edit their own date, they just update themselves and stop there
* Tail logic now also only looks at shift-eligible tasks (because those are the only ones we consider "the end of the active plan").

You can drop this as `index.html` and you're ready to play with it.

Love it. Let’s wire this into MongoDB so it’s not just in-memory anymore.

I’ll give you:

1. High-level architecture
2. MongoDB task schema
3. Node.js + Express REST API (with Mongoose)
4. Updates you make in the frontend to load/save tasks

This will give you a working full-stack: browser ↔ Express API ↔ MongoDB.

We’ll keep the same business rules (shift logic, tail logic, statuses) on the server so all users see the same schedule.

---

## 1. Architecture

* Frontend: the Bootstrap page you have.

  * Instead of `let tasks = [...]`, it will call backend APIs.
  * For every date edit, it will call an endpoint like `PUT /tasks/:id/startDate`.

* Backend: Node.js (Express)

  * Exposes REST endpoints:

    * `GET /tasks` → list tasks
    * `POST /tasks` → create task
    * `PUT /tasks/:id` → edit a task (name/status/etc.)
    * `PUT /tasks/:id/startDate` → special endpoint that runs the smart shift logic
    * `DELETE /tasks/:id` → delete a task
    * `PUT /tasks/:id/notes` → update notes (optional nice-to-have)

* Database: MongoDB with a `tasks` collection

  * We’ll use Mongoose for schema + queries.

Why keep shift logic in backend:

* Single source of truth.
* If two people are editing from two browsers, rules still hold.
* Frontend becomes thinner.

---

## 2. MongoDB Task Schema (Mongoose model)

Fields we already track:

```js
// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String },

  startDate: { type: String, required: true }, // store "YYYY-MM-DD" string for simplicity
  durationDays: { type: Number, required: true },

  status: {
    type: String,
    enum: ["New", "In Analysis", "In Progress", "Blocked", "Done"],
    default: "New"
  },

  dependsOn: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },

  notes: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
```

We’re storing `startDate` as a string `"2025-11-05"` because that made all our math easier. You can convert to `Date` later if you want.

---

## 3. Backend: server.js (Express + Mongoose)

Folder structure (simple version):

```text
project-scheduler/
  server.js
  models/
    Task.js
  package.json
  .env   <-- MONGODB_URI=mongodb://localhost:27017/scheduler
  public/
    index.html  <-- your UI (modified to call API)
```

### 3.1 Install dependencies

```bash
npm init -y
npm install express mongoose cors dotenv
```

### 3.2 `server.js`

This file:

* Connects to MongoDB
* Implements helper functions (date math, tail detection, shift logic)
* Exposes REST endpoints

```js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Task = require('./models/Task');

const app = express();
app.use(cors());
app.use(express.json());

// serve static frontend (optional if you drop index.html in /public)
app.use(express.static('public'));

// ---------- DB CONNECT ----------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// ---------- UTIL HELPERS (same logic as frontend) ----------
function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

function diffInDays(from, to) {
  const d1 = new Date(from + "T00:00:00");
  const d2 = new Date(to + "T00:00:00");
  return Math.round((d2 - d1) / (1000*60*60*24));
}

// "active" aka shift-eligible = In Analysis / In Progress
function isShiftEligible(task) {
  return task.status === "In Analysis" || task.status === "In Progress";
}

// getTailTaskIds(tasks):
// among shift-eligible tasks, find max startDate; all tasks with that max are tail.
function getTailTaskIds(taskList) {
  const eligible = taskList.filter(isShiftEligible);
  if (eligible.length === 0) return [];
  let maxDate = eligible[0].startDate;
  eligible.forEach(t => {
    if (t.startDate > maxDate) {
      maxDate = t.startDate;
    }
  });
  return eligible
    .filter(t => t.startDate === maxDate)
    .map(t => t._id.toString());
}

// ---------- ROUTES ----------

// 1. Get all tasks
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ startDate: 1, createdAt: 1 });
  res.json(tasks);
});

// 2. Create new task
app.post('/tasks', async (req, res) => {
  const {
    name,
    owner,
    startDate,
    durationDays,
    status,
    dependsOn,
    notes
  } = req.body;

  const task = new Task({
    name,
    owner,
    startDate,
    durationDays,
    status: status || "New",
    dependsOn: dependsOn || null,
    notes: notes || ""
  });

  const saved = await task.save();
  res.json(saved);
});

// 3. Update general task fields (not shifting others)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    owner,
    startDate,
    durationDays,
    status,
    dependsOn,
    notes
  } = req.body;

  // This is a direct overwrite (e.g. editing from Add/Edit form),
  // NOT the special shifting logic. We assume the form "Save Task" does this.
  const updated = await Task.findByIdAndUpdate(
    id,
    {
      name,
      owner,
      startDate,
      durationDays,
      status,
      dependsOn: dependsOn || null,
      notes
    },
    { new: true }
  );

  res.json(updated);
});

// 4. Update ONLY the notes field
app.put('/tasks/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const updated = await Task.findByIdAndUpdate(
    id,
    { notes },
    { new: true }
  );

  res.json(updated);
});

// 5. Delete task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.json({ ok: true });
});

// 6. Special endpoint: change startDate of ONE task and apply shift rules
app.put('/tasks/:id/startDate', async (req, res) => {
  const { id } = req.params;
  const { newStartDate } = req.body; // "YYYY-MM-DD"

  // Load all tasks first (entire board)
  let allTasks = await Task.find().sort({ createdAt: 1 });

  const editedTask = allTasks.find(t => t._id.toString() === id);
  if (!editedTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  const oldDate = editedTask.startDate;
  const newDate = newStartDate;
  const delta = diffInDays(oldDate, newDate);

  // CASE 1: if no change, just return
  if (delta === 0) {
    return res.json(allTasks);
  }

  // CASE 2: if edited is NOT shift-eligible
  // (status is New / Blocked / Done)
  if (!isShiftEligible(editedTask)) {
    // Update ONLY this task, except if Done (Done = frozen, we refuse shift)
    if (editedTask.status !== "Done") {
      editedTask.startDate = newDate;
      await editedTask.save();
    }
    // reload all and return
    allTasks = await Task.find().sort({ createdAt: 1 });
    return res.json(allTasks);
  }

  // CASE 3: edited IS shift-eligible.
  // Build preview with edited date applied
  const previewTasks = allTasks.map(t => {
    if (t._id.toString() === id) {
      return { ...t.toObject(), startDate: newDate };
    }
    return t.toObject();
  });

  // In preview, check if edited is still tail
  const previewTailIds = getTailTaskIds(previewTasks);
  const editedStillTail = previewTailIds.includes(id);

  if (editedStillTail) {
    // just update edited task's date
    editedTask.startDate = newDate;
    await editedTask.save();

    allTasks = await Task.find().sort({ createdAt: 1 });
    return res.json(allTasks);
  }

  // Otherwise: global shift.
  // Tail BEFORE shift = current tail among shift-eligible in allTasks
  const tailBeforeShiftIds = getTailTaskIds(allTasks);

  // Apply the delta to allowed tasks
  for (const task of allTasks) {
    const taskIdStr = task._id.toString();

    // non-eligible? skip (New / Blocked / Done remain unchanged)
    if (!isShiftEligible(task)) {
      // unless it's the editedTask (which *is* eligible already handled)
      continue;
    }

    if (taskIdStr === id) {
      // set the edited task to the new date
      task.startDate = newDate;
      continue;
    }

    // do not move tail-before-shift tasks
    if (tailBeforeShiftIds.includes(taskIdStr)) {
      continue;
    }

    // everyone else (eligible) moves by delta
    task.startDate = addDays(task.startDate, delta);
  }

  // Persist all changed tasks in DB
  const bulkOps = allTasks.map(t => ({
    updateOne: {
      filter: { _id: t._id },
      update: { $set: { startDate: t.startDate } }
    }
  }));
  await Task.bulkWrite(bulkOps);

  // Return fresh data
  allTasks = await Task.find().sort({ createdAt: 1 });
  res.json(allTasks);
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

That backend:

* Saves tasks
* Applies your shifting rules consistently
* Returns the fresh board after every change

---

## 4. Frontend changes (index.html)

Right now, the frontend:

* Keeps `tasks` in a local array
* Mutates it on date edit
* Rerenders

After integration:

* On load → `GET /tasks` to populate `tasks`
* "Save Task" form → `POST /tasks` or `PUT /tasks/:id`
* Delete → `DELETE /tasks/:id`
* Notes modal save → `PUT /tasks/:id/notes`
* When user changes the Start Date input in the table:

  * Instead of doing the shift logic locally,
  * call `PUT /tasks/:id/startDate` with `{ newStartDate: "YYYY-MM-DD" }`
  * backend returns the new full list
  * replace `tasks` with the response and re-render

So you mainly replace these parts:

### (A) Global `tasks` definition

```js
let tasks = [];
```

(no demo data in frontend anymore)

### (B) On page load, fetch tasks:

```js
async function loadTasks() {
  const res = await fetch('/tasks');
  tasks = await res.json();
  renderTaskTable();
}
```

Call `loadTasks()` at the end instead of hardcoding.

### (C) On inline date change:

Change this:

```js
input.addEventListener("change", async (e) => {
  const taskId = e.target.getAttribute("data-task-id");
  const newDate = e.target.value;

  // Call backend to apply shift logic
  const res = await fetch(`/tasks/${taskId}/startDate`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newStartDate: newDate })
  });

  tasks = await res.json();
  renderTaskTable();
});
```

Now the browser is no longer doing the scheduling math — the backend is.

### (D) On Save Task form submit:

If `taskId` is empty → create:

```js
const res = await fetch('/tasks', {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: nameVal,
    owner: ownerVal,
    startDate: startVal,
    durationDays: durVal,
    status: statusVal,
    dependsOn: depVal,
    notes: notesVal
  })
});
```

Otherwise → update:

```js
const res = await fetch(`/tasks/${idVal}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: nameVal,
    owner: ownerVal,
    startDate: startVal,
    durationDays: durVal,
    status: statusVal,
    dependsOn: depVal,
    notes: notesVal
  })
});
```

Then:

```js
await loadTasks();
resetForm();
```

### (E) On delete:

```js
await fetch(`/tasks/${taskId}`, { method: "DELETE" });
await loadTasks();
```

### (F) On saving notes from modal:

```js
await fetch(`/tasks/${currentNotesTaskId}/notes`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ notes })
});
await loadTasks();
```

---

## 5. How to run the full stack

1. Start MongoDB (local or Atlas).

   * Local example URI:
     `mongodb://localhost:27017/scheduler`

2. Create `.env` in project root:

   ```env
   MONGODB_URI=mongodb://localhost:27017/scheduler
   ```

3. Run:

   ```bash
   node server.js
   ```

4. Open browser at:

   * If you’re serving `public/index.html` using `express.static('public')`, go to
     `http://localhost:4000/`

You now have:

* Full-screen Bootstrap UI
* Centralized shift logic in backend
* Persistent data in MongoDB
* Status-aware, tail-aware, priority-aware scheduling just like you designed 👑

If you want next step (JWT auth, multi-project support / projectId field, audit trail of shifts), we can layer that on top.

Absolutely. I'll give you a full `public/index.html` that talks to the Express + MongoDB backend we just designed.

This version:

* Uses Bootstrap full-screen layout (navbar + scrollable workspace).
* Loads tasks from `/tasks` on page load.
* Renders the table and timeline exactly with the business rules we locked in.
* "Save Task" form creates/updates tasks through the API.
* Inline date change in the table calls `/tasks/:id/startDate` so backend runs the shift logic.
* Notes modal updates via `/tasks/:id/notes`.
* Delete calls `DELETE /tasks/:id`.

You can copy this file into `public/index.html` inside the Node project (where `server.js` is serving `express.static('public')`).

---

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Project Scheduler - Active Timeline Control</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Bootstrap -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />

  <style>
    body {
      background-color: #f8f9fa;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header.navbar {
      flex-shrink: 0;
    }

    main.workspace {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: 1rem;
    }

    .status-chip {
      font-size: .7rem;
      padding: .4rem .5rem;
      border-radius: .5rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .status-new         { background-color:#0d6efd; color:#fff; }
    .status-analysis    { background-color:#6f42c1; color:#fff; }
    .status-progress    { background-color:#ffc107; color:#000; }
    .status-blocked     { background-color:#dc3545; color:#fff; }
    .status-done        { background-color:#198754; color:#fff; }

    .badge-frozen {
      font-size: .6rem;
      background:#0d6efd;
    }

    .note-snippet {
      max-width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: .8rem;
      color:#6c757d;
    }

    .gantt-wrapper {
      background-color:#fff;
      border:1px solid #dee2e6;
      border-radius:.5rem;
      padding:1rem;
      box-shadow:0 .25rem .5rem rgba(0,0,0,.05);
    }
    .gantt-row {
      margin-bottom:1rem;
    }
    .gantt-bar {
      height: 20px;
      border-radius: 4px;
      background-color: rgba(13,110,253,.4);
    }

    .panel {
      background-color:#fff;
      border:1px solid #dee2e6;
      border-radius:.5rem;
      box-shadow:0 .25rem .5rem rgba(0,0,0,.05);
      margin-bottom:1rem;
    }

    .panel-header {
      background-color:#fff;
      border-bottom:1px solid #dee2e6;
      padding:.75rem 1rem;
      display:flex;
      justify-content:space-between;
      align-items:center;
    }

    .panel-body {
      padding:1rem;
    }

    .table-fixed td,
    .table-fixed th {
      vertical-align: middle;
    }

    .small-hint {
      font-size:.75rem;
      color:#6c757d;
    }
  </style>
</head>
<body>

  <!-- Navbar -->
  <header class="navbar navbar-dark bg-dark">
    <div class="container-fluid">
      <span class="navbar-brand fw-semibold">Project Scheduler</span>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-light btn-sm"
          data-bs-toggle="collapse"
          data-bs-target="#addTaskForm"
        >
          + Add / Edit Task
        </button>
      </div>
    </div>
  </header>

  <!-- Workspace -->
  <main class="workspace container-fluid">

    <!-- Collapsible Task Form -->
    <div class="collapse panel" id="addTaskForm">
      <div class="panel-header bg-primary text-white rounded-top">
        <strong>Create / Update Task</strong>
      </div>
      <div class="panel-body bg-white rounded-bottom">
        <form id="taskForm" class="row g-3">
          <input type="hidden" id="taskId" />

          <div class="col-md-3 col-lg-2">
            <label class="form-label">Task Name</label>
            <input type="text" id="taskName" class="form-control form-control-sm" required />
          </div>

          <div class="col-md-3 col-lg-2">
            <label class="form-label">Owner</label>
            <input type="text" id="taskOwner" class="form-control form-control-sm" placeholder="Susi / Ramesh" />
          </div>

          <div class="col-md-2 col-lg-2">
            <label class="form-label">Start Date</label>
            <input type="date" id="taskStart" class="form-control form-control-sm" required />
          </div>

          <div class="col-md-2 col-lg-2">
            <label class="form-label">Duration (days)</label>
            <input type="number" id="taskDuration" class="form-control form-control-sm" min="1" value="1" required />
          </div>

          <div class="col-md-2 col-lg-2">
            <label class="form-label">Status</label>
            <select id="taskStatus" class="form-select form-select-sm">
              <option>New</option>
              <option>In Analysis</option>
              <option>In Progress</option>
              <option>Blocked</option>
              <option>Done</option>
            </select>
          </div>

          <div class="col-md-3 col-lg-2">
            <label class="form-label">Depends On (info)</label>
            <select id="taskDependsOn" class="form-select form-select-sm">
              <option value="">-- None --</option>
            </select>
            <div class="form-text small-hint">
              Only for visibility. Does NOT drive shifting.
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <label class="form-label">Notes</label>
            <textarea id="taskNotes" class="form-control form-control-sm" rows="2"
              placeholder="Context, risk, blockers..."></textarea>
          </div>

          <div class="col-12">
            <div class="alert alert-info py-2 mb-2 small">
              Scheduling rules:<br/>
              • Only tasks in <b>In Analysis</b> or <b>In Progress</b> are considered active and can shift.<br/>
              • Tasks in <b>New</b>, <b>Blocked</b>, or <b>Done</b> are never moved by global shift and are ignored in calculations.<br/>
              • Tail protection: the farthest active task(s) in the future won't move when others shift.<br/>
              • If you edit a tail task and it stays tail, nothing else shifts.<br/>
              • If you pull a tail task earlier so it's no longer last, other active tasks may shift to follow it.
            </div>
          </div>

          <div class="col-12">
            <button class="btn btn-primary btn-sm" type="submit">Save Task</button>
            <button class="btn btn-secondary btn-sm" type="button" id="formResetBtn">Reset</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Task Table -->
    <div class="panel">
      <div class="panel-header">
        <strong>Task List</strong>
        <span class="small-hint">
          Edit Start Date → backend applies shift rules
        </span>
      </div>
      <div class="panel-body p-0">
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0 table-fixed" id="taskTable">
            <thead class="table-light">
              <tr>
                <th style="width:3rem">#</th>
                <th>Task</th>
                <th>Owner</th>
                <th>Start</th>
                <th>End</th>
                <th>Dur</th>
                <th>Status</th>
                <th>Depends On</th>
                <th>Notes</th>
                <th style="width:7rem">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- rows injected by JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Timeline Preview -->
    <div class="gantt-wrapper">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <strong>Timeline Preview</strong>
        <span class="small-hint">
          "(Tail)" = last active task(s). They won't shift as followers.
        </span>
      </div>
      <div id="timelinePreview">
        <!-- bars injected by JS -->
      </div>
    </div>

  </main>

  <!-- Notes Modal -->
  <div class="modal fade" id="notesModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Edit Notes: <span id="notesTaskName" class="fw-semibold"></span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"
                  aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <textarea id="notesModalTextarea" class="form-control" rows="10"></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary btn-sm" id="saveNotesBtn" data-bs-dismiss="modal">Save</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap JS bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <script>
    // ========= UTIL HELPERS (UI only) =========
    function addDays(dateStr, days) {
      const d = new Date(dateStr + "T00:00:00");
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0,10);
    }

    function diffInDays(from, to) {
      const d1 = new Date(from + "T00:00:00");
      const d2 = new Date(to + "T00:00:00");
      return Math.round((d2 - d1) / (1000*60*60*24));
    }

    function computeEndDate(task) {
      return addDays(task.startDate, task.durationDays - 1);
    }

    function statusClass(status){
      switch(status){
        case "New":          return "status-chip status-new";
        case "In Analysis":  return "status-chip status-analysis";
        case "In Progress":  return "status-chip status-progress";
        case "Blocked":      return "status-chip status-blocked";
        case "Done":         return "status-chip status-done";
        default:             return "status-chip bg-secondary text-white";
      }
    }

    function isShiftEligible(t) {
      return t.status === "In Analysis" || t.status === "In Progress";
    }

    // among shift-eligible tasks, figure out the max startDate -> tail
    function getTailTaskIds(taskList) {
      const eligible = taskList.filter(isShiftEligible);
      if (eligible.length === 0) return [];
      let maxDate = eligible[0].startDate;
      eligible.forEach(t => {
        if (t.startDate > maxDate) {
          maxDate = t.startDate;
        }
      });
      return eligible
        .filter(t => t.startDate === maxDate)
        .map(t => t._id);
    }

    // ========= GLOBAL STATE =========
    let tasks = [];
    let nextIdClientOnly = 0; // not really used; server assigns _id
    let currentNotesTaskId = null;

    // ========= API HELPERS =========
    async function loadTasks() {
      const res = await fetch('/tasks');
      tasks = await res.json();
      renderTaskTable();
    }

    async function apiCreateTask(taskPayload) {
      const res = await fetch('/tasks', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskPayload)
      });
      return res.json();
    }

    async function apiUpdateTask(taskId, taskPayload) {
      const res = await fetch(`/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskPayload)
      });
      return res.json();
    }

    async function apiDeleteTask(taskId) {
      await fetch(`/tasks/${taskId}`, { method: "DELETE" });
    }

    async function apiUpdateNotes(taskId, notes) {
      const res = await fetch(`/tasks/${taskId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes })
      });
      return res.json();
    }

    async function apiShiftStartDate(taskId, newDate) {
      // backend will do all the scheduling math + shifting + tail logic.
      const res = await fetch(`/tasks/${taskId}/startDate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStartDate: newDate })
      });
      tasks = await res.json(); // replace entire board
      renderTaskTable();
    }

    // ========= RENDER: TABLE =========
    function renderTaskTable() {
      const tbody = document.querySelector("#taskTable tbody");
      tbody.innerHTML = "";

      tasks.forEach((task, index) => {
        const endDate = computeEndDate(task);
        const stClass = statusClass(task.status);

        const dependsName = task.dependsOn
          ? (tasks.find(t => t._id === task.dependsOn)?.name || "[Missing]")
          : "<span class='text-muted'>None</span>";

        const frozenBadge =
          task.status === "Done"
          ? `<span class="badge badge-frozen ms-1">Frozen</span>`
          : "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index+1}</td>
          <td class="fw-semibold">${task.name}</td>
          <td>${task.owner || ""}</td>
          <td>
            <input
              type="date"
              class="form-control form-control-sm task-start-input"
              data-task-id="${task._id}"
              value="${task.startDate}"
              ${task.status === "Done" ? "disabled" : ""}
            />
          </td>
          <td>${endDate}</td>
          <td>${task.durationDays}d</td>
          <td>
            <span class="${stClass}">${task.status}</span>
            ${frozenBadge}
          </td>
          <td>${dependsName}</td>
          <td>
            <div class="note-snippet" title="${task.notes?.replace(/"/g,'&quot;') || ""}">
              ${task.notes ? task.notes : "<span class='text-muted'>No notes</span>"}
            </div>
          </td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary btn-edit" data-task-id="${task._id}">Edit</button>
              <button class="btn btn-outline-secondary btn-notes" data-task-id="${task._id}">Notes</button>
              <button class="btn btn-outline-danger btn-delete" data-task-id="${task._id}">&times;</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      attachRowHandlers();
      renderTimeline();
      refillDependsOnDropdown();
      resetForm(); // keep form clean after rerender
    }

    // ========= RENDER: TIMELINE =========
    function renderTimeline() {
      const container = document.getElementById("timelinePreview");
      container.innerHTML = "";

      if (tasks.length === 0) {
        container.innerHTML = `<p class="text-muted fst-italic">No tasks yet.</p>`;
        return;
      }

      const starts = tasks.map(t => new Date(t.startDate + "T00:00:00"));
      const ends = tasks.map(t => new Date(computeEndDate(t) + "T00:00:00"));
      const minDate = new Date(Math.min(...starts));
      const maxDate = new Date(Math.max(...ends));
      const totalDays = Math.max(
        1,
        Math.round((maxDate - minDate)/(1000*60*60*24)) + 1
      );

      const tailIds = getTailTaskIds(tasks);

      tasks.forEach(t => {
        const startOffset =
          diffInDays(minDate.toISOString().slice(0,10), t.startDate);
        const barWidthPct = (t.durationDays / totalDays) * 100;
        const barMarginLeftPct = (startOffset / totalDays) * 100;

        const tailMark =
          (tailIds.includes(t._id) && isShiftEligible(t))
          ? " (Tail)"
          : "";

        const statusMark =
          (t.status === "Done")
            ? " (Done)"
            : (!isShiftEligible(t) && t.status !== "Done"
                ? " (No-Shift)" : "");

        const row = document.createElement("div");
        row.className = "gantt-row";

        row.innerHTML = `
          <div class="small d-flex justify-content-between">
            <span class="fw-semibold">${t.name}</span>
            <span class="text-muted">
              ${t.startDate} → ${computeEndDate(t)}${tailMark}${statusMark}
            </span>
          </div>
          <div class="position-relative bg-light border rounded" style="height:24px;">
            <div class="gantt-bar position-absolute"
                 style="left:${barMarginLeftPct}%; width:${barWidthPct}%;">
            </div>
          </div>
        `;
        container.appendChild(row);
      });
    }

    // ========= HANDLERS (TABLE BUTTONS + DATE FIELDS) =========
    function attachRowHandlers() {
      // change Start Date (this triggers backend shift logic)
      document.querySelectorAll(".task-start-input").forEach(input => {
        input.addEventListener("change", async (e) => {
          const taskId = e.target.getAttribute("data-task-id");
          const newDate = e.target.value;
          await apiShiftStartDate(taskId, newDate);
        });
      });

      // edit button → load task data into form for update
      document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const taskId = e.target.getAttribute("data-task-id");
          const t = tasks.find(tsk => tsk._id === taskId);
          if (!t) return;
          fillFormForEdit(t);
        });
      });

      // notes button → open modal
      document.querySelectorAll(".btn-notes").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const taskId = e.target.getAttribute("data-task-id");
          openNotesModal(taskId);
        });
      });

      // delete
      document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const taskId = e.target.getAttribute("data-task-id");
          await apiDeleteTask(taskId);
          await loadTasks();
        });
      });
    }

    // ========= FORM HELPERS =========
    function refillDependsOnDropdown() {
      const select = document.getElementById("taskDependsOn");
      const currentIdVal = document.getElementById("taskId").value;
      select.innerHTML = `<option value="">-- None --</option>`;
      tasks.forEach(t => {
        if (currentIdVal && currentIdVal === t._id) return;
        const opt = document.createElement("option");
        opt.value = t._id;
        opt.textContent = `#${t._id} ${t.name}`;
        select.appendChild(opt);
      });
    }

    function resetForm() {
      document.getElementById("taskId").value = "";
      document.getElementById("taskName").value = "";
      document.getElementById("taskOwner").value = "";
      document.getElementById("taskStart").value = "";
      document.getElementById("taskDuration").value = 1;
      document.getElementById("taskStatus").value = "New";
      document.getElementById("taskDependsOn").value = "";
      document.getElementById("taskNotes").value = "";
      refillDependsOnDropdown();
    }

    function fillFormForEdit(task) {
      document.getElementById("taskId").value = task._id;
      document.getElementById("taskName").value = task.name;
      document.getElementById("taskOwner").value = task.owner || "";
      document.getElementById("taskStart").value = task.startDate;
      document.getElementById("taskDuration").value = task.durationDays;
      document.getElementById("taskStatus").value = task.status;
      document.getElementById("taskNotes").value = task.notes || "";
      refillDependsOnDropdown();
      document.getElementById("taskDependsOn").value = task.dependsOn || "";

      // open the collapse
      const formCollapse = new bootstrap.Collapse(
        document.getElementById('addTaskForm'),
        { show: true, toggle: false }
      );
      formCollapse.show();
    }

    document.getElementById("formResetBtn").addEventListener("click", resetForm);

    // ========= FORM SUBMIT (CREATE/UPDATE TASK) =========
    document.getElementById("taskForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const idVal = document.getElementById("taskId").value;
      const nameVal = document.getElementById("taskName").value.trim();
      const ownerVal = document.getElementById("taskOwner").value.trim();
      const startVal = document.getElementById("taskStart").value;
      const durVal = parseInt(document.getElementById("taskDuration").value);
      const statusVal = document.getElementById("taskStatus").value;
      const depValRaw = document.getElementById("taskDependsOn").value;
      const depVal = depValRaw === "" ? null : depValRaw;
      const notesVal = document.getElementById("taskNotes").value;

      if (!nameVal || !startVal || !durVal) {
        alert("Please fill Task Name, Start Date, and Duration.");
        return;
      }

      const payload = {
        name: nameVal,
        owner: ownerVal,
        startDate: startVal,
        durationDays: durVal,
        status: statusVal,
        dependsOn: depVal,
        notes: notesVal
      };

      if (idVal) {
        // update existing
        await apiUpdateTask(idVal, payload);
      } else {
        // create new
        await apiCreateTask(payload);
      }

      await loadTasks();
    });

    // ========= NOTES MODAL =========
    function openNotesModal(taskId){
      currentNotesTaskId = taskId;
      const t = tasks.find(tsk => tsk._id === taskId);
      if (!t) return;
      document.getElementById("notesTaskName").textContent = t.name;
      document.getElementById("notesModalTextarea").value = t.notes || "";

      const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
      notesModal.show();
    }

    document.getElementById("saveNotesBtn").addEventListener("click", async () => {
      if (!currentNotesTaskId) return;
      const newNotes = document.getElementById("notesModalTextarea").value;
      await apiUpdateNotes(currentNotesTaskId, newNotes);
      await loadTasks();
    });

    // ========= INIT =========
    loadTasks();
  </script>
</body>
</html>
```

---

### How to use this now

1. Put this file in `public/index.html`.
2. Run MongoDB.
3. Run `node server.js`.
4. Open `http://localhost:4000/`.

From that point:

* When you edit a task’s start date in the table, the frontend calls `PUT /tasks/:id/startDate`.
  The backend:

  * Finds which tasks are active (In Analysis, In Progress)
  * Figures out tail protection
  * Ignores New / Blocked / Done during shifting
  * Updates all impacted tasks in MongoDB
  * Returns the full updated list
* The UI rerenders.

This gives you a real scheduling board backed by Mongo, with your priority logic, tail logic, and status logic enforced centrally.
