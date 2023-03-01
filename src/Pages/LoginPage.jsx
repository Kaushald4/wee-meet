import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../service/user/userService";

function LoginPage() {
    const [loginInfo, setLoginInfo] = useState({ email: "", password: "" });
    const [trigger, result] = useLoginMutation();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        setLoginInfo((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value,
            };
        });
    };
    const loginUser = () => {
        trigger(loginInfo)
            .unwrap()
            .then((res) => {
                if (res?.data) {
                    navigate("/", { replace: true });
                }
            });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="p-10 bg-base-200 rounded-lg shadow-md w-[350px]">
                <h2 className="text-3xl font-semibold mb-5">Log In</h2>
                <div className="mb-5">
                    <label
                        htmlFor="email"
                        className="text-gray-500 text-sm mb-2 block"
                    >
                        Email
                    </label>
                    <input
                        placeholder="Enter your email"
                        className="input input-bordered p-2 w-full"
                        onChange={handleLogin}
                        name="email"
                        value={loginInfo.email}
                    />
                </div>
                <div className="mb-5">
                    <label
                        htmlFor="email"
                        className="text-gray-500 text-sm mb-2 block"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="input input-bordered p-2 w-full"
                        onChange={handleLogin}
                        name="password"
                        value={loginInfo.password}
                    />
                </div>
                <button onClick={loginUser} className="w-full mb-5">
                    Log In
                </button>
                <p className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link to={"/signup"} className="text-blue-500">
                        Sign up here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
