import './button.styles.scss';

const Button = (props) => {
  const { inType, text, classes } = props;

  return (
    <button className={`basic-button ${classes?.join(' ')}`} type={inType}>
      {text}
    </button>
  );
};

export default Button;
