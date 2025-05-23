import { useAuth } from '../../context/auth.context';
import Spinner from '../../components/spinner/spinner.component';
import './profile.styles.scss';
import Modal from '../../components/modal/modal.component';
import { useQuery, gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import HabitScheduleForm from '../../components/habit-schedule-form/habit-schedule-form.component';
import Button from '../../components/button/button.component';

function getLast7Logs(logs) {
  return logs.slice(-7);
}

/**
 * Return day e.g. "Sat" or "Fri"
 */
function getShortDayOfWeek(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function getPast7DaysJSX() {
  const past7Days = getPast7Days();
  return past7Days.map((day) => (
    <th className="week-days" key={day}>
      {getShortDayOfWeek(new Date(day))}
    </th>
  ));
}

function getPast7Days() {
  const past7Days = [];
  const today = new Date();
  const weekAgo = new Date(today.setDate(today.getDate() - 6));
  for (let i = 0; i < 7; i++) {
    past7Days.push(
      new Date(new Date().setDate(weekAgo.getDate() + i)).setHours(0, 0, 0, 0)
    );
  }

  return past7Days;
}

let updateLogsClickedData = null;
function handleOpenUpdateLogsModal(setIsUpdateLogsModalOpen) {
  return (e) => {
    const dataset = e.target.dataset;

    updateLogsClickedData = {
      habitInstanceId: dataset.habitId,
      date: dataset.date,
    };
    setIsUpdateLogsModalOpen(true);
  };
}

function getJSXLogs(options) {
  const { habit, setIsUpdateLogsModalOpen } = options;
  const { logs: inLogs } = habit;
  if (!inLogs) {
    return [];
  }

  const logs = getLast7Logs(inLogs);
  const jsxLogs = [];
  const past7Days = getPast7Days();
  past7Days.forEach((day, i) => {
    const foundLog = logs.find((log) => {
      const logDate = new Date(log.date).setHours(0, 0, 0, 0);
      const todayDate = day;
      return logDate === todayDate;
    });
    const count = foundLog?.count || 0;
    const className = count >= habit.goal.count ? 'goal-met' : 'goal-not-met';

    jsxLogs.push(
      <td
        className={className}
        key={i}
        data-habit-id={habit._id}
        data-count={count}
        data-date={new Date(day).toISOString()}
        onClick={handleOpenUpdateLogsModal(setIsUpdateLogsModalOpen)}
      >
        {count}
      </td>
    );
  });

  return jsxLogs;
}

function handleCloseModal(setOpenModal, refetchData) {
  if (refetchData) {
    refetchData(true);
  }
  setOpenModal(false);
}

function handleSubmit(options) {
  const { callAPI, payload, refetchData, setOpenModal } = options;

  try {
    callAPI(payload);
    handleCloseModal(setOpenModal, refetchData);
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

const createHabitLogQuery = gql`
  mutation ($createHabitLogInput: CreateHabitLogInput!) {
    createHabitLog(createHabitLogInput: $createHabitLogInput) {
      message
    }
  }
`;

function Profile() {
  const { userId } = useAuth();
  const [isUpdateLogsModalOpen, setIsUpdateLogsModalOpen] = useState(false);
  const [createHabitLog] = useMutation(createHabitLogQuery);
  const [updateLogsModalForm, setUpdateLogsModalForm] = useState({});
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);

  function handleInputChange(stateSetter) {
    return (e) => {
      const { name, value } = e.target;

      stateSetter((form) => ({
        ...form,
        [name]: value,
      }));
    };
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
    <div className="page-wrapper">
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
              {getPast7DaysJSX()}
            </tr>
          </thead>
          <tbody>
            {user.habitsByUserId.map((habit) => {
              return (
                <tr key={habit._id}>
                  <td key={habit._id}>{habit.habitDefinition.name}</td>
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
          <form
            onSubmit={handleSubmit({
              callAPI: createHabitLog,
              payload: {
                variables: {
                  createHabitLogInput: {
                    ...updateLogsClickedData,
                    count: Number(updateLogsModalForm.count),
                  },
                },
              },
              refetchData,
              setOpenModal: setIsUpdateLogsModalOpen,
            })}
          >
            <input
              type="text"
              name="count"
              placeholder="count"
              onChange={handleInputChange(setUpdateLogsModalForm)}
              required
            />

            <div className="form-actions">
              <Button text="Submit" inType="submit" />
            </div>
          </form>
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
  );
}

export default Profile;
