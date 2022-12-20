import React, { useReducer, useContext } from 'react'
import reducer from './reducer';
import { DISPLAY_ALERT, CLEAR_ALERT, SETUP_USER_BEGIN, SETUP_USER_ERROR, SETUP_USER_SUCCESS, TOGGLE_SIDEBAR, LOGOUT_USER, UPDATE_USER_BEGIN, UPDATE_USER_ERROR, UPDATE_USER_SUCCESS } from "./action";
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
    showSidebar: false
};

const AppContext = React.createContext();
const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // localStorage 
    const addUserToLocalStorage = ({ user, token, location }) => {
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)
        localStorage.setItem('location', location)
    }
    
    const removeUserFromLocalStorage = () => {
        localStorage.removeItem('user')
        localStorage.setItem('token')
        localStorage.setItem('location')
    }

    // AXIOS
    const authFetch = axios.create({
        baseURL: 'http://localhost:5000/api/v1',
    });

    // --request interceptor
    authFetch.interceptors.request.use(
        (config) => {
            config.headers['Authorization'] = `Bearer ${state.token}`;
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // --response interceptor
    authFetch.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            // console.log(error.response);
            if (error.response.status === 401) {
                logoutUser()
            }
            return Promise.reject(error);
        }
    );

    // alerts
    const displayAlert = () => dispatch({ type: DISPLAY_ALERT });
    const clearAlert = () => dispatch({ type: CLEAR_ALERT })

    // login and register
    const setupUser = async ({currentUser, endPoint, alertText}) => {
        dispatch({ type: SETUP_USER_BEGIN })
        try {
            const { data } = await authFetch.post(`/auth/${endPoint}`, currentUser)

            const {user, token, location} = data
            dispatch({type: SETUP_USER_SUCCESS, payload: { user, token, location, alertText }}) 

            addUserToLocalStorage({user, token, location})
        } catch (error) {

            dispatch({type: SETUP_USER_ERROR, payload: { msg: error.response.data.msg }})

            // clearAlert()
        }
    }

    // toggle sidebar
    const toggleSidebar = () => {
        dispatch({ type: TOGGLE_SIDEBAR })
    }
    
    // logout user
    const logoutUser = () => {
        dispatch({ type: LOGOUT_USER })
        removeUserFromLocalStorage()
    }
    
    // update user
    const updateUser = async (currentUser) => {
        dispatch({ type: UPDATE_USER_BEGIN })

        try {
            const { data } = await authFetch.patch('/auth/updateUser', currentUser);
            const { user, location, token } = data;

            dispatch({
                type: UPDATE_USER_SUCCESS,
                payload: { user, location, token },
            });
        
            addUserToLocalStorage({ user, location, token });
          } catch (error) {
            if(error.response.status  !== 401) {
                dispatch({
                    type: UPDATE_USER_ERROR,
                    payload: { msg: error.response.data.msg },
                });
            }
          }

          setTimeout(() => {
            clearAlert()
            
          }, 3000);

    }


    return (
        <AppContext.Provider
            value={{ ...state, displayAlert, clearAlert, setupUser, toggleSidebar, logoutUser, updateUser }}
        >
            {children}
        </AppContext.Provider>
    )
};

// custom hook
export const useAppContext = () => useContext(AppContext);

export { AppProvider }