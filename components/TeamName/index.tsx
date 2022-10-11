import React from "react";
import { ITeamName } from "../../pages";

import styles from "../../styles/Home.module.scss";
import { Container } from "./styles";

interface Props {
  isSelected: (team: ITeamName) => boolean;
  toggleSelection: (team: ITeamName) => void;
  teamName: ITeamName;
  getNames: () => void;
  getPercentage: (votes: number) => string | 0;
}

export const TeamName = ({
  isSelected,
  teamName,
  toggleSelection,
  getNames,
  getPercentage,
}: Props) => {
  return (
    <Container
      percentage={+getPercentage(teamName.votes)}
      className={`styles.teamName ${isSelected(teamName) && "selected"}`}
      onClick={() => {
        toggleSelection(teamName);
        setTimeout(() => {
          getNames();
        }, 50);
      }}
    >
      <div>{teamName.name}</div>
      <div>{getPercentage(teamName.votes)}%</div>
    </Container>
  );
};
