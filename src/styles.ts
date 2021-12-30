import joro from 'joro';

export const DS = {
  fontFamily: {
    default: "Fira Mono, san-serif",
    alt: "'Staatliches', san-serif",
  },
  fontSizes: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    jumbo: 100

  },
  gutters: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    jumbo: 100
  },
  colors: {
    purple: "#8D58FD",
    pink: "#FD58B1",
    blue: "#58D5FD",
    blueLight: "#58D5FD",
    green: "#83FD58",
    white: "#FFFFFF",
    grey: "#efefef",
  }
}

export const STYLES = new joro();


// Components


// Sheets

export function UIStyles(){
  STYLES.add("UIStyles", `
    input {
      border: 0px;
      font-size: ${DS.fontSizes.lg}px;
      padding: ${DS.gutters.sm}px;
      width: 100%;
      border-radius: ${DS.gutters.sm/2}px;
      background: ${DS.colors.grey};
    }
    #chat-ui input {
      background: ${DS.colors.purple};
      color: #fff;
      border: 0px;
      border-radius: 30px;
      padding: 8px 14px 8px 14px;
    }
    #chat-ui ::placeholder {
      color: #000;
      opacity: 0.3;
    }
    

    #chat-ui {
      font-size: ${DS.fontSizes.md}px;
      padding: ${DS.gutters.md}px;
      position: absolute;
      left: 0px;
      top: 0px;
      height: 95vh;
      z-index: 3;
      flex-direction: column;
      display:flex;
      align-content: flex-end;
      justify-content: flex-end;
    }
    #chat-ui ul {
      display: flex;
      margin: 0;
      padding: ${DS.gutters.md}px;
      list-style: none;
    }
    #chat-ui li * {
      font-size: ${DS.fontSizes.lg}px;
    }
    #chat-ui li b {
      color: #000;
    }
 `)
}

export function IntroWizard(){
  STYLES.add("introStyles", `
    .container {
      width: 50vw;
      height: 100vh;
      display:flex;
      align-content: center;
      justify-content: center;
      flex-direction: column;
      position: relative;
      align-items: center;
      background: radial-gradient(118.95% 118.95% at 50% 50%, #FFFFFF 0%, #EFEFEF 100%);
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    }
    .container h1 {
      font-size: ${DS.fontSizes.jumbo*2}px;
      line-height: ${DS.fontSizes.jumbo*1.5}px;
      margin: 0;
      padding: 0;
      color: ${DS.colors.white};
      -webkit-text-stroke: ${DS.gutters.sm}px  ${DS.colors.pink};
      text-align:center;
    }
    .container h3 {
      font-size: ${DS.fontSizes.jumbo/2}px;
      margin: 0 0 ${DS.gutters.md}px 0;
      padding: 0;
      color: ${DS.colors.white};
      -webkit-text-stroke: ${DS.gutters.sm/3}px  ${DS.colors.blue};
      text-align:center;
    }
    .container button.next {
      display:block;
      background: ${DS.colors.green};
      border-radius:100%;
      border: 0px;
      height: 100px;
      width: 100px;
      font-size: ${DS.fontSizes.lg}px;
      color: ${DS.colors.white};
      font-weight:bold;
      position: absolute;
      bottom: ${DS.gutters.lg}px;
      left: 0px;
      right: 0px;
      margin: 0 auto;
    }
    .circle {
      border-radius: 100%;
    }
    #app {
      background-image: url('textures/background-grid.png')
    }
  `)
}

export function BaseStyles() {
  STYLES.add("baseStyles", `
  * {
  font-family: franxurter;

  }
    html,body {
      margin: 0;
      padding: 0;
      background: ${DS.colors.purple};
      color:  ${DS.colors.blue};
      opacity: 1;
      font-family: franxurter;
    }

    #app {
      position: absolute;
      z-index: 10;
      width: 100vw;
      display:flex;
      align-content: center;
      justify-content: center;
    }
    #game-container {
      background: #fff;
      position: absolute;
      z-index: 9;
      height: 100vh;
      top:0px;
      width: 100vw;
    }
    video {
      width: 100vw;
      height: auto;
      position: absolute;
      z-index: 0;
      top: -100vh;
      left: -100vw;
    }

    @keyframes notification {
      from {bottom: -120vh;}
      to { bottom: 5vh; }
    }
    @keyframes notification-out {
      to {bottom: -5vh; display:none;}
      from {bottom: 5vh; display:block;}
    }
  `)
}