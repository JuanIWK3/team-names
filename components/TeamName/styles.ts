import styled from "styled-components";

interface Props {
  percentage: number;
}

export const Container = styled.div<Props>`
  border: 1px solid #eee;
  cursor: pointer;
  padding: 16px;
  position: relative;
  z-index: 0;
  width: 100%;
  color: #333;

  &.selected {
    border: 1px solid lightblue;

    &:after {
      background: #00ffff;
    }
  }

  &::after {
    content: "";
    width: ${(props) => props.percentage || 0}%;
    height: 100%;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    transition: all 0.3s ease-in-out;

    background: #ddd;
  }
`;
