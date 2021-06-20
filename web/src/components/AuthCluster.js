// File: ./src/auth-cluster.js

import React, {useState, useEffect} from "react"
import * as fcl from "@onflow/fcl"
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

import useCurrentUser from "../hooks/useCurrentUser";

const useStyles = makeStyles(theme => ({
  root: {
    // position: "absolute",
    // top: theme.spacing(1),
    // right: theme.spacing(1)
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1)
  },
  button: {
    
  },
  about: {
    color: "black"
  }
}))

export function AuthCluster() {
  const classes = useStyles();
  const {user, balance} = useCurrentUser();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleClose = () => {
    setMenuAnchor(null);
  }

  return (
    <div className={classes.root}>
      <Typography variant="h5"><a href="https://github.com/docmarionum1/bitku#readme" target="_blank" className={classes.about}>About</a></Typography>
      {user.loggedIn ?
        <React.Fragment>
          <div>
            <Button variant="outlined" onClick={(event) => {setMenuAnchor(event.currentTarget)}}>{user.addr}</Button>
          </div> 
          <Menu
            anchorEl={menuAnchor}
            keepMounted
            open={!!menuAnchor}
            onClose={handleClose}
          >
            <MenuItem disabled>₣{balance} FLOW</MenuItem>
            <MenuItem onClick={() => {
              handleClose();
              fcl.unauthenticate();
            }}>Log Out</MenuItem>
          </Menu>
        </React.Fragment> :
        <div>
          <Button variant="outlined" onClick={fcl.logIn}>Connect Wallet</Button>
        </div>
        }
    </div>
  );

  if (user.loggedIn) {
    return (
      <div>
        <span>{user?.addr ?? "No Address"}</span>
        <span>₣{balance} FLOW</span>
        <Button onClick={fcl.unauthenticate}>Log Out</Button>
      </div>
    )
  } else {
    return (
      <div>
        <Button onClick={fcl.logIn}>Log In</Button>
      </div>
    )
  }
}

export default AuthCluster;