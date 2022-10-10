/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { useRouter } from "next/router";

import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { ITeamName, IVotedBy } from "../pages";

import { auth, db } from "../utils/firebase";

export interface IAuthContext {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  googleSignIn: () => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext<any>(AuthContext);
};

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const googleSignIn = async () => {
    const auth = getAuth();
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/");
    } catch (error) {}
    return;
  };

  const logout = () => {
    console.log("signed out");
    return signOut(auth);
  };

  const getTeamNames = async () => {
    const q = query(collection(db, "team_names"), orderBy("votes", "desc"));
    const querySnapshot = await getDocs(q);
    const teamNames: ITeamName[] = [];
    querySnapshot.forEach((teamName) => {
      teamNames.push({ ...teamName.data(), id: teamName.id } as ITeamName);
    });

    return teamNames;
  };

  const deleteTeamName = async (teamName: ITeamName) => {
    await deleteDoc(doc(db, "team_names", teamName.id));
  };

  const addTeamName = async (teamName: string) => {
    await addDoc(collection(db, "team_names"), {
      name: teamName,
      votes: 1,
      voted_by: [{ email: currentUser?.email, vote: 1 }],
      createdBy: currentUser?.email,
    });
  };

  const upVote = async (teamName: ITeamName) => {
    const teamNameRef = doc(db, "team_names", teamName.id);
    let upOrDown = "";
    let alreadyVoted = false;
    console.log(teamName);
    teamName.voted_by.forEach((t) => {
      if (t.email === currentUser?.email!) {
        alreadyVoted = true;
        if (t.vote === 1) {
          upOrDown = "up";
        } else {
          upOrDown = "down";
        }
        return;
      }
    });

    if (alreadyVoted) {
      if (upOrDown === "up") {
        console.log("already up voted");
      } else {
        console.log("down voted");
        teamName.voted_by.map((t) => {
          if (t.email === currentUser?.email!) {
            t.vote = 1;
          }
        });
        console.log(teamName.voted_by);
        await updateDoc(teamNameRef, {
          ...teamName,
          voted_by: [...teamName.voted_by],
          votes: teamName.votes + 1,
        });
      }
    } else {
      teamName.voted_by.push({
        email: currentUser?.email!,
        vote: 1,
      } as IVotedBy);
      await updateDoc(teamNameRef, {
        ...teamName,
        voted_by: teamName.voted_by,
        votes: teamName.votes + 1,
      });
    }
  };

  const downVote = async (teamName: ITeamName) => {};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (router.pathname === "/") {
        if (!user) {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    setCurrentUser,
    googleSignIn,
    loading,
    setLoading,
    logout,
    getTeamNames,
    addTeamName,
    upVote,
    downVote,
    deleteTeamName,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
