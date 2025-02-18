import React from "react";
import MainButton from "../buttons/MainButton";
import "./AuthButtons.css";

const AuthButtons = () => {
  return (
    <div className="AuthButton">
      <div className="auth_button_container">
        <div className="client_auth">
          <p>CLIENT</p>
          <MainButton
            href="/client-signin"
            bgColor="#e6607d"
            textColor="black"
            hoverColor="#8f9fc7"
          >
            Sign In as Client
          </MainButton>
          <MainButton
            href="/client-reg"
            bgColor="#e6607d"
            textColor="black"
            hoverColor="#8f9fc7"
          >
            Sign Up Client
          </MainButton>
        </div>
        <div className="trainer_auth">
          <p>TRAINER</p>
          <MainButton
            href="/trainer-signin"
            bgColor="#a1b3e0"
            textColor="black"
            hoverColor="#8f9fc7"
          >
            Sign In as Trainer
          </MainButton>
          <MainButton
            href="/trainer-reg"
            bgColor="#a1b3e0"
            textColor="black"
            hoverColor="#8f9fc7"
          >
            Sign Up Trainer
          </MainButton>
        </div>
        <br />
        <br />
      </div>
    </div>
  );
};

export default AuthButtons;
