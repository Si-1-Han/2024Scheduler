const ls = localStorage;

const Calendar = {
    init() {
        const today = new Date();
        Calendar.year = today.getFullYear();
        Calendar.month = today.getMonth() + 1;
        Calendar.showDates(Calendar.year, Calendar.month);

        ScheduleManager.loadSchedule();
        Calendar.refreshScheduleList();

        Calendar.evtHandle();
    },

    evtHandle() {
        document.querySelectorAll(".date")
        .forEach(elem => {
            elem.onclick = function () {
                Calendar.day = this.innerText;

                document.querySelector(".modal.schedule")
                    .classList.add("show");

                const $mTitle = document.querySelector(".modal.schedule .modal-title");
                $mTitle.innerHTML = `${Calendar.year}년 ${Calendar.month}월 ${Calendar.day}일의 일정`;

                Calendar.refreshScheduleList();
            }
        });
    },

    refreshScheduleList() {
        const $mScheduleList = document.querySelector(".modal.schedule .schedule-list");
        const schedules = ScheduleManager.schedules
            .filter(v => v.date === `${Calendar.year}-${String(Calendar.month).padStart(2, '0')}-${String(Calendar.day).padStart(2, '0')}`);

        schedules.sort((a, b) => a.completed - b.completed); // 완료 일정은 하단 정렬

        if (schedules.length) {
            $mScheduleList.innerHTML = schedules.map(sc => 
                `<div class="schedule flex aic ${sc.completed ? 'completed' : ''}">
                    <input type="checkbox" class="schedule-checkbox" ${sc.completed ? 'checked' : ''} onchange="ScheduleManager.toggleComplete('${sc.id}')">
                    ${sc.image ? `<img src="${sc.image}" alt="일정 이미지" class="schedule-image;" style="max-width: 100px; max-height: 100px; border-radius: 10px;">` : ""}
                    <div class="schedule-details flex aic jcsb">
                        <h3 class="schedule-title">${sc.title} ${sc.completed ? "(완료)" : ""}</h3>
                        <span class="schedule-time">${sc.startTime} ~ ${sc.endTime}</span>
                        <button class="delete-btn" onclick="ScheduleManager.remove('${sc.id}')">삭제</button>
                    </div>
                </div>`
            ).join("\n\n");
        } else {
            $mScheduleList.innerHTML = '<div class="flex aic jcc" style="width: 100%; height: 100%;">일정 없음!</div>';
        }
    },

    showDates(y, m) {
        const before = document.querySelectorAll(".date");
        before.forEach(v => v.remove());

        const firstDayOfMonth = Calendar.getFirstDay(y, m);
        const lastDayOfMonth = Calendar.getLastDay(y, m);

        for (let i = 0; i < firstDayOfMonth + lastDayOfMonth; i++) {
            const dateNum = i - firstDayOfMonth + 1;

            Calendar.$Calendar.innerHTML += 
                `<div class="date ${dateNum < 1 ? "hidden-date" : ""}">
                    <p>${dateNum > 0 ? dateNum : ""}</p>
                </div>`;
        }
    },

    getFirstDay(y, m) {
        const date = new Date(y, m - 1, 1);
        return date.getDay();
    },

    getLastDay(y, m) {
        const date = new Date(y, m, 0);
        return date.getDate();
    },

    addMonth(m) {
        const date = new Date(
            Calendar.year, Calendar.month + m - 1, 1
        );
        Calendar.year = date.getFullYear();
        Calendar.month = date.getMonth() + 1;

        Calendar.showDates(Calendar.year, Calendar.month);
        Calendar.$date.innerHTML = `${Calendar.year}. ${Calendar.month}`;
    }
};

const ScheduleManager = {
    schedules: [],

    loadSchedule() {
        if (!ls['schedules']) return;
        ScheduleManager.schedules = JSON.parse(ls['schedules']);
    },

    saveSchedule() {
        ls['schedules'] = JSON.stringify(ScheduleManager.schedules);
    },

    showAddScheduleModal() {
        document.querySelector(".modal.add-schedule").classList.add("show");
    },

    addSchedule() {
        const title = document.getElementById("schedule-title").value;
        const description = document.getElementById("schedule-description").value;
        const startTime = document.getElementById("start-time").value || "00:00";
        const endTime = document.getElementById("end-time").value || "00:00";
        const image = document.getElementById("schedule-image").files[0];
    
        // 일정 객체 생성
        const newSchedule = {
            id: `${new Date().getTime()}`,
            title,
            description,
            date: `${Calendar.year}-${String(Calendar.month).padStart(2, '0')}-${String(Calendar.day).padStart(2, '0')}`,
            startTime,
            endTime,
            image: image ? URL.createObjectURL(image) : "",
            completed: false
        };
    
        // 일정 배열에 추가
        ScheduleManager.schedules.push(newSchedule);
        ScheduleManager.saveSchedule();
    
        // 일정 리스트 갱신
        Calendar.refreshScheduleList();
    
        // 일정 추가 모달 닫기
        document.querySelector(".modal.add-schedule").classList.remove("show");
    
        // 입력 필드 초기화
        document.getElementById("schedule-title").value = "";
        document.getElementById("schedule-description").value = "";
        document.getElementById("start-time").value = "";
        document.getElementById("end-time").value = "";
        document.getElementById("schedule-image").value = "";
    },
    
    toggleComplete(id) {
        const schedule = ScheduleManager.schedules.find(sc => sc.id === id);
        schedule.completed = !schedule.completed;
        ScheduleManager.saveSchedule();
        Calendar.refreshScheduleList();
    },

    remove(id) {
        ScheduleManager.schedules = ScheduleManager.schedules.filter(sc => sc.id !== id);
        ScheduleManager.saveSchedule();
        Calendar.refreshScheduleList();
    }
};
