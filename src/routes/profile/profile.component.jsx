import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../../context/auth.context';
import Spinner from '../../components/spinner/spinner.component';
import './profile.styles.scss';
import { useEffect, useState } from 'react';

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

function getJSXLogs(habit) {
  const { logs: inLogs } = habit;
  const logs = getLast7Logs(inLogs);
  const jsxLogs = [];
  const past7Days = getPast7Days();
  past7Days.forEach((day, i) => {
    const count = logs.find((log) => {
      const logDate = new Date(log.date).setHours(0, 0, 0, 0);
      const todayDate = day;
      return logDate === todayDate;
    })?.count;
    const className = count >= habit.goal.count ? 'goal-met' : 'goal-not-met';
    jsxLogs.push(
      <td className={className} key={i}>
        {count || 0}
      </td>
    );
  });

  return jsxLogs;
}

function Profile() {
  const { userId } = useAuth();

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
          reminder
          repeat {
            on
            every
            interval
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
  const {
    loading,
    error,
    data: user,
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
          <input type="search" placeholder="Search" />
          <button type="button">+</button>
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
                <tr>
                  <td key={habit._id}>{habit.habitDefinition.name}</td>
                  {getJSXLogs(habit)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Profile;
