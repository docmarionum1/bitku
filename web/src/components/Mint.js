import React, {useState, useEffect, useCallback} from "react"

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TypeWriter from 'react-typewriter';


import {getHaikus, getNextIDAndPrice} from "../cadence/scripts";
import {mintHaikuTransaction} from "../cadence/transactions";
import useCurrentUser from "../hooks/useCurrentUser";

const useStyles = makeStyles(theme => ({
  root: {
    height: "20rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  popper: {
    top: '10px !important'
  },
  tooltip: {
    fontSize: '1rem',
    maxWidth: 'none',
  }
}));

export function Mint({setError}) {
  const classes = useStyles();

  const [nextHaiku, setNextHaiku] = useState(null);
  const [loading, setLoading] = useState(true);
  const [haiku, setHaiku] = useState(null);
  const {user, balance, updateBalance, setUserHaikus} = useCurrentUser();

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
      const response = await getHaikus({key: nextHaiku.id, value: user.addr});
      const text = response[Object.keys(response)[0]];

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
  }, [user, nextHaiku]);

  if (loading) {
    return (
      <div className="spinner" id="spinner">
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
      </div>
    );
  }

  const mintingDisabled = !user.loggedIn || nextHaiku === null || balance === null || balance < nextHaiku.price;
  let tooltipTitle = `Mint Bitku #${nextHaiku.id} for ${nextHaiku.price} FUSD`;

  if (!user.loggedIn) {
    tooltipTitle = "To mint a Bitku, please connect your wallet using the menu in the top right";
  } else if (balance === null) {
    tooltipTitle = "To mint a Bitku, please enable FUSD for your wallet using the menu in the top right";
  } else if (balance < nextHaiku.price) {
    tooltipTitle = "You don't have enough FUSD";
  } else if (nextHaiku === null) {
    tooltipTitle = "No Bitkus remaining";
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
        <Tooltip classes={{popper: classes.popper, tooltip: classes.tooltip}} title={tooltipTitle} open={mintingDisabled} placement="bottom" arrow>
          <span>
            <Button variant="outlined" disabled={mintingDisabled} onClick={mintHaiku}>
                Mint Bitku #{nextHaiku.id}/1024 ({nextHaiku.price} FUSD)
            </Button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}

export default Mint;