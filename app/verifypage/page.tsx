"use client"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📧</div>

        <h1 className="text-3xl font-bold text-gray-900">
          Verify Your Email
        </h1>

        <p className="mt-4 text-gray-600 leading-7">
          Your account has been created successfully.
          <br />
          We've sent a verification email to your inbox.
        </p>

        <p className="mt-3 text-gray-600">
          Please verify your email before signing in.
        </p>

        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            If you don't see the email, check your <strong>Spam</strong> or{" "}
            <strong>Junk</strong> folder.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/login")}
          className="mt-8 w-full rounded-lg bg-black px-4 py-3 text-white font-medium hover:bg-gray-800 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}