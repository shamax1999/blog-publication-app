import Swal from "sweetalert2"

export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#3b82f6",
    timer: 3000,
    timerProgressBar: true,
  })
}

export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#ef4444",
  })
}

export const showConfirm = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  })
}

export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#3b82f6",
  })
}

export const showLoading = (title = "Processing...") => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}
