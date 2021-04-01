import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://no-such-url.com'
});

export default instance;