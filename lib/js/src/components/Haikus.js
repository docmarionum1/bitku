import React, { useState } from "react"

import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';

import { sendBitkuTransaction } from "../cadence/transactions";
import useCurrentUser from "../hooks/useCurrentUser";

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(4),
  },
  paper: {
    //width: "fit-content",
    padding: theme.spacing(2),
    borderRadius: theme.spacing(.5),
    height: '12em',
    display: "flex",
    flexDirection: "column",
  },
  menuContainer: {
    display: "flex",
    justifyContent: "space-between",
    height: "10px",
  },
  iconButton: {
    '&:hover': {
      backgroundColor: "rgba(0, 0, 0, 0)"
    },
    color: "rgba(0, 0, 0, .4)",
    padding: 0
  },
  sendDialog: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    margin: -theme.spacing(.75)
  },
  heading: {
    "& > *": { color: "black" }
  }
}));

export function Haikus({ haikus, heading, order, userHaikus = false, setError = () => { } }) {
  const classes = useStyles();
  const { user, setUserHaikus } = useCurrentUser();

  const ids = order ? order : haikus ? Object.keys(haikus) : [];

  const [menuAnchor, setMenuAnchor] = useState({ el: null, haiku: null });
  const handleCloseMenu = () => {
    setMenuAnchor({ el: null, haiku: null });
  };

  const [sendDialog, setSendDialog] = useState({ open: false, haiku: null });
  const handleCloseDialog = () => {
    setSendDialog({ open: false, haiku: null });
    setSendAddress("");
  };
  const [sendAddress, setSendAddress] = useState("");

  const sendDisabled = !sendAddress.match(/^0x[a-zA-Z0-9]{16}$/) || sendAddress === user.addr;

  return (
    <div className={classes.root}>
      <Typography variant="h4" className={classes.heading}>{heading}</Typography>
      <Grid container spacing={3} justifyContent="center">
        {haikus && ids.map((id) => (
          haikus[id] &&
          <Grid item xs={12} sm={6} md={6} lg={4} key={id}>
            <Paper elevation={3} className={classes.paper}>
              <div className={classes.menuContainer}>
                {haikus[id].findName ?
                  <a href={`https://find.xyz/${haikus[id].findName}`} target="_blank" rel="noreferrer">
                    <Avatar alt={`${haikus[id].findName}.find`} src={haikus[id].findAvatar} className={classes.avatar} />
                  </a> : <span />
                }
                <IconButton className={classes.iconButton} onClick={(event) => {
                  setMenuAnchor({ el: event.currentTarget, haiku: id });
                }}>
                  <MenuIcon />
                </IconButton>
              </div>
              <Typography variant="h6">{id}</Typography>
              <Typography variant="body2">{haikus[id].text}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Menu
        anchorEl={menuAnchor.el}
        keepMounted
        open={!!menuAnchor.el}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          navigator.clipboard.writeText(
            `${window.location.host}/#${haikus[menuAnchor.haiku].address}/${menuAnchor.haiku}`
          );
          handleCloseMenu();
        }}>Copy link</MenuItem>
        {userHaikus && <MenuItem onClick={() => {
          setSendDialog({ open: true, haiku: menuAnchor.haiku });
          handleCloseMenu();
        }}>Send Bitku #{menuAnchor.haiku} to Another Address</MenuItem>}
      </Menu>
      {userHaikus &&
        <Dialog
          open={!!sendDialog.open}
          onClose={handleCloseDialog}
        >
          <DialogTitle><Typography variant="h5">Send Bitku #{sendDialog.haiku} to another address</Typography></DialogTitle>
          <DialogContent className={classes.sendDialog}>
            <Typography style={{ fontStyle: "italic" }}>
              Ensure that the address has a Bitku collection.
            </Typography>
            <Typography style={{ fontStyle: "italic", marginBottom: "20px" }}>
              <a href="https://github.com/docmarionum1/bitku#how-to-send-a-bitku-to-another-account" target="_blank" rel="noreferrer">
                Instructions
              </a>
            </Typography>
            <TextField
              label="0xaddress"
              variant="outlined"
              value={sendAddress}
              onChange={(event) => setSendAddress(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleCloseDialog} color="secondary" variant="outlined">Cancel</Button>
            <Button variant="outlined" disabled={sendDisabled} onClick={async () => {
              handleCloseDialog();
              try {
                await sendBitkuTransaction(sendDialog.haiku, sendAddress, setError);
                setUserHaikus((haikus) => {
                  const newHaikus = { ...haikus };
                  delete newHaikus[sendDialog.haiku];
                  return newHaikus;
                });
              } catch (e) {
                setError({ text: e.message ? e.message : e, severity: "error" });
              }
            }}>Send</Button>
          </DialogActions>
        </Dialog>
      }
    </div>
  );
}

export default Haikus;