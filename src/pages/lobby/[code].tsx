import { useEffect, useRef, useState } from 'react';
import { gql, useSubscription } from '@apollo/client';
import { GetServerSideProps, NextPage } from 'next';
import jwt from 'jsonwebtoken';
import Loading from '../../components/Loading';
import Lobby from '../../components/game/Lobby';
import GameStart from '../../components/game/GameStart';
import QuestionPage from '../../components/game/QuestionPage';
import AnswerPage from '../../components/game/AnswerPage';
import GameEnd from '../../components/game/GameEnd';
import GameTokenData from '../../types/gameTokenData';
import Question from '../../types/question';
import createApolloClient from '../../graphql/apolloClient';

const GET_LOBBY_INFO = gql`
    query getLobbyInfo($game_token: String!) {
        getLobby(game_token: $game_token) {
            players
            state
        }
    }
`;

const GAME_SUBSCRIPTION = gql`
    subscription gameSubscription($game_token: String!) {
        onGameEvent(game_token: $game_token) {
            event
            data
        }
    }
`;

export type StartGameData = {
    title: string;
    image: string;
};

export type ShowQuestionData = Omit<Question, 'answers'>;

export type ShowAnswerData = {
    question: Question;
    points: [{ username: string; score: number }];
};

export type EndGameData = {
    results: { username: string; answers: number; score: number }[];
    questions: number;
};

const parseEvent = (subscriptionData: { onGameEvent: { event: string; data: string } }) => {
    if (!subscriptionData || !subscriptionData.onGameEvent) return { idle: true };

    const gameEvent = subscriptionData.onGameEvent;
    const data = JSON.parse(gameEvent.data);

    switch (gameEvent.event) {
        case 'PLAYER_JOINING':
            return { playerJoining: data };
        case 'START_GAME':
            return { startGame: data };
        case 'SHOW_QUESTION':
            return { showQuestion: data };
        case 'SHOW_ANSWER':
            return { showAnswer: data };
        case 'END_GAME':
            return { endGame: data };
        default:
            return {};
    }
};

export type GamePageProps = {
    gameToken: string;
    gameData: GameTokenData;
};

type Props = {
    gameToken: string;
    lobbyState: string;
    players: string[];
};

const Game: NextPage<Props> = ({ gameToken, players: _players, lobbyState: _lobbyState }) => {
    const gameData = jwt.decode(gameToken) as GameTokenData;

    const { data } = useSubscription(GAME_SUBSCRIPTION, { variables: { game_token: gameToken } });
    const { playerJoining, startGame, showQuestion, showAnswer, endGame } = parseEvent(data);

    const [lobbyState, setLobbyState] = useState(_lobbyState);
    const [players, setPlayers] = useState(_players);
    const lastPlayerRef = useRef('');

    useEffect(() => {
        if (!playerJoining) return;
        const player = playerJoining.player;

        if (player === lastPlayerRef.current) return;
        lastPlayerRef.current = player;

        setPlayers([...players, player]);
    }, [playerJoining]);

    useEffect(() => {
        if (startGame) setLobbyState('INGAME');
        if (endGame) setLobbyState('CLOSED');
    }, [endGame, startGame]);

    if (lobbyState === 'OPEN') return <Lobby players={players} gameToken={gameToken} gameData={gameData} />;
    if (startGame) return <GameStart {...startGame} />;
    if (showQuestion) return <QuestionPage {...showQuestion} gameToken={gameToken} gameData={gameData} />;
    if (showAnswer) return <AnswerPage {...showAnswer} gameToken={gameToken} gameData={gameData} />;
    if (endGame || lobbyState === 'CLOSED') return <GameEnd {...endGame} gameToken={gameToken} gameData={gameData} />;

    return <Loading>Waiting for the next question...</Loading>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const gameToken = req?.cookies?.game_token;
    if (!gameToken || (jwt.decode(gameToken) as GameTokenData).code !== query.code) return { notFound: true };

    const apollo = createApolloClient();

    const { data } = await apollo.query({ query: GET_LOBBY_INFO, variables: { game_token: gameToken } });
    if (!data.getLobby) return { notFound: true };

    const lobbyState = data.getLobby.state;
    if (lobbyState === 'CLOSED') return { notFound: true };

    return { props: { gameToken, players: data.getLobby.players, lobbyState } };
};

export default Game;
