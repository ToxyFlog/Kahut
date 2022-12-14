// taken from https://loading.io/

import React, { FunctionComponent } from 'react';
import styled, { keyframes } from 'styled-components';
import { color } from '../styles/theme';

const Container = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    background: ${color('black0')};
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const Text = styled.p`
    font-size: 24px;
    font-weight: 200;
    color: ${color('white1')};
    margin: 20px 0;
    text-align: center;
`;

const Spinning = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

const SpinnerContainer = styled.div`
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;

    & div {
        animation: ${Spinning} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        transform-origin: 40px 40px;
    }

    & div:after {
        content: ' ';
        display: block;
        position: absolute;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: ${color('white0')};
        margin: -4px 0 0 -4px;
    }

    & div:nth-child(1) {
        animation-delay: -0.036s;
    }

    & div:nth-child(1):after {
        top: 63px;
        left: 63px;
    }

    & div:nth-child(2) {
        animation-delay: -0.072s;
    }

    & div:nth-child(2):after {
        top: 68px;
        left: 56px;
    }

    & div:nth-child(3) {
        animation-delay: -0.108s;
    }

    & div:nth-child(3):after {
        top: 71px;
        left: 48px;
    }

    & div:nth-child(4) {
        animation-delay: -0.144s;
    }

    & div:nth-child(4):after {
        top: 72px;
        left: 40px;
    }

    & div:nth-child(5) {
        animation-delay: -0.18s;
    }

    & div:nth-child(5):after {
        top: 71px;
        left: 32px;
    }

    & div:nth-child(6) {
        animation-delay: -0.216s;
    }

    & div:nth-child(6):after {
        top: 68px;
        left: 24px;
    }

    & div:nth-child(7) {
        animation-delay: -0.252s;
    }

    & div:nth-child(7):after {
        top: 63px;
        left: 17px;
    }

    & div:nth-child(8) {
        animation-delay: -0.288s;
    }

    & div:nth-child(8):after {
        top: 56px;
        left: 12px;
    }
`;

const Spinner = () => (
    <SpinnerContainer>
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
    </SpinnerContainer>
);

const Loading: FunctionComponent<{ children: string }> = ({ children }) => (
    <Container>
        <Spinner />
        <Text>{children}</Text>
    </Container>
);

export default Loading;
