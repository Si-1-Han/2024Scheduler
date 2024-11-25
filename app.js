const ls = localStorage;

// 날짜 범위 생성 함수 (유틸리티 함수)
function generateDateRange(start, end) {
    const dates = [];
    let currentDate = new Date(start);

    while (currentDate <= new Date(end)) {
        dates.push(new Date(currentDate)); // 날짜 추가
        currentDate.setDate(currentDate.getDate() + 1); // 하루 추가
    }

    return dates;
}

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
                    // 선택한 날짜를 Calendar 객체에 저장
                    Calendar.day = this.innerText;

                    // 선택한 날짜 형식 (YYYY-MM-DD)
                    const selectedDate = `${Calendar.year}-${String(Calendar.month).padStart(2, '0')}-${String(Calendar.day).padStart(2, '0')}`;

                    // 모달 표시
                    document.querySelector(".modal.schedule").classList.add("show");
                    const startDateInput = document.getElementById("start-date");
                    if (startDateInput) {
                        startDateInput.value = selectedDate; // 자동으로 시작 날짜 필드에 설정
                    }
        
                    // 모달 제목 업데이트
                    const $mTitle = document.querySelector(".modal.schedule .modal-title");
                    $mTitle.innerHTML = `${Calendar.year}년 ${Calendar.month}월 ${Calendar.day}일의 일정`;

                    // 선택된 날짜에 포함된 일정 필터링
                    const schedules = ScheduleManager.schedules.filter(schedule => {
                        // 날짜 범위 생성
                        const dateRange = generateDateRange(schedule.startDate, schedule.endDate)
                            .map(date => date.toISOString().split('T')[0]); // "YYYY-MM-DD" 형식

                        // 선택한 날짜가 범위에 포함되는지 확인
                        return dateRange.includes(selectedDate);
                    });

                    // 일정 표시 영역
                    const $mScheduleList = document.querySelector(".modal.schedule .schedule-list");

                    // 일정 표시
                    if (schedules.length) {
                        $mScheduleList.innerHTML = schedules.map(sc =>
                            `<div class="schedule flex aic ${sc.completed ? 'completed' : ''}">
                            <input type="checkbox" class="schedule-checkbox" ${sc.completed ? 'checked' : ''} onchange="ScheduleManager.toggleComplete('${sc.id}')">
                            ${sc.image ? `<img src="${sc.image}" alt="일정 이미지" class="schedule-image" style="max-width: 100px; max-height: 100px; border-radius: 10px;">` : ""}
                            <div class="schedule-details flex jcsb aic">
                                <div>
                                    <h3 class="schedule-title">${sc.title} ${sc.completed ? "(완료)" : ""}</h3>
                                    <p class="schedule-description">${sc.description}</p>
                                    <span class="schedule-time">${sc.startTime} ~ ${sc.endTime}</span>
                                </div>
                                <div class="schedule-actions flex col-flex aic">
                                    <button class="edit-btn" onclick="ScheduleManager.editSchedule('${sc.id}')">수정</button>
                                    <button class="delete-btn" onclick="ScheduleManager.remove('${sc.id}')">삭제</button>
                                </div>
                            </div>
                        </div>`
                        ).join("\n");
                    } else {
                        // 해당 날짜에 일정이 없을 경우
                        $mScheduleList.innerHTML = '<div class="flex aic jcc" style="width: 100%; height: 100%;">일정 없음!</div>';
                    }
                };
            });
    },

    refreshScheduleList() {
        const $mScheduleList = document.querySelector(".modal.schedule .schedule-list");
        const selectedDate = `${Calendar.year}-${String(Calendar.month).padStart(2, '0')}-${String(Calendar.day).padStart(2, '0')}`;
    
        // 선택한 날짜에 해당하는 일정 필터링
        const schedules = ScheduleManager.schedules.filter(schedule => {
            const dateRange = generateDateRange(schedule.startDate, schedule.endDate)
                .map(date => date.toISOString().split('T')[0]); // "YYYY-MM-DD" 형식
            return dateRange.includes(selectedDate);
        });
        
        // 시간 순으로 정렬
        schedules.sort((a, b) => {
            const timeA = a.startTime || "00:00"; // 시작 시간이 없을 경우 기본값 설정
            const timeB = b.startTime || "00:00";
            return timeA.localeCompare(timeB); // 문자열 비교로 시간 정렬
        });
        
    
        if (schedules.length) {
            $mScheduleList.innerHTML = schedules.map(sc =>
                `<div class="schedule flex aic ${sc.completed ? 'completed' : ''}">
                    <input type="checkbox" class="schedule-checkbox" ${sc.completed ? 'checked' : ''} onchange="ScheduleManager.toggleComplete('${sc.id}')">
                    ${sc.image ? `<img src="${sc.image}" alt="일정 이미지" class="schedule-image;" style="max-width: 100px; max-height: 100px; border-radius: 10px;">` : ""}
                    <div class="schedule-details flex jcsb aic">
                        <div>
                            <h3 class="schedule-title">${sc.title} ${sc.completed ? "(완료)" : ""}</h3>
                            <p class="schedule-description">${sc.description}</p>
                            <span class="schedule-time">${sc.startTime} ~ ${sc.endTime}</span>
                        </div>
                        <div class="schedule-actions flex col-flex aic">
                            <button class="edit-btn" onclick="ScheduleManager.editSchedule('${sc.id}')">수정</button>
                            <button class="delete-btn" onclick="ScheduleManager.remove('${sc.id}')">삭제</button>
                        </div>
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
        //캘린더 초기화 호출
        Calendar.init();

        //나머지 초기화 작업 수행
        document.getElementById("end-date").value = "";
        document.getElementById("start-time").value = "";
        document.getElementById("end-time").value = "";
        document.getElementById("schedule-title").value = "";
        document.getElementById("schedule-description").value = "";
        document.getElementById("schedule-image").value = "";

        //모달 표시
        document.querySelector(".modal.add-schedule").classList.add("show");
    },

    addSchedule() {
        const title = document.getElementById("schedule-title").value;
        const description = document.getElementById("schedule-description").value;
        const startTime = document.getElementById("start-time").value || "00:00";
        const endTime = document.getElementById("end-time").value || "00:00";
        const SelectDate = document.getElementById("start-date");
        const startDate = SelectDate.value;
        const endDate = document.getElementById("end-date").value;
        const image = document.getElementById("schedule-image").files[0];

        if (this.currentEditId) {
            // 수정 모드
            const schedule = ScheduleManager.schedules.find(sc => sc.id === this.currentEditId);
            schedule.title = title;
            schedule.description = description;
            schedule.startTime = startTime;
            schedule.endTime = endTime;
            schedule.image = image ? URL.createObjectURL(image) : schedule.image;

            // 수정 후 ID 초기화
            this.currentEditId = null;
        } else {
            // 새 일정 추가 모드
            const newSchedule = {
                id: `${new Date().getTime()}`,
                title,
                description,
                date: `${Calendar.year}-${String(Calendar.month).padStart(2, '0')}-${String(Calendar.day).padStart(2, '0')}`,
                startTime,
                endTime,
                startDate,
                endDate,
                image: image ? URL.createObjectURL(image) : "",
                completed: false
            };
            ScheduleManager.schedules.push(newSchedule);
        }
        // 일정 저장 및 리스트 갱신
        ScheduleManager.saveSchedule();
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
    editSchedule(id) {
        const schedule = ScheduleManager.schedules.find(sc => sc.id === id);
        if (!schedule) return;

        // 수정 모달에 기존 데이터 입력
        document.getElementById("edit-schedule-title").value = schedule.title || "";
        document.getElementById("edit-schedule-description").value = schedule.description || "";
        document.getElementById("edit-start-time").value = schedule.startTime || "";
        document.getElementById("edit-end-time").value = schedule.endTime || "00:00";
        document.getElementById("edit-start-date").value = schedule.startDate || "";
        document.getElementById("edit-end-date").value = schedule.endTime || "";;
        document.getElementById("edit-schedule-image").dataset.image = schedule.image || "";

        // 현재 수정 중인 일정 ID 저장
        ScheduleManager.currentEditId = id;

        // 수정 모달 표시
        document.querySelector(".modal.edit-schedule").classList.add("show");
    },
    saveEditedSchedule() {
        const id = ScheduleManager.currentEditId;
        const schedule = ScheduleManager.schedules.find(sc => sc.id === id);
        if (!schedule) return;

        // 수정된 데이터 가져오기
        const title = document.getElementById("edit-schedule-title").value || "";
        const description = document.getElementById("edit-schedule-description").value || "";
        const startTime = document.getElementById("edit-start-time").value || "";
        const endTime = document.getElementById("edit-end-time").value;
        const startDate = document.getElementById("edit-start-date").value || "";
        const endDate = document.getElementById("edit-end-date").value || "";
        const imageFile = document.getElementById("edit-schedule-image").files[0];

        // 기존 일정 업데이트
        schedule.title = title;
        schedule.description = description;
        schedule.startTime = startTime;
        schedule.endTime = endTime;

        if (imageFile) {
            schedule.image = URL.createObjectURL(imageFile);
        }

        // 수정된 일정 저장
        ScheduleManager.saveSchedule(); // localStorage에 저장
        Calendar.refreshScheduleList(); // 화면 갱신

        // 수정 모달 닫기
        document.querySelector(".modal.edit-schedule").classList.remove("show");
        ScheduleManager.currentEditId = null; // 수정 중인 일정 ID 초기화
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
