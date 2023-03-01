import React from "react";
import { useGetLoggedInUserQuery } from "../service/user/userService";
import { Link } from "react-router-dom";

const Header = (props) => {
    const { data, error, isLoding } = useGetLoggedInUserQuery();

    return (
        <div className="h-[70px] bg-neutral text-neutral-content">
            <div className="h-full flex items-center px-[50px]">
                <div>
                    <h4>We Meet</h4>
                </div>

                <div className="ml-auto flex items-center gap-4">
                    {data ? (
                        <>
                            <div>
                                <p>Kaushal@gmail.com</p>
                            </div>
                            <div className="avatar placeholder">
                                <div className="bg-primary-focus text-primary-content rounded-full w-[50px]">
                                    <span className="text-3xl">K</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <Link to="/login">Login</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
