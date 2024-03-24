import axios from 'axios';

export const baseURL = process.env.REACT_APP_BACKEND  || "http://localhost:8000";


axios.defaults.xsrfHeaderName = "X-Csrftoken";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true; 
axios.defaults.withXSRFToken = true;
export const api = axios.create({
  baseURL: baseURL + "/api"
});

export default api;
