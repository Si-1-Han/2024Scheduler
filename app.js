const ls = localStorage;


// userIDs 필터링함수
function getUserSchedules() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
      console.error("로그인된 사용자 정보가 없습니다.");
      return [];
  }

  return ScheduleManager.schedules.filter((schedule) => {
      const userIDs = schedule.userIDs || []; // 기본값 처리
      return userIDs.includes(loggedInUser.username);
  });
}

// 일정 요소를 기반으로 해시 생성
function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash);
}

// 해시를 기반으로 고유 색상 생성
function getColorForSchedule(schedule) {
  const { title, description, startDate, startTime } = schedule;
  const key = `${title}-${description}-${startDate}-${startTime}`;
  const hash = generateHash(key);

  // 해시를 16진수 색상 코드로 변환
  const color = `#${(hash & 0xffffff).toString(16).padStart(6, "0")}`;
  return color;
}

// 썸네일에 색상 적용
function applyColorsToThumbnails() {
  const thumbnails = document.querySelectorAll(".schedule-thumbnail");
  thumbnails.forEach((thumbnail) => {
    const scheduleTitle = thumbnail.textContent.trim();

    // 일정 데이터를 찾아 색상 적용
    const schedule = ScheduleManager.schedules.find(
      (s) => s.title === scheduleTitle
    );
    if (schedule) {
      thumbnail.style.backgroundColor = getColorForSchedule(schedule);
    }
  });
}

// DOMContentLoaded에서 호출
document.addEventListener("DOMContentLoaded", () => {
  applyColorsToThumbnails();
});

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

// 랜덤 색상 생성 함수
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 색상 바에 랜덤 색상 적용
function applyRandomColors() {
  const colorBars = document.querySelectorAll(".color-bar");
  colorBars.forEach((bar) => {
    bar.style.backgroundColor = getRandomColor();
  });
}

// 페이지 로드 후 실행
document.addEventListener("DOMContentLoaded", () => {
  applyRandomColors();
});

//수정 모달이 꺼지면 완전히 초기화 하는 코드
function closeEditScheduleModal() {
  // 수정 모달 닫기
  document.querySelector(".modal.edit-schedule").classList.remove("show");
  // 수정 상태 초기화
  ScheduleManager.currentEditId = null;
  // 입력 필드 초기화
  document.getElementById("edit-schedule-title").value = "";
  document.getElementById("edit-schedule-description").value = "";
  document.getElementById("edit-end-date").value = "";
  document.getElementById("edit-start-time").value = "";
  document.getElementById("edit-end-time").value = "";
  document.getElementById("edit-schedule-image").value = "";
}

