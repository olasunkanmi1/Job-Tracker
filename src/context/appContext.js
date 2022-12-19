import React, { useReducer, useContext } from 'react'
import reducer from './reducer';
import { DISPLAY_ALERT, CLEAR_ALERT, SETUP_USER_BEGIN, SETUP_USER_ERROR, SETUP_USER_SUCCESS } from "./action";
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

    // alerts
    const displayAlert = () => dispatch({ type: DISPLAY_ALERT });
    const clearAlert = () => dispatch({ type: CLEAR_ALERT })

    // login and register
    const setupUser = async ({currentUser, endPoint, alertText}) => {
        dispatch({ type: SETUP_USER_BEGIN })
        try {
            const { data } = await axios.post(`http://localhost:5000/api/v1/auth/${endPoint}`, currentUser)

            const {user, token, location} = data
            dispatch({type: SETUP_USER_SUCCESS, payload: { user, token, location, alertText }}) 

            addUserToLocalStorage({user, token, location})
        } catch (error) {

            dispatch({type: SETUP_USER_ERROR, payload: { msg: error.response.data.msg }})

            // clearAlert()
        }
    }


    return (
        <AppContext.Provider
            value={{ ...state, displayAlert, clearAlert, setupUser }}
        >
            {children}
        </AppContext.Provider>
    )
};

// custom hook
export const useAppContext = () => useContext(AppContext);

export { AppProvider }