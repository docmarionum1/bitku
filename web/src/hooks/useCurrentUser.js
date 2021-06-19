import React, {useCallback, useEffect, useState, useContext} from "react";
import * as fcl from "@onflow/fcl";
import {getBalance, getUserHaikus} from "../cadence/scripts";

const UserStateContext = React.createContext();

export function UserStateProvider({children}) {
  const [balance, setBalance] = useState(0);
  const [userHaikus, setUserHaikus] = useState({});

  return <UserStateContext.Provider value={{balance, setBalance, userHaikus, setUserHaikus}} children={children} />
}

export function useCurrentUser() {
  const [user, setUser] = useState({loggedIn: null});
  const {balance, setBalance, userHaikus, setUserHaikus} = useContext(UserStateContext);

  useEffect(() => fcl.currentUser().subscribe(setUser), []);

  const updateBalance = useCallback(async () => {
    const balance = await getBalance(user);
    setBalance(balance);
  }, [user]);

  useEffect(() => {
    if (user.loggedIn)  {
      updateBalance();
    } else {
      setBalance(0);
    }
  }, [user]);

  useEffect(() => {
    async function getHaikus() {
      try {
        const haikus = await getUserHaikus(user);
        setUserHaikus(haikus);
      } catch {}
    }

    if (user.loggedIn) {
      getHaikus();
    } else {
      setUserHaikus({});
    }
  }, [user]);
  
  return {user, balance, updateBalance, userHaikus, setUserHaikus};
}

export default useCurrentUser;