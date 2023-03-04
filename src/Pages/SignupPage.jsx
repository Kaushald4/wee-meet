import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignUpMutation } from "../service/user/userService";

const SignupPage = (props) => {
    const [signupInfo, setSignUpInfo] = useState({
        email: "",
        password: "",
        name: "",
    });
    const [trigger, result] = useSignUpMutation();
    const navigate = useNavigate();

    useEffect(() => {
        return () => {};
    }, [result]);

    const handleSignup = (e) => {
        setSignUpInfo((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value,
            };
        });
    };
    const signupUser = () => {
        trigger(signupInfo)
            .unwrap()
            .then((res) => {
                if (res?.data) {
                    navigate("/login");
                }
            });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="p-10 bg-base-200 rounded-lg shadow-md w-[350px]">
                <h2 className="text-3xl font-semibold mb-5">Sign up</h2>
                <div className="mb-5">
                    <label
                        htmlFor="name"
                        className="text-gray-500 text-sm mb-2 block"
                    >
                        Name
                    </label>
                    <input
                        placeholder="Enter your name"
                        className="input input-bordered p-2 w-full"
                        onChange={handleSignup}
                        name="name"
                        value={signupInfo.name}
                    />
                </div>
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
                        onChange={handleSignup}
                        name="email"
                        value={signupInfo.email}
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
                        onChange={handleSignup}
                        name="password"
                        value={signupInfo.password}
                    />
                </div>
                <button onClick={signupUser} className="w-full mb-5">
                    Signup
                </button>
                <div></div>
                <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link to={"/login"} className="text-blue-500">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
