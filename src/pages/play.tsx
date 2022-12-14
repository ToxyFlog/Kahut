import { useContext, useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { gql, useMutation } from '@apollo/client';
import jwt from 'jsonwebtoken';
import StyledInput from '../components/BoxInput';
import Header from '../components/Header';
import StyledButton from '../components/Button';
import { color } from '../styles/theme';
import { AuthContext } from '../providers/GoogleAuthProvider';
import { setCookie } from '../utils/cookies';
import GameTokenData from '../types/gameTokenData';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    align-items: center;
    justify-content: center;
`;

const Title = styled.h1`
    font-size: 60px;
    font-weight: 600;
    font-style: italic;
    color: ${color('white0')};
    margin-bottom: 10px;
`;

const Input = styled(StyledInput)`
    margin: 3px 0;
    width: 30vw;
    min-width: 300px;
    background: ${color('black3')};
    padding: 6px 16px;
    font-size: 18px;
    text-align: center;
`;

const ErrorMessage = styled.p`
    font-size: 14px;
    color: ${color('red')};
`;

const Button = styled(StyledButton)`
    min-width: 200px;
    width: 20vw;
    margin: 10px 0;
`;

const JOIN_LOBBY = gql`
    mutation joinLobby($username: String!, $code: String!) {
        joinLobby(username: $username, code: $code) {
            token
            error
        }
    }
`;

const Play: NextPage = () => {
    const [joinLobby] = useMutation(JOIN_LOBBY);
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [code, setCode] = useState(router.query.code || '');
    const [username, setUsername] = useState(user?.name || '');
    const [errorMessage, setErrorMessage] = useState('');
    const timeout = useRef<NodeJS.Timeout>();

    const showError = (message: string) => {
        setErrorMessage(message);

        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setErrorMessage(''), 3000);
    };

    useEffect(() => () => timeout.current && clearTimeout(timeout.current), []);

    const joinGame = async () => {
        if (code.length !== 6) return;
        if (username.length === 0) return showError("Username can't be empty!");
        if (username.length > 30) return showError("Username can't be longer than 30!");

        const { data } = await joinLobby({ variables: { username, code } });

        const { token, error } = data.joinLobby;
        if (error) return showError(error);

        const { exp } = jwt.decode(token) as GameTokenData;
        setCookie('game_token', token, new Date(exp * 1000).toUTCString());
        router.push(`/lobby/${code}`);
    };

    return (
        <Container>
            <Header />
            <Title>Kahut!</Title>
            <Input placeholder="Username" value={username} onChange={event => setUsername(event.target.value)} maxLength={30} />
            <Input placeholder="Code" value={code} onChange={event => setCode(event.target.value.toUpperCase())} maxLength={6} />
            <ErrorMessage>{errorMessage}</ErrorMessage>
            <Button onClick={joinGame}>Join</Button>
        </Container>
    );
};

export default Play;
