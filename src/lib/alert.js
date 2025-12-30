import Swal from "sweetalert2";

export const alertSuccess = (title, text) =>
  Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#1e40af", // blue-900
  });

export const alertError = (title, text) =>
  Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#dc2626",
  });

export const alertConfirm = async (title, text) => {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    confirmButtonColor: "#1e40af",
  });

  return result.isConfirmed;
};
