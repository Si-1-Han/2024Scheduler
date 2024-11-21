import { useState } from "react";
import "./Notice.css";

function Notice() {
  const [data, setData] = useState([
    { id: 1, title: "제목1", author: "관리자", date: "2024-11-20", views: 50},
    { id: 2, title: "제목2", author: "관리자", date: "2024-11-19", views: 30},
    { id: 3, title: "제목3", author: "관리자", date: "2024-11-18", views: 25},
  ])
  return (
    <div className="notice-container">
      <h1>공지사항</h1>
      <select>
        <option>제목</option>
        <option>작성자</option>
      </select>
      <input type="text" placeholder="검색어를 입력해주세요" />
      <button>검색</button>
      <p style={{ color: "rgba(0,0,0,0.4)" }}>total @개</p>
      <table>
        <thead>
          <tr
            style={{ border: "solid 1px rgb(0,0,0)", backgroundColor: "#eee" }}
          >
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>{item.author}</td>
              <td>{item.date}</td>
              <td>{item.views}</td>
            </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

export default Notice;
