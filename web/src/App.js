import React, {useState, useEffect} from "react";
import './App.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { Typography } from "@material-ui/core";
import Container from '@material-ui/core/Container';
import TypeWriter from 'react-typewriter';



import {useCurrentUser} from "./hooks/useCurrentUser";
import AuthCluster from "./components/AuthCluster";
import Mint from './components/Mint';
import Haikus from './components/Haikus';
import {getHaiku} from './cadence/scripts';

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
}));


function App() {
  const classes = useStyles();
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [typingEnd, setTypingEnd] = useState(false);
  const {userHaikus} = useCurrentUser();
  const featuredAddress = "0xf8d6e0586b0a20c7";
  const featuredIds = [15, 7, 16, 19, 9, 42, 1, 63];
  const [featuredHaikus, setFeaturedHaikus] = useState({});

  const handleErrorClose = () => setSnackbarOpen(false);

  useEffect(() => {
    if (error !== null) {
      setSnackbarOpen(true);
    }
  }, [error]);

  useEffect(() => {
    async function getText() {
      const haikus = {};
    
      for (const id of featuredIds) {
        haikus[id] = null;
      }

      setFeaturedHaikus(haikus);

      for (const id of featuredIds) {
        try {
          const text = await getHaiku(featuredAddress, id);
          haikus[id] = text;
          setFeaturedHaikus({...haikus});
        } catch {}
      }

    }

    getText();
  }, []);

  return (
    <React.Fragment>
      <CssBaseline/>
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <AuthCluster/>
          <Container>
            <Typography variant="h1">
              <TypeWriter 
                typing={1}
                onTypingEnd={() => setTypingEnd(true)}
              >
                Bitku
              </TypeWriter>
            </Typography>
            {typingEnd &&
              <React.Fragment>
                <Mint setError={setError}/>
                <Haikus haikus={featuredHaikus} order={featuredIds} heading="Featured"/>
                <Haikus haikus={userHaikus} heading="My Bitku"/>
              </React.Fragment>
            }
            <Snackbar open={snackbarOpen} autoHideDuration={10000} onClose={handleErrorClose}>
              <Alert onClose={handleErrorClose} severity="error">
                {error}
              </Alert>
            </Snackbar>
          </Container>
        </div>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;
