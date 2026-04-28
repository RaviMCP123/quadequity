import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import PageBreadcrumb from "@components/common/PageBreadCrumb";
import PageMeta from "@components/common/PageMeta";
import Label from "@components/form/Label";
import Message from "@components/form/input/ErrorMessage";
import Button from "@components/button";
import {
  useGetEmailCredentialsQuery,
  useTestEmailCredentialsMutation,
  useUpdateEmailCredentialsMutation,
} from "@services/settingsApi";
import type { UpdateEmailCredentialsInput } from "interface/settings";

type EmailCredentialFormValues = UpdateEmailCredentialsInput;

const EmailCredentialsPage: React.FC = () => {
  const [testTo, setTestTo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { data, isFetching, refetch } = useGetEmailCredentialsQuery();
  const [updateEmailCredentials, { isLoading: isSaving }] =
    useUpdateEmailCredentialsMutation();
  const [testEmailCredentials, { isLoading: isTesting }] =
    useTestEmailCredentialsMutation();

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<EmailCredentialFormValues>({
    defaultValues: {
      host: "",
      port: 465,
      secure: true,
      user: "",
      from: "",
      pass: "",
    },
  });

  useEffect(() => {
    const payload = data?.data;
    if (!payload) return;

    if (payload.source !== "database") {
      reset({
        host: "",
        port: 465,
        secure: true,
        user: "",
        from: "",
        pass: "",
      });
      return;
    }

    const smtp = payload.smtp;
    reset({
      host: smtp.host || "",
      port: Number(smtp.port) || 465,
      secure: Boolean(smtp.secure),
      user: smtp.user || "",
      from: smtp.from || "",
      pass: smtp.pass || "",
    });
  }, [data, reset]);

  const onSubmit: SubmitHandler<EmailCredentialFormValues> = async (values) => {
    await updateEmailCredentials({
      host: values.host.trim(),
      port: Number(values.port),
      secure: Boolean(values.secure),
      user: values.user.trim(),
      from: values.from.trim(),
      pass: values.pass?.trim() ? values.pass : undefined,
    }).unwrap();
    await refetch();
  };

  const handleSendTestEmail = async () => {
    if (!testTo.trim()) return;
    const values = getValues();
    await updateEmailCredentials({
      host: values.host.trim(),
      port: Number(values.port),
      secure: Boolean(values.secure),
      user: values.user.trim(),
      from: values.from.trim(),
      pass: values.pass?.trim() ? values.pass : undefined,
    }).unwrap();
    await testEmailCredentials({ to: testTo.trim() }).unwrap();
    await refetch();
  };

  return (
    <>
      <PageMeta title="SMTP Credentials" />
      <PageBreadcrumb pageTitle="SMTP Credentials" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Email Credential Settings
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Save SMTP credentials that will be used by OTP and admin test email APIs.
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Current source: <strong>{data?.data?.source || "env"}</strong>
            {data?.data?.smtp?.hasPassword
              ? " (password is configured)"
              : " (password is not configured)"}
          </p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Form.Group>
              <Label>
                SMTP Host <span className="text-error-500">*</span>
              </Label>
              <Form.Control
                type="text"
                className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm ${
                  errors.host ? "border-rose-300" : "border-gray-300"
                }`}
                placeholder="quadequities.com.au"
                {...register("host", { required: "SMTP host is required." })}
                isInvalid={!!errors.host}
              />
              <Message message={errors.host?.message ?? ""} />
            </Form.Group>

            <Form.Group>
              <Label>
                SMTP Port <span className="text-error-500">*</span>
              </Label>
              <Form.Control
                type="number"
                className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm ${
                  errors.port ? "border-rose-300" : "border-gray-300"
                }`}
                placeholder="465"
                {...register("port", {
                  required: "SMTP port is required.",
                  valueAsNumber: true,
                  min: { value: 1, message: "Port must be at least 1." },
                  max: { value: 65535, message: "Port cannot exceed 65535." },
                })}
                isInvalid={!!errors.port}
              />
              <Message message={errors.port?.message ?? ""} />
            </Form.Group>

            <Form.Group>
              <Label>
                SMTP Username <span className="text-error-500">*</span>
              </Label>
              <Form.Control
                type="email"
                className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm ${
                  errors.user ? "border-rose-300" : "border-gray-300"
                }`}
                placeholder="irweb@quadequities.com.au"
                {...register("user", {
                  required: "SMTP username is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address.",
                  },
                })}
                isInvalid={!!errors.user}
              />
              <Message message={errors.user?.message ?? ""} />
            </Form.Group>

            <Form.Group>
              <Label>
                SMTP From <span className="text-error-500">*</span>
              </Label>
              <Form.Control
                type="email"
                className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm ${
                  errors.from ? "border-rose-300" : "border-gray-300"
                }`}
                placeholder="irweb@quadequities.com.au"
                {...register("from", {
                  required: "SMTP from is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address.",
                  },
                })}
                isInvalid={!!errors.from}
              />
              <Message message={errors.from?.message ?? ""} />
            </Form.Group>
          </div>

          <Form.Group>
            <Label>SMTP Password</Label>
            <div className="relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-sm"
                placeholder="Leave blank to keep existing password"
                {...register("pass")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.88 5.09C10.56 4.86 11.27 4.75 12 4.75C16.5 4.75 20.31 8.13 21.5 12C21.13 13.2 20.5 14.31 19.66 15.24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.1 6.1C4.17 7.43 2.75 9.54 2.5 12C3.69 15.87 7.5 19.25 12 19.25C13.87 19.25 15.62 18.66 17.05 17.66"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 12C3.69 8.13 7.5 4.75 12 4.75C16.5 4.75 20.31 8.13 21.5 12C20.31 15.87 16.5 19.25 12 19.25C7.5 19.25 3.69 15.87 2.5 12Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </Form.Group>

          <Form.Group className="flex items-center gap-2">
            <Form.Check id="smtp-secure" type="checkbox" {...register("secure")} />
            <Label>Use secure connection (SSL/TLS)</Label>
          </Form.Group>

          <div className="flex gap-3">
            <Button type="submit" size="sm" disabled={isSaving || isFetching}>
              {isSaving ? "Saving..." : "Save SMTP Credentials"}
            </Button>
          </div>
        </Form>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
          <h5 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Send Test Email
          </h5>
          <p className="mb-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sends a test email using the currently active SMTP settings.
          </p>
          <div className="flex flex-col gap-3 lg:flex-row">
            <Form.Control
              type="email"
              className="h-11 w-full lg:flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              placeholder="Recipient email (e.g. quadequity@gmail.com)"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
            />
            <Button
              size="sm"
              type="button"
              className="h-11 min-w-[140px] whitespace-nowrap"
              disabled={isSaving || isTesting || !testTo.trim()}
              onClick={handleSendTestEmail}
            >
              {isTesting ? "Sending..." : isSaving ? "Saving..." : "Send Test Email"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailCredentialsPage;
