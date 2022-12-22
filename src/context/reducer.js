import { DISPLAY_ALERT, CLEAR_ALERT, SETUP_USER_BEGIN, SETUP_USER_ERROR, SETUP_USER_SUCCESS, TOGGLE_SIDEBAR, LOGOUT_USER, UPDATE_USER_BEGIN, UPDATE_USER_ERROR, UPDATE_USER_SUCCESS, HANDLE_CHANGE, CLEAR_VALUES, CREATE_JOB_BEGIN, CREATE_JOB_SUCCESS, CREATE_JOB_ERROR, GET_JOBS_BEGIN, GET_JOBS_SUCCESS, SET_EDIT_JOB, DELETE_JOB_BEGIN, EDIT_JOB_BEGIN, EDIT_JOB_ERROR, EDIT_JOB_SUCCESS, SHOW_STATS_BEGIN, SHOW_STATS_SUCCESS, CLEAR_FILTERS } from "./action";
import { initialState } from './appContext';

const reducer = (state, action) => {
    // alerts
    if(action.type === DISPLAY_ALERT){
        return{
            ...state, 
            showAlert: true,
            alertType: 'danger',
            alertText: 'Please provide all values!'
        }
    }
    
    if(action.type === CLEAR_ALERT){
        return{
            ...state, 
            showAlert: false,
            alertType: '',
            alertText: ''
        }
    }
    
    // login and register
    if(action.type === SETUP_USER_BEGIN){
        return{
            ...state, 
            isLoading: true
        }
    }
    
    if(action.type === SETUP_USER_SUCCESS){
        return{
            ...state, 
            isLoading: false,
            token: action.payload.token,
            user: action.payload.user,
            userLocation: action.payload.location,
            jobLocation: action.payload.location,
            showAlert: true,
            alertType: 'success',
            alertText: action.payload.alertText
        }
    }
    
    if(action.type === SETUP_USER_ERROR){
        return{
            ...state, 
            isLoading: false,
            showAlert: true,
            alertType: 'danger',
            alertText: action.payload.msg
        }
    }

    // toggle sidebar
    if(action.type === TOGGLE_SIDEBAR){
        return{
            ...state, 
            showSidebar: !state.showSidebar
        }
    }
    
    // logout user
    if (action.type === LOGOUT_USER) {
        return {
          ...initialState,
          user: null,
          token: null,
          userLocation: '',
          jobLocation: '',
        };
    }

    // update user
    if (action.type === UPDATE_USER_BEGIN) {
        return { ...state, isLoading: true }
    }
    
    if (action.type === UPDATE_USER_SUCCESS) {
        return {
            ...state,
            isLoading: false,
            token:action.payload.token,
            user: action.payload.user,
            userLocation: action.payload.location,
            jobLocation: action.payload.location,
            showAlert: true,
            alertType: 'success',
            alertText: 'User Profile Updated!',
        }
    }

    if (action.type === UPDATE_USER_ERROR) {
        return {
            ...state,
            isLoading: false,
            showAlert: true,
            alertType: 'danger',
            alertText: action.payload.msg,
        }
    }
    
    // handle change for add and edit job
    if (action.type === HANDLE_CHANGE) {
        return { ...state, [action.payload.name]: action.payload.value };
    }
    
    // clear values
    if (action.type === CLEAR_VALUES) {
        const initialState = {
            isEditing: false,
            editJobId: '',
            position: '',
            company: '',
            jobLocation: state.userLocation,
            jobType: 'full-time',
            status: 'pending',
            jobs: [],
            totalJobs: 0,
            numOfPages: 1,
            page: 1,
        };
        return { ...state, ...initialState };
    }

    // create job
    if (action.type === CREATE_JOB_BEGIN) {
        return { ...state, isLoading: true };
    }

    if (action.type === CREATE_JOB_SUCCESS) {
        return {
            ...state,
            isLoading: false,
            showAlert: true,
            alertType: 'success',
            alertText: 'New Job Created!',
        };
    }

    if (action.type === CREATE_JOB_ERROR) {
        return {
            ...state,
            isLoading: false,
            showAlert: true,
            alertType: 'danger',
            alertText: action.payload.msg,
        };
    }

    // get all jobs
    if (action.type === GET_JOBS_BEGIN) {
        return { ...state, isLoading: true, showAlert: false };
    }

    if (action.type === GET_JOBS_SUCCESS) {
        return {
            ...state,
            isLoading: false,
            jobs: action.payload.jobs,
            totalJobs: action.payload.totalJobs,
            numOfPages: action.payload.numOfPages,
        };
    }

    // edit and delete job
    if (action.type === SET_EDIT_JOB) {
        const job = state.jobs.find((job) => job._id === action.payload.id);
        const { _id, position, company, jobLocation, jobType, status } = job;
        return {
          ...state,
          isEditing: true,
          editJobId: _id,
          position,
          company,
          jobLocation,
          jobType,
          status,
        };
    }

    if (action.type === EDIT_JOB_BEGIN) {
        return { ...state, isLoading: true };
    }

    if (action.type === EDIT_JOB_SUCCESS) {
        return {
            ...state,
            isLoading: false,
            showAlert: true,
            alertType: 'success',
            alertText: 'Job Updated!',
        };
    }

    if (action.type === EDIT_JOB_ERROR) {
        return {
            ...state,
            isLoading: false,
            showAlert: true,
            alertType: 'danger',
            alertText: action.payload.msg,
        };
    }

    // delete job
    if (action.type === DELETE_JOB_BEGIN) {
        return { ...state, isLoading: true };
    }

    // show stats
    if (action.type === SHOW_STATS_BEGIN) {
        return { ...state, isLoading: true, showAlert: false };
    }

    if (action.type === SHOW_STATS_SUCCESS) {
        return {
            ...state,
            isLoading: false,
            stats: action.payload.stats,
            monthlyApplications: action.payload.monthlyApplications,
        };
    }

    // clear filters
    if (action.type === CLEAR_FILTERS) {
        return {
          ...state,
          search: '',
          searchStatus: 'all',
          searchType: 'all',
          sort: 'latest',
        };
      }


    throw new Error(`no such action : ${action.type}`)
};

export default reducer