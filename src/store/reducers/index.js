import {combineReducers} from 'redux';
import flashReducer from './FlashLight.js';
const allReducers= combineReducers({
  flashstatus: flashReducer,
});
export default allReducers;