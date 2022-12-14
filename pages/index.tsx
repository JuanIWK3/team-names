import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/Home.module.scss";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { RiDeleteBack2Line } from "react-icons/ri";
import { TeamName } from "../components/TeamName";

export interface ITeamName {
  id: string;
  name: string;
  votes: number;
  voted_by: string[];
  createdBy: string;
}

const Home: NextPage = () => {
  const {
    logout,
    getTeamNames,
    addTeamName,
    currentUser,
    deleteTeamName,
    toggleSelection,
  } = useAuth();
  const [teamNames, setTeamNames] = useState<ITeamName[]>([]);
  const newTeamNameRef = useRef<HTMLInputElement | null>(null);
  const zero = 0;

  const total =
    teamNames.length > 0
      ? teamNames.reduce((acc, teamName) => acc + teamName.votes, zero)
      : 0;

  const getNames = useCallback(async () => {
    const names: ITeamName[] = await getTeamNames();

    setTeamNames(names);
  }, [getTeamNames]);

  const isSelected = (teamName: ITeamName) => {
    for (let email of teamName.voted_by) {
      if (email === currentUser?.email!) return true;
    }

    return false;
  };

  const getPercentage = (amount: number) => {
    if (amount === 0) return 0;

    return ((amount / total) * 100).toFixed(0);
  };

  useEffect(() => {
    getNames();
  }, [getNames]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Ideias</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!currentUser ? (
        <div>Loading...</div>
      ) : (
        <div className={styles.teamNames}>
          {teamNames.map((teamName, id) => (
            <div className={styles.teamWrapper} key={id}>
              <TeamName
                getNames={getNames}
                getPercentage={getPercentage}
                teamName={teamName}
                isSelected={isSelected}
                toggleSelection={toggleSelection}
              />
              {teamName.createdBy === currentUser?.email && (
                <button
                  className={styles.delete}
                  onClick={() => {
                    deleteTeamName(teamName);
                    getNames();
                  }}
                >
                  <RiDeleteBack2Line size={20} />
                </button>
              )}
            </div>
          ))}
          <div className={styles.newTeamName}>
            <input
              type="text"
              placeholder="Nova ideia"
              ref={newTeamNameRef}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  if (!newTeamNameRef.current?.value.length) return;
                  addTeamName(newTeamNameRef.current?.value);
                  getNames();
                  newTeamNameRef.current.value = "";
                }
              }}
            />
            <button
              className={styles.newButton}
              onClick={() => {
                if (!newTeamNameRef.current?.value.length) return;
                addTeamName(newTeamNameRef.current?.value);
                getNames();
                newTeamNameRef.current.value = "";
              }}
            >
              <MdOutlinePlaylistAdd />
            </button>
          </div>
        </div>
      )}

      <button onClick={logout} className="button is-warning mt-5">
        logout
      </button>
    </div>
  );
};

export default Home;
