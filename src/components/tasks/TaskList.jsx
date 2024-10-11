import React from 'react';

const TaskList = ({ tasks, onSignUp }) => {
  return (
    <div>
      {tasks.length === 0 ? (
        <p>No tasks available for this day</p>
      ) : (
        tasks.map((task, index) => (
          <div key={index} className="task-item">
            <p>{task.name}</p>
            <p>{task.startTime} - {task.endTime}</p>
            <p>Spots available: {task.spots}</p>
            {task.spots > 0 && (
              <button onClick={() => onSignUp(task.name)}>
                Sign Up
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;
