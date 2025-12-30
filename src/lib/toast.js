import Swal from "sweetalert2";

export const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  customClass: {
    popup: "rounded-xl",
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const toastSuccess = (title) =>
  toast.fire({
    icon: "success",
    title,
  });

export const toastError = (title) =>
  toast.fire({
    icon: "error",
    title,
  });

export const toastInfo = (title) =>
  toast.fire({
    icon: "info",
    title,
  });
