const ls = localStorage;
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
  const color = `#${((hash & 0xFFFFFF).toString(16)).padStart(6, "0")}`;
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
    Calendar.showDates(Calendar.year, Calendar.month);

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

    for (let i = 0; i < firstDayOfMonth + lastDayOfMonth; i++) {
      const dateNum = i - firstDayOfMonth + 1;
      const dateString = `${y}-${String(m).padStart(2, "0")}-${String(
        dateNum
      ).padStart(2, "0")}`;

      // 필터링: 해당 날짜에 해당하는 일정들
      const schedulesForDate = ScheduleManager.schedules.filter((schedule) => {
        const dateRange = generateDateRange(
          schedule.startDate,
          schedule.endDate
        ).map((date) => date.toISOString().split("T")[0]);
        console.log("dateRange:", dateRange, "dateString:", dateString); // 각 일정의 범위와 현재 날짜
        return dateRange.includes(dateString);
      });
      console.log("Schedules for Date:", dateString, schedulesForDate); // 해당 날짜의 일정

      // 날짜 칸 HTML 생성
      Calendar.$Calendar.innerHTML += `
                <div class="date ${dateNum < 1 ? "hidden-date" : ""}">
                    <p>${dateNum > 0 ? dateNum : ""}</p>
                    <div class="color-bar"></div> <!-- 얇은 색상 바 -->
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
        // 선택한 날짜를 Calendar 객체에 저장
        Calendar.day = target.querySelector("p").textContent;

        // 선택한 날짜 형식 (YYYY-MM-DD)
        const selectedDate = `${Calendar.year}-${String(
          Calendar.month
        ).padStart(2, "0")}-${String(Calendar.day).padStart(2, "0")}`;

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
        const schedules = ScheduleManager.schedules.filter((schedule) => {
          const dateRange = generateDateRange(
            schedule.startDate,
            schedule.endDate
          ).map((date) => date.toISOString().split("T")[0]);
          return dateRange.includes(selectedDate);
        });

        // 일정 표시 영역
        const $mScheduleList = document.querySelector(
          ".modal.schedule .schedule-list"
        );

        // 일정 표시
        if (schedules.length) {
          $mScheduleList.innerHTML = schedules
            .map(
              (sc) =>
                `<div class="schedule flex aic ${
                  sc.completed ? "completed" : ""
                }">
                            <input type="checkbox" class="schedule-checkbox" ${
                              sc.completed ? "checked" : ""
                            } onchange="ScheduleManager.toggleComplete('${
                  sc.id
                }')">
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
                                    <p class="schedule-description">${
                                      sc.description
                                    }</p>
                                    <span class="schedule-time">${
                                      sc.startTime
                                    } ~ ${sc.endTime}</span>
                                </div>
                                <div class="schedule-actions flex col-flex aic">
                                    <button class="edit-btn" onclick="ScheduleManager.editSchedule('${
                                      sc.id
                                    }')">수정</button>
                                    <button class="delete-btn" onclick="ScheduleManager.remove('${
                                      sc.id
                                    }')">삭제</button>
                                </div>
                            </div>
                        </div>`
            )
            .join("\n");
        } else {
          $mScheduleList.innerHTML =
            '<div class="flex aic jcc" style="width: 100%; height: 100%;">일정 없음!</div>';
        }
      }
    });
  },

  refreshScheduleList() {
    const $mScheduleList = document.querySelector(
      ".modal.schedule .schedule-list"
    );
    const selectedDate = `${Calendar.year}-${String(Calendar.month).padStart(
      2,
      "0"
    )}-${String(Calendar.day).padStart(2, "0")}`;

    // 선택한 날짜에 해당하는 일정 필터링
    const schedules = ScheduleManager.schedules.filter((schedule) => {
      const dateRange = generateDateRange(
        schedule.startDate,
        schedule.endDate
      ).map((date) => date.toISOString().split("T")[0]); // "YYYY-MM-DD" 형식
      return dateRange.includes(selectedDate);
    });

    // 완료된 일정 아래로 내리기
    schedules.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed - b.completed;
      }
      // 시간 순으로 정렬
      const timeA = a.startTime || "00:00"; // 시작 시간이 없을 경우 기본값 설정
      const timeB = b.startTime || "00:00";
      return timeA.localeCompare(timeB); // 문자열 비교로 시간 정렬
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
                            <p class="schedule-description">${
                              sc.description
                            }</p>
                            <span class="schedule-time">${sc.startTime} ~ ${
              sc.endTime
            }</span>
                        </div>
                        <div class="schedule-actions flex col-flex aic">
                            <button class="edit-btn" onclick="ScheduleManager.editSchedule('${
                              sc.id
                            }')">수정</button>
                            <button class="delete-btn" onclick="ScheduleManager.remove('${
                              sc.id
                            }')">삭제</button>
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

    // 저장된 일정 데이터를 날짜별로 렌더링
    ScheduleManager.schedules.forEach((schedule) => {
      const dateRange = generateDateRange(schedule.startDate, schedule.endDate);
      dateRange.forEach((date) => {
        const dateId = `schedule-thumbnails-${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const $thumbnailContainer = document.getElementById(dateId);

        if ($thumbnailContainer) {
          const thumbnail = document.createElement("div");
          thumbnail.textContent = schedule.title; // 제목 표시
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
  },

  saveSchedule() {
    ls["schedules"] = JSON.stringify(ScheduleManager.schedules);
  },

  showAddScheduleModal() {
    //캘린더 초기화 호출
    Calendar.init();

    this.editingScheduleId = null;

    //나머지 초기화 작업 수행
    document.getElementById("schedule-title").value = "";
    document.getElementById("schedule-description").value = "";
    document.getElementById("end-date").value = "";
    document.getElementById("end-time").value = "";
    document.getElementById("schedule-title").value = "";
    document.getElementById("schedule-description").value = "";
    document.getElementById("schedule-image").value = "";

    //모달 표시
    document.querySelector(".modal.add-schedule").classList.add("show");
    //수정모달 초기화 시에 selectDate까지 초기화되는 것 방지
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
    const startDate = document.getElementById("start-date").value; // 모달에서 입력된 날짜
    const endDate = document.getElementById("end-date").value || startDate;
    const startTime = document.getElementById("start-time").value || "00:00";
    const endTime = document.getElementById("end-time").value || "00:00";
    const image = document.getElementById("schedule-image").files[0];

    const newSchedule = {
      id: `${Date.now()}`,
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      image: image ? URL.createObjectURL(image) : "",
      colo: getRandomColor(),
      completed: false,
    };

    // 일정 추가
    ScheduleManager.schedules.push(newSchedule);
    ScheduleManager.saveSchedule();
    //현재상태로 유지
    const [year, month, day] = startDate.split("-");
    Calendar.year = parseInt(year, 10); // 상태를 추가된 일정의 연도로 설정
    Calendar.month = parseInt(month, 10);
    Calendar.day = parseInt(day, 10);

    const dateId = `schedule-thumbnails-${startDate}`;
    const thumbnailContainer = document.getElementById(dateId);
    if (thumbnailContainer) {
      const schedulesForDate = ScheduleManager.schedules.filter((schedule) => {
        const dateRange = generateDateRange(
          schedule.startDate,
          schedule.endDate
        ).map((date) => date.toISOString().split("T")[0]);
        return dateRange.includes(startDate);
      });

      // 썸네일 업데이트
      thumbnailContainer.innerHTML = schedulesForDate
        .map(
          (schedule) =>
            `<div class="schedule-thumbnail">${schedule.title}</div>`
        )
        .join("");

      console.log(
        `Updated Thumbnails for ${startDate}:`,
        thumbnailContainer.innerHTML
      );
    }

    // 캘린더 및 일정 갱신
    Calendar.showDates(Calendar.year, Calendar.month); // 현재 월로 캘린더 렌더링
    Calendar.refreshScheduleList(); // 일정 리스트 갱신

    // 모달 닫기
    document.querySelector(".modal.add-schedule").classList.remove("show");
    //랜덤색깔 적용
    applyColorsToThumbnails();
    // 입력 필드 초기화
    document.getElementById("schedule-title").value = "";
    document.getElementById("schedule-description").value = "";
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    document.getElementById("start-time").value = "";
    document.getElementById("end-time").value = "";
    document.getElementById("schedule-image").value = "";
  },

  editSchedule(id) {
    const schedule = ScheduleManager.schedules.find((sc) => sc.id === id);
    if (!schedule) return;

    // 수정 모달에 기존 데이터 입력
    document.getElementById("edit-schedule-title").value = schedule.title || "";
    document.getElementById("edit-schedule-description").value =
      schedule.description || "";
    document.getElementById("edit-start-time").value = schedule.startTime || "";
    document.getElementById("edit-end-time").value =
      schedule.endTime || "00:00";
    document.getElementById("edit-start-date").value = schedule.startDate || "";
    document.getElementById("edit-end-date").value = schedule.endTime || "";
    document.getElementById("edit-schedule-image").dataset.image =
      schedule.image || "";

    // 현재 수정 중인 일정 ID 저장
    ScheduleManager.currentEditId = id;

    // 수정 모달 표시
    document.querySelector(".modal.edit-schedule").classList.add("show");

    document.getElementById("schedule-title").value = "";
    document.getElementById("schedule-description").value = "";
    document.getElementById("start-date").value = "";
    document.getElementById("start-time").value = "";
    document.getElementById("end-date").value = "";
    document.getElementById("end-time").value = "";
    document.getElementById("schedule-image").value = "";
  },
  saveEditedSchedule() {
    const id = ScheduleManager.currentEditId;
    const schedule = ScheduleManager.schedules.find((sc) => sc.id === id);
    if (!schedule) return;

    // 수정된 데이터 가져오기
    const title = document.getElementById("edit-schedule-title").value || "";
    const description =
      document.getElementById("edit-schedule-description").value || "";
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
    //랜덤색깔 적용
    applyColorsToThumbnails();
    // 수정 모달 닫기
    document.querySelector(".modal.edit-schedule").classList.remove("show");
    ScheduleManager.currentEditId = null; // 수정 중인 일정 ID 초기화
    document.getElementById("schedule-title").value = "";
    document.getElementById("schedule-description").value = "";
    document.getElementById("start-date").value = "";
    document.getElementById("start-time").value = "";
    document.getElementById("end-date").value = "";
    document.getElementById("end-time").value = "";
    document.getElementById("schedule-image").value = "";
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
    //랜덤색깔 적용
    applyColorsToThumbnails();
  },
};
