import { toast } from 'react-toastify';

toast.configure();

const Notify = (value, type) => toast(value, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    type: type
});

export default Notify;