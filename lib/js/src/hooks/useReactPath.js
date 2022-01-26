// https://stackoverflow.com/a/58443076
import React from "react";

const useReactPath = () => {
  const [path, setPath] = React.useState(window.location.hash);
  const listenToPopstate = () => {
    const winPath = window.location.hash;
    setPath(winPath);
  };
  React.useEffect(() => {
    window.addEventListener("popstate", listenToPopstate);
    return () => {
      window.removeEventListener("popstate", listenToPopstate);
    };
  }, []);
  return path;
};

export default useReactPath;