import { useState } from 'react';
import Button from '../../components/button/button.component';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';
import './sign-up.styles.scss';

function SignUp() {
  const defaultFormFields = {
    name: '',
    email: '',
    password: '',
  };
  const { token, setToken } = useAuth();
  const [formFields, setFormFields] = useState(defaultFormFields);
  const navigate = useNavigate();
  if (token) {
    return <Navigate to="/me" replace />;
  }

  const handleFormSubmition = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_AUTH_BASE_URL}/sign-up`,
        formFields
      );

      setToken(response.data.token);
      navigate('/me');
    } catch (error) {
      console.error(error);
    }
  };

  function handleOnChange(e) {
    const { name, value } = e.target;

    setFormFields({ ...formFields, [name]: value });
  }

  return (
    <div className="page-wrapper form-wrapper">
      <h1>Sign Up</h1>
      <form className="new-user-form" onSubmit={handleFormSubmition}>
        <input
          name="name"
          placeholder="Name"
          value={formFields.name}
          type="text"
          required
          onChange={handleOnChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={formFields.email}
          type="email"
          required
          onChange={handleOnChange}
        />
        <input
          name="password"
          placeholder="Password"
          value={formFields.password}
          type="password"
          required
          onChange={handleOnChange}
        />
        <Button inType="submit" text="Sign up" />
      </form>
    </div>
  );
}

export default SignUp;
