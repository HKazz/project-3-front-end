import axios from "axios";

const Base_URL= `${import.meta.env.VITE_BACKEND_URL}/auth`;

const api = axios.create({
    baseURL : Base_URL
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

async function signup(formData) {
    try {
        const res = await api.post(`/sign-up`,formData)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

async function login(formData) {
    try {
        const res = await api.post(`/login`,formData)
        return res.data
    } catch (error) {
        console.log(error)
    }
}

async function verify(){
    try{
        const res = await api.get(`/verify`)
        return res.data
    }catch(err){
        console.log(err)
    }
}



  

  export { 
    verify,
    login,
    signup
  };