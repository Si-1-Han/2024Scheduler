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

        if (schedules.length) {
            $mScheduleList.innerHTML = schedules.map(sc => `
                <div class="schedule flex aic jcsb">
                    <h3>${sc.title}</h3>
                    <button onclick="ScheduleManager.remove('${sc.id}')">삭제</button>
                </div>
            `).join("\n\n");
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

            Calendar.$Calendar.innerHTML += `
                <div class="date ${dateNum < 1 ? "hidden-date" : ""}">
                    <p>${dateNum > 0 ? dateNum : ""}</p>
                </div>
            `;
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

        ScheduleManager.schedules =
            JSON.parse(ls['schedules']);
    },

    saveSchedule() {
        ls['schedules'] =
            JSON.stringify(ScheduleManager.schedules);
    },

    addSchedule() {
        const title = prompt("일정의 제목은?");
        
        if (!title.match(/^[a-zA-Z0-9ㄱ-힣]*$/g)) {
            return alert("잘못된 제목입니다.");
        }

        const id = new Date().getTime();
        this.schedules.push({
            id,
            date: `${Calendar.year}-${String(Calendar.month).padStart(2, '0')}-${String(Calendar.day).padStart(2, '0')}`,
            title
        });

        this.saveSchedule();
        Calendar.refreshScheduleList();
    },

    remove(id) {
        const index = ScheduleManager.schedules
            .findIndex(v => v.id == id);

        ScheduleManager.schedules
            .splice(index, 1);

        this.saveSchedule();
        Calendar.refreshScheduleList();
    }
};
