import { useState } from "react";
import { Form } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import Button from "@components/button";
import Message from "@components/form/input/ErrorMessage";
import Label from "@components/form/Label";
import { Modal } from "@components/modal";
import { PasswordFormValues } from "interface/user";
import { useUpdateProfilePasswordMutation } from "@services/userApi";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { useModal } from "../../hooks/useModal";

export default function UserAddressCard() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [updatePassword] = useUpdateProfilePasswordMutation();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>();

  const closeAndReset = () => {
    reset({
      currentPassword: "",
      password: "",
      confirmPassword: "",
    });
    closeModal();
  };

  const validatePassword = (value: string) => {
    const passwordCriteria =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return (
      passwordCriteria.test(value) ||
      "Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character."
    );
  };

  const onSubmit: SubmitHandler<PasswordFormValues> = async (
    data: PasswordFormValues
  ) => {
    try {
      await updatePassword({ params: data }).unwrap();
      closeAndReset();
    } catch (error) {
      console.error("Failed to update password:", error);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Password
            </h4>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeAndReset} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="col-span-2">
                <Form.Group>
                  <Label>
                    Current Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Form.Control
                      placeholder="Enter your current password"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800 ${
                        errors.currentPassword
                          ? "border-rose-300 focus:border-rose-300  dark:border-rose-300 dark:focus:border-rose-300"
                          : "dark:focus:border-primary focus:border-primary"
                      }`}
                      {...register("currentPassword", {
                        required: "Current password is required.",
                      })}
                      isInvalid={!!errors.currentPassword}
                    />
                    <span
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showCurrentPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  <Message message={errors?.currentPassword?.message ?? ""} />
                </Form.Group>
              </div>
              <div className="col-span-2 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 pt-3">
                <Form.Group>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Form.Control
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800 ${
                        errors.password
                          ? "border-rose-300 focus:border-rose-300  dark:border-rose-300 dark:focus:border-rose-300"
                          : "dark:focus:border-primary focus:border-primary"
                      }`}
                      {...register("password", {
                        required: "Password is required.",
                        validate: validatePassword,
                      })}
                      isInvalid={!!errors.password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  <Message message={errors?.password?.message ?? ""} />
                </Form.Group>
                <Form.Group>
                  <Label>
                    Confirm Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Enter your Confirm Password"
                      autoComplete="new-password"
                      className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800 ${
                        errors.confirmPassword
                          ? "border-rose-300 focus:border-rose-300  dark:border-rose-300 dark:focus:border-rose-300"
                          : "dark:focus:border-primary focus:border-primary"
                      }`}
                      {...register("confirmPassword", {
                        required: "Confirm Password is required.",
                        validate: (value) =>
                          value === watch("password") ||
                          "Passwords do not match.",
                      })}
                      isInvalid={!!errors.confirmPassword}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  <Message message={errors?.confirmPassword?.message ?? ""} />
                </Form.Group>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeAndReset}>
                Close
              </Button>
              <Button size="sm" type={'submit'}>Save Changes</Button>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
}
