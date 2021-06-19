import React, {useState, useEffect, useCallback} from "react"

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TypeWriter from 'react-typewriter';


import {getHaiku, getNextIDAndPrice} from "../cadence/scripts";
import {mintHaikuTransaction} from "../cadence/transactions";
import useCurrentUser from "../hooks/useCurrentUser";

const useStyles = makeStyles(theme => ({
  root: {
    height: "20rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly"
  }
}));

export function Mint({setError}) {
  const classes = useStyles();

  const [nextHaiku, setNextHaiku] = useState(null);
  const [loading, setLoading] = useState(true);
  const [haiku, setHaiku] = useState(null);
  const {user, updateBalance, setUserHaikus} = useCurrentUser();

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setNextHaiku(await getNextIDAndPrice());
      setLoading(false);
    }

    if (nextHaiku === null) {
      fetch();
    }
  }, [nextHaiku]);

  useEffect(() => {
    if (!user.loggedIn) {
      setHaiku(null);
    }
  }, [user]);

  const mintHaiku = useCallback(async () => {
    setLoading(true);
    try {
      // Mint the new haiku and get the text
      await mintHaikuTransaction(nextHaiku);
      window.scrollTo(0, 0);
      const text = await getHaiku(user.addr, nextHaiku.id);

      // Update the newly minted haiku component
      setHaiku({
        id: nextHaiku.id,
        text: text,
      });

      // Add it to the user's list of haiku
      setUserHaikus((haikus) => {
        return {...haikus, [nextHaiku.id]: text};
      });

      setNextHaiku(null);
      updateBalance();
    } catch (e) {
      if (e !== "Declined: Externally Halted") {
        setError(e);
      }
      setNextHaiku(null);
    }
  }, [user, nextHaiku])

  if (loading) {
    return (
      <div className="spinner" id="spinner">
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {haiku &&
        <div>
          <Typography variant="h6">{haiku.id}</Typography>
          <Typography variant="body2"><TypeWriter typing={1} fixed={true}>{haiku.text}</TypeWriter></Typography>
        </div>
      }
      <div>
        <Button variant="outlined" disabled={!user.loggedIn || nextHaiku === null} onClick={mintHaiku}>
            Mint Bitku #{nextHaiku.id}/1024 (₣{nextHaiku.price} FLOW)
        </Button>
      </div>
    </div>
  );
}

export default Mint;