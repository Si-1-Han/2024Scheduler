import React from "react";
import './Daytop.css';

const Daytop = ({ name }) => {
  let className = "calendar-top";
  if (name === 'SUN') className += " calendar-top-sun";
  if (name === 'SAT') className += " calendar-top-sat";

  return (
    <div className="calendar">
      <div className={className}>{name}</div>
    </div>
  );
};

export default Daytop;