const Calendar = {
  init() {
    const today = new Date();
    Calendar.year = today.getFullYear();
    Calendar.month = today.getMonth() + 1;
    Calendar.day = today.getDate();
    Calendar.showDates(Calendar.year, Calendar.month);
    Calendar.$date.innerHTML = `${Calendar.year}. ${Calendar.month}`;

    ScheduleManager.loadSchedule();
    Calendar.refreshScheduleList();

    Calendar.evtHandle();
  },
  addMonth(m) {
    const date = new Date(Calendar.year, Calendar.month + m - 1, 1);
    Calendar.year = date.getFullYear();
    Calendar.month = date.getMonth() + 1;

    Calendar.showDates(Calendar.year, Calendar.month);
    Calendar.$date.innerHTML = `${Calendar.year}. ${Calendar.month}`;
  },

  showDates(y, m) {
    const before = document.querySelectorAll(".date");
    before.forEach((v) => v.remove());

    const firstDayOfMonth = Calendar.getFirstDay(y, m);
    const lastDayOfMonth = Calendar.getLastDay(y, m);
    const userSchedules = getUserSchedules(); // 사용자와 관련된 일정만 가져옴

    for (let i = 0; i < firstDayOfMonth + lastDayOfMonth; i++) {
        const dateNum = i - firstDayOfMonth + 1;
        const dateString = `${y}-${String(m).padStart(2, "0")}-${String(
            dateNum
        ).padStart(2, "0")}`;

        const schedulesForDate = userSchedules.filter((schedule) => {
            const dateRange = generateDateRange(schedule.startDate, schedule.endDate)
                .map((date) => date.toISOString().split("T")[0]);
            return dateRange.includes(dateString);
        });

        Calendar.$Calendar.innerHTML += `
            <div class="date ${dateNum < 1 ? "hidden-date" : ""}">
                <p>${dateNum > 0 ? dateNum : ""}</p>
                <div class="color-bar"></div>
                <div class="schedule-thumbnails" id="schedule-thumbnails-${dateString}">
                    ${schedulesForDate
                        .map(
                            (schedule) =>
                                `<div class="schedule-thumbnail">${schedule.title}</div>`
                        )
                        .join("")}
                </div>
            </div>`;
    }
    applyColorsToThumbnails();
  },

  evtHandle() {
    const calendar = document.querySelector(".calendar");
    calendar.addEventListener("click", (event) => {
      const target = event.target.closest(".date");
      if (target && !target.classList.contains("hidden-date")) {
        Calendar.day = target.querySelector("p").textContent;

        const selectedDate = `${Calendar.year}-${String(
          Calendar.month
        ).padStart(2, "0")}-${String(Calendar.day).padStart(2, "0")}`;

        document.querySelector(".modal.schedule").classList.add("show");
        const startDateInput = document.getElementById("start-date");
        if (startDateInput) {
          startDateInput.value = selectedDate;
        }

        const $mTitle = document.querySelector(".modal.schedule .modal-title");
        $mTitle.innerHTML = `${Calendar.year}년 ${Calendar.month}월 ${Calendar.day}일의 일정`;

        const schedules = ScheduleManager.schedules.filter((schedule) => {
          const dateRange = generateDateRange(
            schedule.startDate,
            schedule.endDate
          ).map((date) => date.toISOString().split("T")[0]);
          return dateRange.includes(selectedDate);
        });

        const $mScheduleList = document.querySelector(
          ".modal.schedule .schedule-list"
        );

        if (schedules.length) {
          $mScheduleList.innerHTML = schedules
            .map(
              (sc) =>
                `<div class="schedule flex aic ${
                  sc.completed ? "completed" : ""
                }">
                    <input type="checkbox" class="schedule-checkbox" ${
                      sc.completed ? "checked" : ""
                    } onchange="ScheduleManager.toggleComplete('${sc.id}')">
                    ${
                      sc.image
                        ? `<img src="${sc.image}" alt="일정 이미지" class="schedule-image" style="max-width: 100px; max-height: 100px; border-radius: 10px;">`
                        : ""
                    }
                    <div class="schedule-details flex jcsb aic">
                        <div>
                            <h3 class="schedule-title">${sc.title} ${
                  sc.completed ? "(완료)" : ""
                }</h3>
                            <p class="schedule-description">${sc.description}</p>
                            <span class="schedule-time">${sc.startTime} ~ ${
                  sc.endTime
                }</span>
                        </div>
                        <div class="schedule-actions flex col-flex aic">
                            <button class="edit-btn" onclick="ScheduleManager.editSchedule('${sc.id}')">수정</button>
                            <button class="delete-btn" onclick="ScheduleManager.remove('${sc.id}')">삭제</button>
                        </div>
                    </div>
                </div>`
            )
            .join("");
        } else {
          $mScheduleList.innerHTML =
            '<div class="flex aic jcc" style="width: 100%; height: 100%;">일정 없음!</div>';
        }
      }
    });
  },

  refreshScheduleList() {
    const $mScheduleList = document.querySelector(".modal.schedule .schedule-list");
    const filteredScheduleList = getUserSchedules();
    if ($mScheduleList){
      $mScheduleList.innerHTML = filteredScheduleList
      .map((schedule) => `
                <div class="schedule-item">
                    <p>${schedule.title}</p>
                    <p>${schedule.description}</p>
                </div>
            `)
            .join
    }
    const selectedDate = `${Calendar.year}-${String(Calendar.month).padStart(
      2,"0")}-${String(Calendar.day).padStart(2, "0")}`;

    const schedules = ScheduleManager.schedules.filter((schedule) => {
      const dateRange = generateDateRange(
        schedule.startDate,
        schedule.endDate
      ).map((date) => date.toISOString().split("T")[0]);
      return dateRange.includes(selectedDate);
    });

    schedules.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed - b.completed;
      }
      const timeA = a.startTime || "00:00";
      const timeB = b.startTime || "00:00";
      return timeA.localeCompare(timeB);
    });

    if (schedules.length) {
      $mScheduleList.innerHTML = schedules
        .map(
          (sc) =>
            `<div class="schedule flex aic ${sc.completed ? "completed" : ""}">
                    <input type="checkbox" class="schedule-checkbox" ${
                      sc.completed ? "checked" : ""
                    } onchange="ScheduleManager.toggleComplete('${sc.id}')">
                    ${
                      sc.image
                        ? `<img src="${sc.image}" alt="일정 이미지" class="schedule-image;" style="max-width: 100px; max-height: 100px; border-radius: 10px;">`
                        : ""
                    }
                    <div class="schedule-details flex jcsb aic">
                        <div>
                            <h3 class="schedule-title">${sc.title} ${
              sc.completed ? "(완료)" : ""
            }</h3>
                            <p class="schedule-description">${sc.description}</p>
                            <span class="schedule-time">${sc.startTime} ~ ${
              sc.endTime
            }</span>
                        </div>
                        <div class="schedule-actions flex col-flex aic">
                            <button class="edit-btn" onclick="ScheduleManager.editSchedule('${sc.id}')">수정</button>
                            <button class="delete-btn" onclick="ScheduleManager.remove('${sc.id}')">삭제</button>
                        </div>
                    </div>
                </div>`
        )
        .join("\n\n");
    } else {
      $mScheduleList.innerHTML =
        '<div class="flex aic jcc" style="width: 100%; height: 100%;">일정 없음!</div>';
    }
    document
      .querySelectorAll(".schedule-thumbnails")
      .forEach((el) => (el.innerHTML = ""));

    ScheduleManager.schedules.forEach((schedule) => {
      const dateRange = generateDateRange(schedule.startDate, schedule.endDate);
      dateRange.forEach((date) => {
        const dateId = `schedule-thumbnails-${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const $thumbnailContainer = document.getElementById(dateId);

        if ($thumbnailContainer) {
          const thumbnail = document.createElement("div");
          thumbnail.textContent = schedule.title;
          thumbnail.className = "schedule-thumbnail";
          $thumbnailContainer.appendChild(thumbnail);
        }
      });
    });
  },

  getFirstDay(y, m) {
    const date = new Date(y, m - 1, 1);
    return date.getDay();
  },

  getLastDay(y, m) {
    const date = new Date(y, m, 0);
    return date.getDate();
  },
};

const ScheduleManager = {
  schedules: [],

  loadSchedule() {
    if (!ls["schedules"]) return;
    ScheduleManager.schedules = JSON.parse(ls["schedules"]);

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
      ScheduleManager.schedules = ScheduleManager.schedules.map((schedule) => ({
        ...schedule,
        userIDs: schedule.userIDs || [loggedInUser.username],
      }));
    }
  },

  saveSchedule() {
    ls["schedules"] = JSON.stringify(ScheduleManager.schedules);
  },

  showAddScheduleModal() {
    Calendar.init();

    this.editingScheduleId = null;

    document.getElementById("schedule-title").value = "";
    document.getElementById("schedule-description").value = "";
    document.getElementById("end-date").value = "";
    document.getElementById("end-time").value = "";
    document.getElementById("schedule-title").value = "";
    document.getElementById("schedule-description").value = "";
    document.getElementById("schedule-image").value = "";

    document.querySelector(".modal.add-schedule").classList.add("show");
    const startDateInput = document.getElementById("start-date");
    if (!startDateInput.value) {
      startDateInput.value = `${Calendar.year}-${String(
        Calendar.month
      ).padStart(2, "0")}-${String(Calendar.day).padStart(2, "0")}`;
    }
  },

  addSchedule() {
    const title = document.getElementById("schedule-title").value;
    const description = document.getElementById("schedule-description").value;
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value || startDate;
    const startTime = document.getElementById("start-time").value || "00:00";
    const endTime = document.getElementById("end-time").value || "00:00";
    const image = document.getElementById("schedule-image").files[0];

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const newSchedule = {
      id: `${Date.now()}`,
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      image: image ? URL.createObjectURL(image) : "",
      color: getRandomColor(),
      completed: false,
      userIDs: [loggedInUser.username],
    };

    ScheduleManager.schedules.push(newSchedule);
    ScheduleManager.saveSchedule();
    Calendar.showDates(Calendar.year, Calendar.month);
    Calendar.refreshScheduleList();
    document.querySelector(".modal.add-schedule").classList.remove("show");
  },

  toggleComplete(id) {
    const schedule = ScheduleManager.schedules.find((sc) => sc.id === id);
    schedule.completed = !schedule.completed;
    ScheduleManager.saveSchedule();
    Calendar.refreshScheduleList();
  },

  remove(id) {
    ScheduleManager.schedules = ScheduleManager.schedules.filter(
      (sc) => sc.id !== id
    );
    ScheduleManager.saveSchedule();
    Calendar.refreshScheduleList();
  },
};
