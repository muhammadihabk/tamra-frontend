import './modal.styles.scss';

function Modal(props) {
  const {
    options: { handleCloseModal },
    children,
  } = props;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button className="CRUD-button" onClick={handleCloseModal}>
            x
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;
