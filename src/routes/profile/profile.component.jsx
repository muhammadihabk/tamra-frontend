import { useAuth } from '../../context/auth.context';
import Spinner from '../../components/spinner/spinner.component';
import './profile.styles.scss';
import Modal from '../../components/modal/modal.component';
import { useQuery, gql } from '@apollo/client';
import { Fragment, useState } from 'react';
import UpdateLogsForm from '../../components/update-logs-form/update-logs-form.component';
import HabitScheduleForm from '../../components/habit-schedule-form/habit-schedule-form.component';
import * as dateFns from 'date-fns';
import { Outlet, useNavigate } from 'react-router-dom';

/**
 * Return day e.g. "Sat", "Fri"
 */
function getShortDayOfWeek(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function generateLastNDaysDates(numDays) {
  const dates = [];
  const today = new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const date = dateFns.subDays(today, i);
    dates.push(date);
  }

  return dates;
}

function getlast7DaysDatesJSX() {
  const last7DaysDates = generateLastNDaysDates(7);
  return last7DaysDates.map((day) => (
    <th className="week-days" key={day}>
      {getShortDayOfWeek(new Date(day))}
    </th>
  ));
}

function getJSXLogs(options) {
  const { habit, setIsUpdateLogsModalOpen } = options;
  const { logs: inLogs } = habit;
  const last7DaysDates = generateLastNDaysDates(7);
  if (!inLogs) {
    let result = [];
    last7DaysDates.forEach((date, i) => {
      result.push(
        <td
          key={`${i}${habit._id}`}
          data-habit-id={habit._id}
          data-count="-"
          data-date={new Date(date).toISOString()}
          onClick={handleLogsClick(setIsUpdateLogsModalOpen)}
        >
          -
        </td>
      );
    });

    return result;
  }

  const logs = inLogs.slice(-7);
  const jsxLogs = [];
  last7DaysDates.forEach((date, i) => {
    const foundLog = logs.find((log) => {
      const logDate = new Date(log.date).toLocaleString();

      return dateFns.isSameDay(logDate, date);
    });
    const count = foundLog?.count || '-';
    let className = '';
    if (foundLog?.count) {
      className = count >= habit.goal.count ? 'goal-met' : 'goal-not-met';
    }

    jsxLogs.push(
      <td
        className={className}
        key={`${i}${habit._id}`}
        data-habit-id={habit._id}
        data-count={count}
        data-date={new Date(date).toISOString()}
        onClick={handleLogsClick(setIsUpdateLogsModalOpen)}
      >
        {count}
      </td>
    );
  });

  return jsxLogs;
}

function handleCloseModal(setOpenModal) {
  setOpenModal(false);
}

let updateLogsClickedData = null;
function handleLogsClick(setIsUpdateLogsModalOpen) {
  return (e) => {
    const dataset = e.target.dataset;

    updateLogsClickedData = {
      habitInstanceId: dataset.habitId,
      date: dataset.date,
    };
    setIsUpdateLogsModalOpen(true);
  };
}

function handleSubmit(options) {
  const { callAPI, payload, refetchData, setOpenModal } = options;

  try {
    callAPI(payload);
    handleCloseModal(setOpenModal);
    refetchData();
  } catch (error) {
    console.log(error);
  }
}

function handleAddHabitButton(setIsAddHabitModalOpen) {
  return () => {
    setIsAddHabitModalOpen(true);
  };
}

const getUser = gql`
  query ($id: String!) {
    user(id: $id) {
      _id
      name
      email
      picture
      createdAt
      updatedAt
    }

    habitsByUserId(id: $id) {
      _id
      habitDefinitionId
      createdAt
      updatedAt
      logs {
        _id
        count
        date
      }
      goal {
        count
        repeat {
          every
          interval
          on
          at
        }
      }
      habitDefinition {
        _id
        name
        createdAt
        updatedAt
      }
    }
  }
`;

function Profile() {
  const { userId } = useAuth();
  const [isUpdateLogsModalOpen, setIsUpdateLogsModalOpen] = useState(false);
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const navigate = useNavigate();

  function handleHabitNameClick(habitId) {
    navigate(`/me/habit/${habitId}`);
  }

  const {
    loading,
    error,
    data: user,
    refetch: refetchData,
  } = useQuery(getUser, {
    variables: { id: userId },
    skip: !userId,
  });

  if (error) {
    return <p>Something went wrong</p>;
  }

  return loading ? (
    <Spinner />
  ) : (
    <Fragment>
      <div className="page-wrapper">
        <Outlet />
        <section className="habits-week-logs" ariana-label="habits-week-logs">
          <div className="habit-week-logs-options">
            <input className="form-input" type="search" placeholder="Search" />
            <button
              className="CRUD-button"
              type="button"
              onClick={handleAddHabitButton(setIsAddHabitModalOpen)}
            >
              +
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th></th>
                {getlast7DaysDatesJSX()}
              </tr>
            </thead>
            <tbody>
              {user.habitsByUserId.map((habit) => {
                return (
                  <tr key={habit._id}>
                    <td
                      key={habit._id}
                      onClick={() => handleHabitNameClick(habit._id)}
                    >
                      {habit.habitDefinition.name}
                    </td>
                    {getJSXLogs({ habit, setIsUpdateLogsModalOpen })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {isUpdateLogsModalOpen && (
          <Modal
            options={{
              handleCloseModal: () => {
                handleCloseModal(setIsUpdateLogsModalOpen);
              },
            }}
          >
            <UpdateLogsForm
              options={{
                updateLogsClickedData,
                handleSubmit,
                refetchData,
                setIsUpdateLogsModalOpen,
              }}
            />
          </Modal>
        )}

        {isAddHabitModalOpen && (
          <Modal
            options={{
              handleCloseModal: () => {
                handleCloseModal(setIsAddHabitModalOpen);
              },
            }}
          >
            <HabitScheduleForm
              options={{ handleSubmit, refetchData, setIsAddHabitModalOpen }}
            />
          </Modal>
        )}
      </div>
    </Fragment>
  );
}

export default Profile;
