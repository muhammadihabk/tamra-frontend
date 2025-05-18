import { useState } from 'react';
import './modal.styles.scss';
import Button from '../button/button.component';
import { gql, useMutation } from '@apollo/client';

const query = gql`
  mutation ($createHabitLogInput: CreateHabitLogInput!) {
    createHabitLog(createHabitLogInput: $createHabitLogInput) {
      message
    }
  }
`;

function Modal(props) {
  const { setIsModalOpen, refetchLogsData, clickedData } = props.options;
  const [createHabitLog] = useMutation(query);

  const [formData, setFormData] = useState({
    count: '',
  });

  const handleCloseModal = () => {
    refetchLogsData(true);
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await createHabitLog({
      variables: {
        createHabitLogInput: {
          ...clickedData,
          count: Number(formData.count),
        },
      },
    });
    console.log('\n### logs response:\n', response, '\n###');

    handleCloseModal();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button className="CRUD-button" onClick={handleCloseModal}>
            x
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            className="form-input"
            type="text"
            name="count"
            placeholder="count"
            value={formData.count}
            onChange={handleInputChange}
            required
          />
          <div className="form-actions">
            <Button text="Submit" inType="submit" />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;
