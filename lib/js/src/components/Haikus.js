import React, { useState, useEffect } from "react"

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import Skeleton from '@material-ui/lab/Skeleton';


const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(4)
  },
  paper: {
    //width: "fit-content",
    padding: theme.spacing(2),
    borderRadius: theme.spacing(.5),
    height: '12em',
    display: "flex",
    flexDirection: "column",
  },
  skeletonContainer: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "center"
  },
  skeleton: {
    margin: "auto"
  }
}));

export function Haikus({ haikus, heading, order }) {
  const classes = useStyles();

  const ids = order ? order : Object.keys(haikus);

  return (
    <div className={classes.root}>
      <Typography variant="h4">{heading}</Typography>
      <Grid container spacing={3}>
        {haikus && ids.map((id) => (
          haikus[id] &&
          <Grid item xs={12} sm={6} md={6} lg={4} key={id}>
            <Paper elevation={3} className={classes.paper}>
              <Typography variant="h6">{id}</Typography>
              <Typography variant="body2">{haikus[id]}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Haikus;