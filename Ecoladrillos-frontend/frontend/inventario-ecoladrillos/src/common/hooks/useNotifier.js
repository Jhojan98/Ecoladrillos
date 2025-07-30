import { toast } from 'react-toastify'

export const useNotifier = () => {
  const toastId = 'unique-toast'

  const success = (msg) => toast.success(msg, { toastId })
  const error = (msg) => toast.error(msg, { autoClose: 4000, toastId })
  const info = (msg) => toast.info(msg, { toastId })
  const warn = (msg) => toast.warn(msg, { toastId })

  return { success, error, info, warn }
}
