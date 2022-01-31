import React, { useState, useEffect } from "react";
import './App.css';

import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { Typography } from "@material-ui/core";
import Container from '@material-ui/core/Container';
import TypeWriter from 'react-typewriter';



import { useCurrentUser } from "./hooks/useCurrentUser";
import useReactPath from "./hooks/useReactPath";
import AuthCluster from "./components/AuthCluster";
import Mint from './components/Mint';
import Haikus from './components/Haikus';
import { getFindProfile, getHaikus, getUserHaikus } from './cadence/scripts';
import { FEATURED_ADDRESS } from "./config";

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      '"Courier New"',
      'courier',
      'monospace'
    ].join(','),
    h6: {
      textAlign: "center",
      textDecoration: "underline",
      fontSize: "1rem",
      fontWeight: "bold"
    },
    h4: {
      marginBottom: "1rem",
      textDecoration: "underline"
    },
    body2: {
      textAlign: "center",
      whiteSpace: "pre",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }
  },
  shape: {
    borderRadius: 32
  }
});

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center"
  },
  alert: {
    flexDirection: "row"
  },
  title: {
    color: "black",
    textDecoration: "underline",
    cursor: "pointer"
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    display: "inline-block",
    verticalAlign: "middle"
  },
}));

const featuredHaikuAddresses = [
  { key: 189, value: "0x002c479c5c9eb30f" }, // papavader's
  { key: 40, value: FEATURED_ADDRESS },
  { key: 221, value: "0x5f563944d3f15ed7" }, // slackhash's
  { key: 29, value: FEATURED_ADDRESS },
  { key: 199, value: "0xcd642845e5f48fdd" }, // xu's
  { key: 0, value: FEATURED_ADDRESS },
  { key: 4, value: FEATURED_ADDRESS },
  { key: 5, value: FEATURED_ADDRESS },
  { key: 180, value: "0x877538e6851faa5d" }, // mrpowergage's
  { key: 28, value: FEATURED_ADDRESS },
  { key: 41, value: FEATURED_ADDRESS },
  { key: 900, value: "0xc038de0c5f2cb2d4" }, // Doesn't exist test
  { key: 240, value: "0x3a7a2af28d43354b" } // bigedude's
]
const featuredOrder = [189, 40, 221, 240, 29, 199, 0, 4, 5, 180, 28, 41];

function App() {
  const classes = useStyles();
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [typingEnd, setTypingEnd] = useState(false);
  const { userHaikus } = useCurrentUser();

  const [featuredHaikus, setFeaturedHaikus] = useState({});
  const path = useReactPath();
  const [linkedHaiku, setLinkedHaiku] = useState(null);
  const [linkedHaikuHeader, setLinkedHaikuHeader] = useState(null);

  const handleErrorClose = () => setSnackbarOpen(false);

  useEffect(() => {
    if (error !== null) {
      setSnackbarOpen(true);
    }
  }, [error]);

  useEffect(() => {
    async function getText(onlyContractAddress) {
      const requestedHaikus = [];
      for (const haiku of featuredHaikuAddresses) {
        if (!onlyContractAddress || haiku.value === FEATURED_ADDRESS) {
          requestedHaikus.push(haiku);
        }
      }
      setFeaturedHaikus(await getHaikus(requestedHaikus));
    }

    async function tryGetText() {
      // Fallback in case someone moves their bitku before mainnet is updated
      try {
        await getText(false);
      } catch {
        await getText(true)
      }
    }

    tryGetText();
  }, []);

  useEffect(() => {
    async function getText() {
      const urlParts = path.replace("#", "").split("/");

      if (urlParts.length < 1) {
        setLinkedHaikuHeader(null);
        return;
      }

      let address = urlParts[0];
      let header = address;

      // Try to link to a find profile
      try {
        const findProfile = await getFindProfile(address);
        if (findProfile) {
          address = findProfile.address;
          header = <a href={`https://find.xyz/${findProfile.findName}`} target="_blank" rel="noreferrer">
            <span style={{ display: "inline-block" }}>
              <Avatar alt={`${findProfile.findName}.find`} src={findProfile.avatar} className={classes.avatar} />
              <span style={{ textDecoration: "underline" }}>{findProfile.name}</span>
            </span>
          </a>;
        }
      } catch { }

      if (address !== "") {
        if (urlParts.length === 1) {
          try {
            setLinkedHaiku(await getUserHaikus({ addr: address }));
            setLinkedHaikuHeader(header);
            return;
          } catch { }
        } else {
          try {
            const haikuID = parseInt(urlParts[1]);
            const haikus = await getHaikus([{ key: haikuID, value: address }]);
            if (Object.keys(haikus).length > 0) {
              setLinkedHaiku(haikus);
              setLinkedHaikuHeader(haikuID);
              return;
            }
          } catch { }
        }
      }

      setLinkedHaiku(null);
      setLinkedHaikuHeader(null);
    }

    getText();
  }, [path]);

  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <AuthCluster setError={setError} />
          <Container>
            <Typography variant="h1" className={classes.title} onClick={() => {
              window.history.pushState(null, "Bitku", "/");
              const popStateEvent = new PopStateEvent('popstate');
              dispatchEvent(popStateEvent);
            }}>
              <TypeWriter
                typing={1}
                onTypingEnd={() => setTypingEnd(true)}
              >
                Bitku
              </TypeWriter>
            </Typography>
            {typingEnd &&
              <React.Fragment>
                <Mint setError={setError} />
                {linkedHaikuHeader !== null && linkedHaiku && <Haikus haikus={linkedHaiku} heading={linkedHaikuHeader} />}
                <Haikus haikus={featuredHaikus} order={featuredOrder} heading="Featured" />
                <Haikus haikus={userHaikus} heading="My Bitku" userHaikus={true} setError={setError} />
              </React.Fragment>
            }
            {error &&
              <Snackbar open={snackbarOpen} autoHideDuration={10000} onClose={handleErrorClose}>
                <Alert onClose={handleErrorClose} severity={error.severity} className={classes.alert}>
                  {error.text}
                </Alert>
              </Snackbar>
            }
          </Container>
        </div>
      </ThemeProvider>
    </React.Fragment >
  );
}

export default App;
