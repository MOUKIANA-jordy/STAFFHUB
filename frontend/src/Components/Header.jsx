import {
    Bell,
    Mail,
    Search,
    ChevronDown
} from "lucide-react";

import useAuth from "../Hooks/useAuth";

import React, { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import "../Styles/header.css";

export default function Header() {

    const { user } = useAuth();

    return (

        <header className="header">

            <div className="header-search">

                <Search size={18} />

                <input
                    type="text"
                    placeholder="Rechercher..."
                />

            </div>

            <div className="header-right">

                <button className="header-icon">

                    <Bell size={22}/>

                    <span className="badge">4</span>

                </button>

                <button className="header-icon">

                    <Mail size={22}/>

                    <span className="badge">2</span>

                </button>

                <div className="header-profile">

                    <img
                        src={
                            user?.photo ||
                            "https://i.pravatar.cc/100"
                        }
                        alt="profil"
                    />

                    <div>

                        <strong>

                            {user?.first_name} {user?.last_name}

                        </strong>

                        <span>

                            {user?.role || "Salarié"}

                        </span>

                    </div>

                    <ChevronDown size={18}/>

                </div>

            </div>

        </header>

    );

}
