import { createGlobalStyle } from "styled-components";
import background from "./assets/app_background.jpg";

const GlobalStyles = createGlobalStyle`
    body {
        background-color: #f2f2f2; 
        min-height: 100vh; 
        font-size: 1.5rem;
        font-family: "Caladea";
        margin: 0; 
        padding: 0; 
        position: relative;
        overflow: auto; 
    }

    body::before {
        content: ''; 
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background-image: url(${background}); 
        background-size: cover; 
        background-position: center; 
        background-attachment: fixed; 
        opacity: 0.7;
        z-index: -1;
    }

    * {
        margin: 0;
        padding: 0;
        text-align: center;
    }

    .meal-button {
        background-color: #5fad56;
        border-radius: 8px;
        border-style: none;
        box-sizing: border-box;
        color: #FFFFFF;
        cursor: pointer;
        display: inline-block;
        font-size: 14px;
        font-weight: 500;
        height: 40px;
        line-height: 20px;
        list-style: none;
        margin: 0;
        outline: none;
        padding: 10px 16px;
        position: relative;
        text-align: center;
        text-decoration: none;
        transition: color 100ms;
        vertical-align: baseline;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
    }

    .meal-button:hover,
    .meal-button:focus {
        background-color: #F78154;
    }

    h3 {
        margin-bottom: 20px;
    }

    label {
        font-weight: bold;
    }
`;

export default GlobalStyles;
