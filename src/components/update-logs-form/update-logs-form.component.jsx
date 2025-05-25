import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import Button from '../button/button.component';

const createHabitLogQuery = gql`
  mutation ($createHabitLogInput: CreateHabitLogInput!) {
    createHabitLog(createHabitLogInput: $createHabitLogInput) {
      message
    }
  }
`;

function UpdateLogsForm(props) {
  const {
    updateLogsClickedData,
    handleSubmit,
    refetchData,
    setIsUpdateLogsModalOpen,
  } = props.options;
  const [createHabitLog] = useMutation(createHabitLogQuery);
  const [updateLogsModalForm, setUpdateLogsModalForm] = useState({
    count: '',
  });

  function handleInputChange() {
    return (e) => {
      const { name, value } = e.target;

      setUpdateLogsModalForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    };
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        handleSubmit({
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
        });
      }}
    >
      <input
        type="text"
        name="count"
        placeholder="count"
        onChange={handleInputChange()}
        required
      />

      <div className="form-actions">
        <Button text="Submit" inType="submit" />
      </div>
    </form>
  );
}

export default UpdateLogsForm;
