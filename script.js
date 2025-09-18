
        // Data state
        let currentRoom = null;
        let roomUsers = [];
        const taskStore = { items: [] }; // persistent-in-memory list for richer tasks

        // Fungsi untuk memperbarui waktu dan tanggal secara real-time
        function updateDateTime() {
            const now = new Date();

            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const weekdays = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
            const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

            const d = String(now.getDate()).padStart(2, '0');
            const m = months[now.getMonth()];
            const y = now.getFullYear();
            const w = weekdays[now.getDay()];

            document.getElementById('time').innerHTML = `<i class="fas fa-clock"></i> ${hours}<span class="colon blink">:</span>${minutes}<span class="colon blink">:</span>${seconds}`;
            document.getElementById('date').innerHTML = `<i class=\"fas fa-calendar-alt\"></i> ${w}, ${d} ${m} ${y}`;
        }

        // Memperbarui waktu setiap detik
        updateDateTime();
        setInterval(updateDateTime, 1000);

        // Fungsi pencarian
        function searchItems() {
            const searchText = document.getElementById('searchInput').value.toLowerCase();
            const items = document.querySelectorAll('.item-list li');
            let found = false;

            items.forEach(item => {
                const itemText = item.textContent.toLowerCase();
                if (itemText.includes(searchText)) {
                    item.style.display = 'flex';
                    item.style.animation = 'highlight 1s ease';
                    found = true;
                } else {
                    item.style.display = 'none';
                }
            });

            if (!found && searchText) {
                showNotification("Pencarian tidak ditemukan");
            } else if (searchText) {
                showNotification(`Ditemukan ${document.querySelectorAll('.item-list li[style="display: flex;"]').length} hasil`);
            }
        }

        // Event listener untuk input pencarian
        document.getElementById('searchInput').addEventListener('keyup', searchItems);

        // Event listener untuk tekan Enter di input pencarian
        document.getElementById('searchInput').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchItems();
            }
        });

        // Fungsi notifikasi
        function showNotification(message = "Selamat! Aplikasi MyTodo siap digunakan.") {
            const notification = document.getElementById('notification');
            notification.querySelector('div').textContent = message;
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Animasi progress bar
        document.querySelectorAll('.progress').forEach(progress => {
            const width = progress.style.width;
            progress.style.width = '0';

            setTimeout(() => {
                progress.style.width = width;
            }, 500);
        });

        // Animasi untuk item list
        function attachItemBehaviors(item, index = 0) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';

            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100 * index);

            // toggle selesai saat klik
            item.addEventListener('click', (e) => {
                // biarkan klik pada ikon/tombol internal tetap berfungsi
                if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;
                item.classList.toggle('done');
                // kelola tombol hapus per item
                const next = item.nextElementSibling;
                if (item.classList.contains('done')) {
                    if (!next || !next.classList.contains('delete-row')) {
                        const row = document.createElement('div');
                        row.className = 'delete-row';
                        row.innerHTML = `<button class="complete-btn"><i class=\"fas fa-check\"></i> Selesai</button><button class="delete-btn"><i class=\"fas fa-trash\"></i> Hapus</button>`;
                        item.parentElement.insertBefore(row, item.nextElementSibling);
                        const delBtn = row.querySelector('.delete-btn');
                        const doneBtn = row.querySelector('.complete-btn');
                        delBtn.addEventListener('click', (ev) => {
                            ev.stopPropagation();
                            row.remove();
                            item.remove();
                            updateProgressBar();
                            updateClearCompletedFab && updateClearCompletedFab();
                            showNotification('Tugas dihapus.');
                        });
                        doneBtn.addEventListener('click', (ev) => {
                            ev.stopPropagation();
                            item.classList.add('done');
                            updateClearCompletedFab && updateClearCompletedFab();
                            showNotification('Tugas ditandai selesai.');
                        });
                    }
                } else {
                    if (next && next.classList.contains('delete-row')) next.remove();
                }
                updateClearCompletedFab && updateClearCompletedFab();
            });
        }

        document.querySelectorAll('.item-list li').forEach((item, index) => attachItemBehaviors(item, index));

        // Tampilkan notifikasi saat pertama kali load
        setTimeout(showNotification, 1000);

        // Scroll reveal with IntersectionObserver
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        // Fungsi untuk modal tambah tugas
        function openAddTaskModal() {
            document.getElementById('addTaskModal').style.display = 'flex';
        }

        function closeAddTaskModal() {
            document.getElementById('addTaskModal').style.display = 'none';
            // Reset form
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskPriority').value = 'medium';
            document.getElementById('taskDue').value = '';
            document.getElementById('taskAssignee').value = '';
            document.getElementById('taskTags').value = '';
            document.getElementById('taskChecklist').value = '';
        }

        function addNewTask() {
            const title = document.getElementById('taskTitle').value.trim();
            const category = document.getElementById('taskCategory').value;
            const description = document.getElementById('taskDescription').value.trim();
            const priority = document.getElementById('taskPriority').value;
            const due = document.getElementById('taskDue').value;
            const assignee = document.getElementById('taskAssignee').value.trim();
            const tags = document.getElementById('taskTags').value.split(',').map(t => t.trim()).filter(Boolean);
            const checklistRaw = document.getElementById('taskChecklist').value.split('\n').map(t => t.trim()).filter(Boolean);

            if (!title) {
                showNotification('Judul tugas tidak boleh kosong!');
                return;
            }

            const newTask = {
                id: 'tsk_' + Math.random().toString(36).slice(2, 9),
                title, description, category, priority, due, assignee, tags,
                checklist: checklistRaw.map(text => ({ text, done: false }))
            };
            taskStore.items.push(newTask);

            // Render ke list
            const listId = category === 'active' ? 'active-projects' : 'progress-tasks';
            const list = document.getElementById(listId);

            const newItem = document.createElement('li');
            const meta = renderMetaChips(newTask);
            const right = category === 'active'
                ? '<span><i class="fas fa-check-circle"></i></span>'
                : '<span class="progress-indicator"><span class=\"loader-spinner\"></span><small>Dalam pengerjaan</small></span>';
            newItem.innerHTML = `${escapeHtml(title)} <span class="meta-row">${meta}</span> ${right} <button class="info-btn" data-open-detail="${newTask.id}" title="Detail"><i class="fas fa-circle-info"></i></button>`;

            // animasi
            newItem.style.opacity = '0';
            newItem.style.transform = 'translateX(-20px)';
            list.appendChild(newItem);
            setTimeout(() => {
                newItem.style.transition = 'all 0.5s ease';
                newItem.style.opacity = '1';
                newItem.style.transform = 'translateX(0)';
            }, 10);

            attachItemBehaviors(newItem, 0);

            // bind open detail
            newItem.querySelector('[data-open-detail]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.currentTarget.getAttribute('data-open-detail');
                openTaskDetailModal(id);
            });

            updateProgressBar();
            closeAddTaskModal();
            showNotification('Tugas berhasil ditambahkan!');
        }

        function escapeHtml(str) {
            return str.replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
        }

        function renderMetaChips(task) {
            const prioClass = {
                low: 'priority-low',
                medium: 'priority-medium',
                high: 'priority-high',
                critical: 'priority-critical'
            }[task.priority] || 'priority-medium';
            const chips = [];
            chips.push(`<span class="meta-chip ${prioClass}"><i class=\"fas fa-flag\"></i>${task.priority}</span>`);
            if (task.due) chips.push(`<span class=\"meta-chip\"><i class=\"fas fa-calendar-day\"></i>${task.due}</span>`);
            if (task.assignee) chips.push(`<span class=\"meta-chip\"><i class=\"fas fa-user\"></i>${escapeHtml(task.assignee)}</span>`);
            task.tags.slice(0,3).forEach(t => chips.push(`<span class=\"meta-chip\"><i class=\"fas fa-tag\"></i>${escapeHtml(t)}</span>`));
            return chips.join('');
        }

        function openTaskDetailModal(taskId) {
            const task = taskStore.items.find(t => t.id === taskId);
            if (!task) return;
            const body = document.getElementById('taskDetailBody');
            const tags = task.tags.map(t => `<span class=\"meta-chip\"><i class=\"fas fa-tag\"></i>${escapeHtml(t)}</span>`).join(' ');
            const checklist = task.checklist.length
                ? `<ul style=\"margin-top:8px; padding-left:18px;\">${task.checklist.map((c,i)=>`<li>${escapeHtml(c.text)}</li>`).join('')}</ul>`
                : '<div style="color:#64748b">(Tidak ada checklist)</div>';
            body.innerHTML = `
                <div style=\"display:grid; gap:12px;\">
                    <div><strong>Judul:</strong> ${escapeHtml(task.title)}</div>
                    <div><strong>Deskripsi:</strong><br>${task.description ? escapeHtml(task.description) : '<span style=\"color:#64748b\">(Kosong)</span>'}</div>
                    <div><strong>Kategori:</strong> ${task.category}</div>
                    <div><strong>Prioritas:</strong> ${task.priority}</div>
                    <div><strong>Tenggat:</strong> ${task.due || '-'}</div>
                    <div><strong>PIC:</strong> ${task.assignee || '-'}</div>
                    <div><strong>Tag:</strong> ${tags || '-'}</div>
                    <div><strong>Checklist Awal:</strong>${checklist}</div>
                </div>
            `;
            document.getElementById('taskDetailModal').style.display = 'flex';
        }

        function closeTaskDetailModal() {
            document.getElementById('taskDetailModal').style.display = 'none';
        }

        function updateProgressBar() {
            // Simulasi update progress bar (bisa disesuaikan dengan logika bisnis)
            const activeProjects = document.getElementById('active-projects').children.length;
            const progressTasks = document.getElementById('progress-tasks').children.length;

            const totalTasks = activeProjects + progressTasks;
            const completedTasks = activeProjects; // Asumsi: semua active projects selesai

            const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            document.querySelectorAll('.progress').forEach(progress => {
                progress.style.width = `${progressPercentage}%`;
            });
        }

        // Hapus item yang sudah selesai
        function clearCompleted(listId) {
            const list = document.getElementById(listId);
            Array.from(list.querySelectorAll('li.done')).forEach(li => li.remove());
            updateProgressBar();
            showNotification('Tugas selesai telah dihapus.');
        }

        document.getElementById('clear-active').addEventListener('click', () => clearCompleted('active-projects'));
        document.getElementById('clear-progress').addEventListener('click', () => clearCompleted('progress-tasks'));

        // legacy no-op after removing bottom-left FAB
        function updateClearCompletedFab() {}

        // ====== Checklist / Subtasks Model & UI ======
        const tasks = {
            t1: { title: 'Rilis v1.0', subtasks: [] }
        };

        // ====== Sidebar Calendar (This Month) ======
        function renderSidebarCalendar(targetId) {
            const host = document.getElementById(targetId);
            if (!host) return;
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth(); // 0..11
            const first = new Date(year, month, 1);
            const last = new Date(year, month + 1, 0);
            const startWeekday = (first.getDay() + 6) % 7; // make Monday=0
            const totalDays = last.getDate();

            const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
            const dows = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];

            let html = `<div class=\"calendar\">`;
            html += `<div class=\"cal-head\">${months[month]} ${year}</div>`;
            html += `<div class=\"cal-grid\">`;
            dows.forEach(d => html += `<div class=\"cal-cell cal-dow\">${d}</div>`);

            // leading blanks from prev month
            for (let i = 0; i < startWeekday; i++) {
                html += `<div class=\"cal-cell cal-day muted\"></div>`;
            }
            for (let d = 1; d <= totalDays; d++) {
                const isToday = d === now.getDate();
                html += `<div class=\"cal-cell cal-day ${isToday ? 'today' : ''}\">${d}</div>`;
            }
            // trailing blanks to complete rows to multiples of 7
            const cellsSoFar = 7 + startWeekday + totalDays; // +7 for dows
            const remainder = cellsSoFar % 7;
            if (remainder) {
                for (let i = remainder; i < 7; i++) html += `<div class=\"cal-cell cal-day muted\"></div>`;
            }
            html += `</div>`; // grid
            html += `<div class=\"cal-foot\">Today: ${now.getDate()} ${months[month]} ${year}</div>`;
            html += `</div>`;
            host.innerHTML = html;
        }

        function renderChecklist(taskId) {
            const card = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
            if (!card) return;
            const listEl = card.querySelector('[data-list]');
            const countEl = card.querySelector('[data-count]');
            const progressEl = card.querySelector('.task-progress .progress');

            listEl.innerHTML = '';
            const items = tasks[taskId].subtasks;
            let done = 0;
            items.forEach((st, idx) => {
                if (st.done) done++;
                const row = document.createElement('div');
                row.className = `subtask-row ${st.done ? 'completed' : ''}`;
                row.innerHTML = `
                    <input type="checkbox" ${st.done ? 'checked' : ''} data-idx="${idx}">
                    <div class="subtask-label">${st.text}</div>
                    <button class="subtask-adduser" title="Tambahkan penyelesai" data-adduser="${idx}"><i class="fas fa-user-plus"></i></button>
                    <button class="subtask-remove" title="Hapus" data-remove="${idx}"><i class="fas fa-trash"></i></button>
                `;
                listEl.appendChild(row);

                const completedByWrap = document.createElement('div');
                completedByWrap.className = 'completed-by';
                (st.completedBy || []).forEach((name, nidx) => {
                    const chip = document.createElement('span');
                    chip.className = 'user-chip';
                    chip.innerHTML = `<i class="fas fa-user"></i> ${name} <button title="hapus" data-removeuser="${idx}:${nidx}"><i class="fas fa-times"></i></button>`;
                    completedByWrap.appendChild(chip);
                });
                listEl.appendChild(completedByWrap);
            });

            countEl.textContent = `${done}/${items.length}`;
            const pct = items.length ? Math.round((done / items.length) * 100) : 0;
            progressEl.style.width = pct + '%';
        }

        function bindChecklistEvents() {
            document.querySelectorAll('.task-card').forEach(card => {
                const taskId = card.getAttribute('data-task-id');
                const toggleBtn = card.querySelector('[data-toggle]');
                const checklist = card.querySelector('[data-checklist]');
                const addBtn = card.querySelector('[data-add]');
                const input = card.querySelector('[data-input]');
                const listEl = card.querySelector('[data-list]');
                const userSelect = card.querySelector('[data-user]');

                toggleBtn.onclick = () => {
                    checklist.classList.toggle('open');
                };
                addBtn.onclick = () => {
                    const val = input.value.trim();
                    if (!val) return;
                    tasks[taskId].subtasks.push({ text: val, done: false, completedBy: [] });
                    input.value = '';
                    renderChecklist(taskId);
                };
                input.addEventListener('keypress', e => {
                    if (e.key === 'Enter') addBtn.click();
                });

                listEl.addEventListener('change', e => {
                    if (e.target.matches('input[type="checkbox"]')) {
                        const idx = Number(e.target.getAttribute('data-idx'));
                        tasks[taskId].subtasks[idx].done = e.target.checked;
                        renderChecklist(taskId);
                    }
                });
                listEl.addEventListener('click', e => {
                    const btn = e.target.closest('[data-remove]');
                    if (!btn) return;
                    const idx = Number(btn.getAttribute('data-remove'));
                    tasks[taskId].subtasks.splice(idx, 1);
                    renderChecklist(taskId);
                });
                listEl.addEventListener('click', e => {
                    const addBtn = e.target.closest('[data-adduser]');
                    if (addBtn) {
                        const idx = Number(addBtn.getAttribute('data-adduser'));
                        const name = userSelect ? userSelect.value : 'Anda';
                        const arr = tasks[taskId].subtasks[idx].completedBy || (tasks[taskId].subtasks[idx].completedBy = []);
                        if (!arr.includes(name)) arr.push(name);
                        renderChecklist(taskId);
                        return;
                    }
                    const rmChip = e.target.closest('[data-removeuser]');
                    if (rmChip) {
                        const [sidx, nidx] = rmChip.getAttribute('data-removeuser').split(':').map(Number);
                        const arr = tasks[taskId].subtasks[sidx].completedBy || [];
                        arr.splice(nidx, 1);
                        renderChecklist(taskId);
                    }
                });
            });
        }

        // init
        renderChecklist('t1');
        bindChecklistEvents();

        // Live tags preview on add-task modal
        const tagsInput = document.getElementById('taskTags');
        const tagsPreview = document.getElementById('tagsPreview');
        function renderTagsPreview() {
            const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
            tagsPreview.innerHTML = tags.map(t => `<span class=\"pill\"><i class=\"fas fa-tag\"></i>${escapeHtml(t)}</span>`).join('');
        }
        tagsInput.addEventListener('input', renderTagsPreview);
        renderTagsPreview();

        // Render calendar and toggle behavior
        renderSidebarCalendar('sidebarCalendar');
        const thisMonthToggle = document.getElementById('thisMonthToggle');
        const sidebarCalendar = document.getElementById('sidebarCalendar');
        if (thisMonthToggle && sidebarCalendar) {
            thisMonthToggle.addEventListener('click', () => {
                const isHidden = sidebarCalendar.style.display === 'none';
                sidebarCalendar.style.display = isHidden ? 'block' : 'none';
            });
        }

        // Fungsi untuk modal buat room
        function openCreateRoomModal() {
            document.getElementById('createRoomModal').style.display = 'flex';
        }

        function closeCreateRoomModal() {
            document.getElementById('createRoomModal').style.display = 'none';
            // Reset form
            document.getElementById('roomNameInput').value = '';
            document.getElementById('roomPassword').value = '';
            document.getElementById('createdRoomCode').style.display = 'none';
        }

        function createNewRoom() {
            const roomName = document.getElementById('roomNameInput').value.trim();
            const password = document.getElementById('roomPassword').value;

            if (!roomName) {
                showNotification('Nama room tidak boleh kosong!');
                return;
            }

            // Simulasi pembuatan room (dalam aplikasi nyata, ini akan terhubung ke backend)
            const roomCode = generateRoomCode();
            currentRoom = {
                id: roomCode,
                name: roomName,
                password: password,
                users: ['Anda']
            };

            // Tampilkan kode room
            document.getElementById('roomCodeDisplay').textContent = `Kode Room: ${roomCode}`;
            document.getElementById('createdRoomCode').style.display = 'flex';

            // Update UI untuk menunjukkan bergabung dengan room
            updateRoomUI();

            showNotification(`Room "${roomName}" berhasil dibuat!`);

            // Tutup modal setelah beberapa detik
            setTimeout(() => {
                closeCreateRoomModal();
            }, 2000);
        }

        function copyRoomCode() {
            const roomCode = document.getElementById('roomCodeDisplay').textContent.replace('Kode Room: ', '');
            navigator.clipboard.writeText(roomCode)
                .then(() => {
                    showNotification('Kode room disalin ke clipboard!');
                })
                .catch(err => {
                    console.error('Gagal menyalin teks: ', err);
                });
        }

        // Fungsi untuk modal join room
        function openJoinRoomModal() {
            document.getElementById('joinRoomModal').style.display = 'flex';
        }

        function closeJoinRoomModal() {
            document.getElementById('joinRoomModal').style.display = 'none';
            // Reset form
            document.getElementById('joinRoomCode').value = '';
            document.getElementById('joinRoomPassword').value = '';
            document.getElementById('roomUsers').style.display = 'none';
        }

        function joinRoom() {
            const roomCode = document.getElementById('joinRoomCode').value.trim();
            const password = document.getElementById('joinRoomPassword').value;

            if (!roomCode) {
                showNotification('Kode room tidak boleh kosong!');
                return;
            }

            // Simulasi join room (dalam aplikasi nyata, ini akan terhubung ke backend)
            // Untuk demo, kita asumsikan room dengan kode "ABCD-1234" ada
            if (roomCode === 'ABCD-1234') {
                currentRoom = {
                    id: roomCode,
                    name: 'Room Kolaborasi',
                    password: '',
                    users: ['User 1', 'Anda']
                };

                // Update UI untuk menunjukkan bergabung dengan room
                updateRoomUI();

                showNotification('Berhasil bergabung dengan room!');
                closeJoinRoomModal();
            } else {
                showNotification('Room tidak ditemukan. Pastikan kode room benar.');
            }
        }

        function updateRoomUI() {
            if (currentRoom) {
                document.getElementById('roomInfo').style.display = 'flex';
                document.getElementById('roomName').textContent = currentRoom.name;
                document.getElementById('userCount').textContent = `${currentRoom.users.length} Users`;
            } else {
                document.getElementById('roomInfo').style.display = 'none';
            }
        }

        function generateRoomCode() {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 4; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            result += '-';
            for (let i = 0; i < 4; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }

        // Tutup modal jika klik di luar konten modal
        window.onclick = function (event) {
            const modals = ['addTaskModal', 'createRoomModal', 'joinRoomModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (event.target === modal) {
                    if (modalId === 'addTaskModal') closeAddTaskModal();
                    if (modalId === 'createRoomModal') closeCreateRoomModal();
                    if (modalId === 'joinRoomModal') closeJoinRoomModal();
                }
            });
        }
    


function logout() {
    // arahkan ke logout.php agar session terhapus
    window.location.href = "logout.php";
    
}
