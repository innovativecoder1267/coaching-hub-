"use client";

import { useRouter } from "next/navigation";

export default function EmailVerifiedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-6">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-8 text-center">

        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Email Verified 🎉
        </h1>

        {/* Description */}
        <p className="mt-4 text-gray-600 leading-7">
          Your email address has been verified successfully.
        </p>

        <p className="mt-2 text-gray-600">
          You can now return to the Coaching Management System and continue
          setting up your account.
        </p>

        {/* Info Box */}
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">
            ✅ Verification completed successfully.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => router.push("/login")}
          className="mt-8 w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-gray-800"
        >
          Continue to Login
        </button>

        {/* Footer */}
        <p className="mt-6 text-sm text-gray-500">
          If this wasn't you, you can safely ignore this message.
        </p>
      </div>
    </div>
  );
}
