import React, { useState } from 'react';
import './habit-schedule-form.scss';
import Button from '../button/button.component';
import { gql, useMutation, useQuery } from '@apollo/client';

const habitDefinitionsQuery = gql`
  query {
    habitDefinitions {
      _id
      name
      createdAt
      updatedAt
    }
  }
`;

const createHabitQuery = gql`
  mutation ($createHabitInstanceInput: CreateHabitInstanceInput!) {
    createHabitInstance(createHabitInstanceInput: $createHabitInstanceInput) {
      message
    }
  }
`;

function HabitScheduleForm(props) {
  const { handleSubmit, refetchData, setIsAddHabitModalOpen } = props.options;
  const {
    loading,
    error,
    data: habitDefinitionsResponse,
  } = useQuery(habitDefinitionsQuery);
  let habitDefinitions = null;
  if (!loading) {
    habitDefinitions = habitDefinitionsResponse.habitDefinitions;
  }
  const [createHabit] = useMutation(createHabitQuery);
  const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const nthOptions = ['First', 'Second', 'Third', 'Fourth', 'Last'];
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const [formData, setFormData] = useState({
    habitDefinitionId: '',
    count: 1,
    repeat: {
      every: 1,
      interval: 'day',
    },
    monthRecurrence: {
      type: 'dayOfMonth',
      dayOfMonth: 'Day_1',
      nthWeek: nthOptions[0],
      dayOfWeekForNth: days[0],
    },
  });

  function handleHabitDefinitionChange(e) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      habitDefinitionId: e.target.value,
    }));
  }

  function handleCountChange(e) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      count: Number(e.target.value),
    }));
  }

  function handleRepeatChange(e) {
    const { name, value } = e.target;

    setFormData((prevFormData) => {
      const updatedRepeat = {
        ...prevFormData.repeat,
        [name]: name === 'every' ? Number(value) || 1 : value,
      };

      return {
        ...prevFormData,
        repeat: updatedRepeat,
      };
    });
  }

  function handleDayOfWeekToggle(day) {
    setFormData((prevFormData) => {
      if (!prevFormData.repeat?.on) {
        prevFormData.repeat.on = [];
      }
      const updatedDays = prevFormData.repeat?.on?.includes(day)
        ? prevFormData.repeat?.on?.filter((d) => d !== day)
        : [...prevFormData.repeat.on, day];

      return {
        ...prevFormData,
        repeat: {
          ...prevFormData.repeat,
          on: updatedDays,
        },
      };
    });
  }

  function handleMonthRecurrenceTypeChange(e) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      monthRecurrence: {
        ...prevFormData.monthRecurrence,
        type: e.target.value,
      },
    }));
  }

  function handleMonthSpecificChange(e) {
    const { name, value } = e.target;

    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        monthRecurrence: {
          ...prevFormData.monthRecurrence,
          [name]: value,
        },
      };
    });
  }

  function handleTimeChange(e) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      repeat: {
        ...prevFormData.repeat,
        at: e.target.value,
      },
    }));
  }

  return (
    <form
      className="habit-schedule-form"
      onSubmit={(e) => {
        e.preventDefault();

        let createHabitInstanceInput = {
          habitDefinitionId: formData.habitDefinitionId,
          goal: {
            count: formData.count,
            repeat: {
              every: formData.repeat.every,
              interval: formData.repeat.interval,
              at: formData.repeat.at,
            },
          },
        };

        if (formData.repeat.interval === 'week') {
          createHabitInstanceInput.goal.repeat.on = formData.repeat.on;
        } else if (formData.repeat.interval === 'month') {
          if (formData.monthRecurrence.type === 'dayOfMonth') {
            createHabitInstanceInput.goal.repeat.on = [
              formData.monthRecurrence.dayOfMonth,
            ];
          } else if (formData.monthRecurrence.type === 'nthDayOfWeek') {
            createHabitInstanceInput.goal.repeat.on = [
              `${formData.monthRecurrence.nthWeek}_${formData.monthRecurrence.dayOfWeekForNth}`,
            ];
          }
        }

        handleSubmit({
          callAPI: createHabit,
          payload: {
            variables: {
              createHabitInstanceInput,
            },
          },
          refetchData,
          setOpenModal: setIsAddHabitModalOpen,
        });
      }}
    >
      <select
        className="habit-select"
        name="habitDefinitionId"
        value={formData.habitDefinitionId}
        onChange={handleHabitDefinitionChange}
        disabled={loading || error || habitDefinitions?.length === 0}
        required={true}
      >
        <option value="">Select a habit</option>

        {!loading &&
          !error &&
          habitDefinitions?.length > 0 &&
          habitDefinitions.map((definition) => (
            <option key={definition._id} value={definition._id}>
              {definition.name}
            </option>
          ))}
        {loading && <option value="">Loading...</option>}
        {error && <option value="">Error loading data</option>}
        {!loading && !error && habitDefinitions?.length === 0 && (
          <option value="">No items found</option>
        )}
      </select>

      <div className="count-group">
        <label>Goal count</label>
        <input
          type="number"
          name="count"
          value={formData.count}
          placeholder=""
          onChange={handleCountChange}
          min="1"
        />
      </div>

      <label className="form-label">Every</label>
      <div className="repeat-input-group">
        <input
          type="number"
          name="every"
          value={formData.repeat.every}
          onChange={handleRepeatChange}
          min="1"
        />
        <select
          name="interval"
          value={formData.repeat.interval}
          onChange={handleRepeatChange}
        >
          <option value="day">day</option>
          <option value="week">week</option>
          <option value="month">month</option>
        </select>
      </div>

      {formData.repeat.interval === 'week' && (
        <div className="weekday-buttons">
          {days.map((day, index) => (
            <button
              key={index}
              className={`weekday-button ${
                formData.repeat?.on?.includes(day) ? 'active' : ''
              }`}
              type="button"
              onClick={() => handleDayOfWeekToggle(day)}
            >
              {day[0]}
            </button>
          ))}
        </div>
      )}

      {formData.repeat.interval === 'month' && (
        <div className=" month-options-group">
          <div className="radio-option">
            <input
              type="radio"
              id="dayOfMonth"
              name="monthRecurrenceType"
              value="dayOfMonth"
              checked={formData.monthRecurrence.type === 'dayOfMonth'}
              onChange={handleMonthRecurrenceTypeChange}
            />
            <label htmlFor="dayOfMonth">
              <select
                name="dayOfMonth"
                value={formData.monthRecurrence.dayOfMonth}
                onChange={handleMonthSpecificChange}
                disabled={formData.monthRecurrence.type !== 'dayOfMonth'}
                className="select-month-day"
              >
                {daysOfMonth
                  .map((day) => (
                    <option key={day} value={`Day_${day}`}>
                      Day {day}
                    </option>
                  ))
                  .concat([
                    <option key={32} value={'Last_Day'}>
                      Last Day
                    </option>,
                  ])}
              </select>
            </label>
          </div>

          <div className="radio-option">
            <input
              type="radio"
              id="nthDayOfWeek"
              name="monthRecurrenceType"
              value="nthDayOfWeek"
              checked={formData.monthRecurrence.type === 'nthDayOfWeek'}
              onChange={handleMonthRecurrenceTypeChange}
            />
            <label htmlFor="nthDayOfWeek">
              <select
                name="nthWeek"
                value={formData.monthRecurrence.nthWeek}
                onChange={handleMonthSpecificChange}
                disabled={formData.monthRecurrence?.type !== 'nthDayOfWeek'}
                className="select-nth-week"
              >
                {nthOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                name="dayOfWeekForNth"
                value={formData.monthRecurrence.dayOfWeekForNth}
                onChange={handleMonthSpecificChange}
                disabled={formData.monthRecurrence.type !== 'nthDayOfWeek'}
                className="select-nth-dayofweek"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      <input
        type="time"
        onChange={handleTimeChange}
        className="input-time"
        placeholder="Set time"
      />

      <div className="form-actions">
        <Button text="Submit" inType="submit" />
      </div>
    </form>
  );
}

export default HabitScheduleForm;
