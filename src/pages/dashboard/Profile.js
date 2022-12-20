import { useState } from 'react';
import { FormRow, Alert } from '../../components';
import { useAppContext } from '../../context/appContext';
import Wrapper from '../../assets/wrappers/DashboardFormPage';

const Profile = () => {
  const { user, showAlert, displayAlert, clearAlert, updateUser, isLoading } = useAppContext();
  const [values, setValues] = useState({
    name: user?.name,
    email: user?.email,
    lastName: user?.lastName,
    location: user?.location
  });
  const { name, email, lastName, location } = values

  const handleChange = (e) => {
    clearAlert();

    setValues({
      ...values,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !lastName || !location) {
      displayAlert();
      return;
    }

    updateUser({ name, email, lastName, location });
  };

  return (
    <Wrapper>
      <form className='form' onSubmit={handleSubmit}>
        <h3>profile </h3>
        {showAlert && <Alert />}

        {/* name */}
        <div className='form-center'>
          <FormRow
            type='text'
            name='name'
            value={name}
            handleChange={(e) => handleChange(e)}
          />
          <FormRow
            labelText='last name'
            type='text'
            name='lastName'
            value={lastName}
            handleChange={(e) => handleChange(e)}
          />
          <FormRow
            type='email'
            name='email'
            value={email}
            handleChange={(e) => handleChange(e)}
          />

          <FormRow
            type='text'
            name='location'
            value={location}
            handleChange={(e) => handleChange(e)}
          />
          <button className='btn btn-block' type='submit' disabled={isLoading}>
            {isLoading ? 'Please Wait...' : 'save changes'}
          </button>
        </div>
      </form>
    </Wrapper>
  );
};

export default Profile;