import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <ForgotPasswordForm onBackToSignIn={() => window.location.href = "/signin"} />
        </div>
    );
}