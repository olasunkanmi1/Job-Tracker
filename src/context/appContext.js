import React, { useReducer, useContext } from 'react'
import reducer from './reducer';
import { DISPLAY_ALERT, CLEAR_ALERT, REGISTER_USER_BEGIN, REGISTER_USER_SUCCESS, REGISTER_USER_ERROR } from "./action";
import axios from 'axios'

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
const userLocation = localStorage.getItem('location');

export const initialState = {
    isLoading: false,
    showAlert: false,
    alertText: '',
    alertType: '',
    user: user ? JSON.parse(user) : null,
    token: token,
    userLocation: userLocation || '',
    jobLocation: userLocation || '',
};

const AppContext = React.createContext();
const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const addUserToLocalStorage = ({ user, token, location }) => {
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)
        localStorage.setItem('location', location)
    }
    
    const removeUserFromLocalStorage = () => {
        localStorage.setItem('user')
        localStorage.setItem('token')
        localStorage.setItem('location')
    }

    // alert
    const displayAlert = () => dispatch({ type: DISPLAY_ALERT });
    const clearAlert = () => dispatch({ type: CLEAR_ALERT })

    // register
    const registerUser = async (currentUser) => {
        dispatch({ type: REGISTER_USER_BEGIN })
        try {
        console.log(currentUser)
            const { data } = await axios.post('http://localhost:5000/api/v1/auth/register', currentUser)
            // console.log(data)
            const {user, token, location} = data
            dispatch({type: REGISTER_USER_SUCCESS, payload: { user, token, location }})

            addUserToLocalStorage({user, token, location})
        } catch (error) {
            // console.log(error.response)
            dispatch({type: REGISTER_USER_ERROR, payload: { msg: error.response.data.msg }})

            // clearAlert()
        }
    }


    return (
        <AppContext.Provider
            value={{ ...state, displayAlert, clearAlert, registerUser }}
        >
            {children}
        </AppContext.Provider>
    )
};

// custom hook
export const useAppContext = () => useContext(AppContext);

export { AppProvider }