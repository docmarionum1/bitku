import React, { useState, useEffect } from "react";
import './App.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { Typography } from "@material-ui/core";
import Container from '@material-ui/core/Container';
import TypeWriter from 'react-typewriter';



import { useCurrentUser } from "./hooks/useCurrentUser";
import AuthCluster from "./components/AuthCluster";
import Mint from './components/Mint';
import Haikus from './components/Haikus';
import { getHaikus } from './cadence/scripts';
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
  }
}));


function App() {
  const classes = useStyles();
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [typingEnd, setTypingEnd] = useState(false);
  const { userHaikus } = useCurrentUser();
  const featuredAddress = FEATURED_ADDRESS;
  const featuredIds = [40, 29, 0, 4, 5, 28, 41, 62];
  const [featuredHaikus, setFeaturedHaikus] = useState({});

  const handleErrorClose = () => setSnackbarOpen(false);

  useEffect(() => {
    if (error !== null) {
      setSnackbarOpen(true);
    }
  }, [error]);

  useEffect(() => {
    async function getText() {
      const requestedHaikus = [];
      for (const id of featuredIds) {
        requestedHaikus.push({ key: id, value: featuredAddress });
      }

      setFeaturedHaikus(await getHaikus(requestedHaikus));
    }

    getText();
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <AuthCluster setError={setError} />
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
                <Mint setError={setError} />
                <Haikus haikus={featuredHaikus} order={featuredIds} heading="Featured" />
                <Haikus haikus={userHaikus} heading="My Bitku" />
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
