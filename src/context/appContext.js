import React, { useReducer, useContext, useEffect } from 'react'
import reducer from './reducer';
import { DISPLAY_ALERT, CLEAR_ALERT, SETUP_USER_BEGIN, SETUP_USER_ERROR, SETUP_USER_SUCCESS, TOGGLE_SIDEBAR, LOGOUT_USER, UPDATE_USER_BEGIN, UPDATE_USER_ERROR, UPDATE_USER_SUCCESS, HANDLE_CHANGE, CLEAR_VALUES, CREATE_JOB_BEGIN, CREATE_JOB_SUCCESS, CREATE_JOB_ERROR, GET_JOBS_BEGIN, GET_JOBS_SUCCESS, SET_EDIT_JOB, DELETE_JOB_BEGIN, EDIT_JOB_BEGIN, EDIT_JOB_SUCCESS, EDIT_JOB_ERROR, SHOW_STATS_BEGIN, SHOW_STATS_SUCCESS, CLEAR_FILTERS, CHANGE_PAGE, DELETE_JOB_ERROR, GET_CURRENT_USER_BEGIN, GET_CURRENT_USER_SUCCESS } from "./action";
import axios from 'axios'

export const initialState = {
    isLoading: false,
    showAlert: false,
    alertText: '',
    alertType: '',
    user: null,
    userLocation: '',
    showSidebar: false,
    
    // job
    jobLocation: '',
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

  userLoading: true,
};

const AppContext = React.createContext();
const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // AXIOS
    const authFetch = axios.create({
        baseURL: 'https://job-tracker-ru7r.onrender.com/api/v1',
    });

    // --request interceptor ---removed after setting token in cookie
    authFetch.interceptors.request.use(
        (config) => {
          config.withCredentials = true;
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

            const {user, location} = data
            dispatch({type: SETUP_USER_SUCCESS, payload: { user, location, alertText }}) 

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
    const logoutUser = async () => {
      await authFetch('/auth/logout');
      dispatch({ type: LOGOUT_USER })
    }
    
    // update user
    const updateUser = async (currentUser) => {
        dispatch({ type: UPDATE_USER_BEGIN })

        try {
            const { data } = await authFetch.patch('/auth/updateUser', currentUser);
            const { user, location } = data;

            dispatch({
                type: UPDATE_USER_SUCCESS,
                payload: { user, location },
            });
        
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
      const { page, search, searchStatus, searchType, sort } = state
        let url = `/jobs?page=${page}&status=${searchStatus}&jobType=${searchType}&sort=${sort}`;

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
          if (error.response.status === 401) return;
          dispatch({
            type: DELETE_JOB_ERROR,
            payload: { msg: error.response.data.msg },
          });
          // logoutUser();
        }

        setTimeout(() => {
          clearAlert()
      }, 3000);
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
        logoutUser()
      }
  
      clearAlert()
    }

    // clear filters for all job search
    const clearFilters = () => {
      dispatch({ type: CLEAR_FILTERS });
    };

    // change page
    const changePage = (page) => {
      dispatch({ type: CHANGE_PAGE, payload: { page } })
    }

    // get current user
    const getCurrentUser = async () => {
      dispatch({ type: GET_CURRENT_USER_BEGIN });
      try {
        const { data } = await authFetch('/auth/getCurrentUser');
        const { user, location } = data;
    
        dispatch({
          type: GET_CURRENT_USER_SUCCESS,
          payload: { user, location },
        });
      } catch (error) {
        if (error.response.status === 401) return;
        logoutUser();
      }
    };

    useEffect(() => {
      getCurrentUser();
    }, []);

    return (
        <AppContext.Provider
            value={{ ...state, displayAlert, clearAlert, setupUser, toggleSidebar, logoutUser, updateUser, handleChange, clearValues, createJob, getJobs, setEditJob, editJob, deleteJob, showStats, clearFilters, changePage }}
        >
            {children}
        </AppContext.Provider>
    )
};

// custom hook
export const useAppContext = () => useContext(AppContext);

export { AppProvider }