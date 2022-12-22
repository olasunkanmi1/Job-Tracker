import React, { useReducer, useContext } from 'react'
import reducer from './reducer';
import { DISPLAY_ALERT, CLEAR_ALERT, SETUP_USER_BEGIN, SETUP_USER_ERROR, SETUP_USER_SUCCESS, TOGGLE_SIDEBAR, LOGOUT_USER, UPDATE_USER_BEGIN, UPDATE_USER_ERROR, UPDATE_USER_SUCCESS, HANDLE_CHANGE, CLEAR_VALUES, CREATE_JOB_BEGIN, CREATE_JOB_SUCCESS, CREATE_JOB_ERROR, GET_JOBS_BEGIN, GET_JOBS_SUCCESS, SET_EDIT_JOB, DELETE_JOB_BEGIN, EDIT_JOB_BEGIN, EDIT_JOB_SUCCESS, EDIT_JOB_ERROR, SHOW_STATS_BEGIN, SHOW_STATS_SUCCESS, CLEAR_FILTERS } from "./action";
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
    showSidebar: false,
    
    // job
    jobLocation: userLocation || '',
    isEditing: false,
    editJobId: '',
    position: '',
    company: '',
    jobTypeOptions: ['full-time', 'part-time', 'remote', 'internship'],
    jobType: 'full-time',
    statusOptions: ['pending', 'interview', 'declined'],
    status: 'pending',
    jobs: [],
    totalJobs: 0,
    numOfPages: 1,
    page: 1,

    // stats
    stats: {},
    monthlyApplications: [],

    // sort
    search: '',
  searchStatus: 'all',
  searchType: 'all',
  sort: 'latest',
  sortOptions: ['latest', 'oldest', 'a-z', 'z-a'],
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

    // handleChange for add and edit job and search filter
    const handleChange = ({ name, value }) => {
        dispatch({
          type: HANDLE_CHANGE,
          payload: { name, value },
        })
    }
    
    // clear values
    const clearValues = () => {
        dispatch({ type: CLEAR_VALUES })
    }

    // create job
    const createJob = async () => {
        dispatch({ type: CREATE_JOB_BEGIN });
        try {
          const { position, company, jobLocation, jobType, status } = state;
      
          await authFetch.post('/jobs', {
            company,
            position,
            jobLocation,
            jobType,
            status,
          });
          dispatch({
            type: CREATE_JOB_SUCCESS,
          });
          // call function instead clearValues()
          dispatch({ type: CLEAR_VALUES });
        } catch (error) {
          if (error.response.status === 401) return;
          dispatch({
            type: CREATE_JOB_ERROR,
            payload: { msg: error.response.data.msg },
          });
        }

        setTimeout(() => {
            clearAlert()
        }, 3000);
    };

    // get all jobs
    const getJobs = async () => {
      const { search, searchStatus, searchType, sort } = state
        let url = `/jobs?status=${searchStatus}&jobType=${searchType}&sort=${sort}`;

        if(search) {
          url = url + `&search=${search}`;
        }
      
        dispatch({ type: GET_JOBS_BEGIN })
        try {
          const { data } = await authFetch(url)
          const { jobs, totalJobs, numOfPages } = data
          dispatch({
            type: GET_JOBS_SUCCESS,
            payload: {
              jobs,
              totalJobs,
              numOfPages,
            },
          })
        } catch (error) {
          console.log(error.response)
          logoutUser()
        }
        clearAlert()
    }

    // edit and delete job
    const setEditJob = (id) => {
        dispatch({ type: SET_EDIT_JOB, payload: { id } })
    }

    const editJob = async () => {
        dispatch({ type: EDIT_JOB_BEGIN });
        try {
          const { position, company, jobLocation, jobType, status } = state;
      
          await authFetch.patch(`/jobs/${state.editJobId}`, {
            company,
            position,
            jobLocation,
            jobType,
            status,
          });
          dispatch({
            type: EDIT_JOB_SUCCESS,
          });
          dispatch({ type: CLEAR_VALUES });
        } catch (error) {
          if (error.response.status === 401) return;
          dispatch({
            type: EDIT_JOB_ERROR,
            payload: { msg: error.response.data.msg },
          });
        }
        
        setTimeout(() => {
            clearAlert()
        }, 3000);
    };

    const deleteJob = async (jobId) => {
        dispatch({ type: DELETE_JOB_BEGIN });
        try {
          await authFetch.delete(`/jobs/${jobId}`);
          getJobs();
        } catch (error) {
          logoutUser();
        }
    };

    // show stats
    const showStats = async () => {
      dispatch({ type: SHOW_STATS_BEGIN })
      try {
        const { data } = await authFetch('/jobs/stats')
        dispatch({
          type: SHOW_STATS_SUCCESS,
          payload: {
            stats: data.defaultStats,
            monthlyApplications: data.monthlyApplications,
          },
        })
      } catch (error) {
        console.log(error.response)
        // logoutUser()
      }
  
      clearAlert()
    }

    // clear filters for all job search
    const clearFilters = () => {
      dispatch({ type: CLEAR_FILTERS });
    };


    return (
        <AppContext.Provider
            value={{ ...state, displayAlert, clearAlert, setupUser, toggleSidebar, logoutUser, updateUser, handleChange, clearValues, createJob, getJobs, setEditJob, editJob, deleteJob, showStats, clearFilters }}
        >
            {children}
        </AppContext.Provider>
    )
};

// custom hook
export const useAppContext = () => useContext(AppContext);

export { AppProvider }