import { DISPLAY_ALERT, CLEAR_ALERT, SETUP_USER_BEGIN, SETUP_USER_ERROR, SETUP_USER_SUCCESS, TOGGLE_SIDEBAR, LOGOUT_USER, UPDATE_USER_BEGIN, UPDATE_USER_ERROR, UPDATE_USER_SUCCESS } from "./action";
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

    throw new Error(`no such action : ${action.type}`)
};

export default reducer