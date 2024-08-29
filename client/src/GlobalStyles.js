import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
	:root {
    --primary-color: #cc5500;
    --accent-color: #F9C700;
		--mostly-transparent: rgba(255,255,255,0.4);
    --max-content-width: 1200px;
		--base-size: 5px;
    --heading-font-family: 'Teko', sans-serif;
		--min-content-height: calc(100vh - 55px - 2.5rem);
		--min-details-content-height: calc(75vh - var(--base-size) - 2.5rem);
  }
	body {
		min-height: 100dvh;
		font-size: 1.5rem;
	}
	* {
		margin: 0;
		padding: 0;
		text-align: center;
	}
`;

export default GlobalStyles;
