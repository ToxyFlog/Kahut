import { useRef, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { gql, useMutation } from '@apollo/client';
import Game from '../../types/game';
import Question from '../../types/question';
import useDebounce from '../../hooks/useDebounce';
import useWarning from '../../hooks/useWarning';
import Header from '../../components/Header';
import GeneralInfo from '../../components/editGame/GeneralInfo';
import Questions from '../../components/editGame/Questions';
import DeleteGameButton from '../../components/editGame/DeleteGameButton';
import createApolloClient from '../../graphql/apolloClient';
import { getCookie } from '../../utils/cookies';
import { areGamesEqual, areQuestionsEqual } from '../../utils/compareTypes';

const GET_GAME = gql`
    query getGame($id: String!) {
        getGame(id: $id) {
            image
            title
            description
            id
            questions {
                id
                index
                title
                image
                type
                time
                choices
                answers
            }
        }
    }
`;

const CAN_EDIT_GAME = gql`
    query canEditGame($id: String!, $token: String!) {
        canEditGame(id: $id, token: $token)
    }
`;

const EDIT_GAME = gql`
    mutation editGame($game: GameInfo!, $token: String!) {
        editGame(game: $game, token: $token)
    }
`;

const EDIT_QUESTION = gql`
    mutation editQuestion($question: IQuestion!, $token: String!, $id: String!) {
        editQuestion(token: $token, question: $question, id: $id)
    }
`;

const DELETE_QUESTION = gql`
    mutation deleteQuestion($question_id: String!, $game_id: String!, $token: String!) {
        deleteQuestion(token: $token, question_id: $question_id, game_id: $game_id)
    }
`;

type Props = {
    game: Game;
    isNew: boolean;
};

const EditGame: NextPage<Props> = ({ game: _game, isNew }) => {
    const setIsSafeToLeave = useWarning('You have unsaved changes!');

    const [editGame] = useMutation(EDIT_GAME);
    const [editQuestion] = useMutation(EDIT_QUESTION);
    const [deleteQuestion] = useMutation(DELETE_QUESTION);

    const previousGameRef = useRef<Game | undefined>(isNew ? undefined : _game);
    const [game, _setGame] = useState(_game);
    const setGame = useDebounce<Game>(
        async game => {
            const previousGame = previousGameRef.current;
            const token = getCookie('token');

            if (game.image && previousGame?.image !== game.image) {
                const response = await fetch(`${location.origin}/api/uploadImage`, { method: 'POST', body: game.image });
                const { url } = await response.json();
                game.image = url;
            }

            if (!areGamesEqual(previousGame, game)) await editGame({ variables: { token, game: { ...game, questions: undefined, __typename: undefined } } });

            const idToQuestion: { [key: string]: Question } = {};
            if (previousGame?.questions) previousGame.questions.forEach(question => (idToQuestion[question.id] = question));

            await Promise.all(
                game.questions
                    .filter(question => {
                        const areEqual = areQuestionsEqual(idToQuestion[question.id], question);
                        delete idToQuestion[question.id];

                        return !areEqual;
                    })
                    .map(question => editQuestion({ variables: { token, question: { ...question, __typename: undefined }, id: game.id } }))
            );

            const deletedQuestions = Object.values(idToQuestion);
            await Promise.all(deletedQuestions.map(({ id }) => deleteQuestion({ variables: { token, question_id: id, game_id: game.id } })));

            previousGameRef.current = game;
            setIsSafeToLeave(true);
        },
        (_, current) => {
            setIsSafeToLeave(false);
            _setGame(current);
            return current;
        },
        500
    );

    return (
        <div style={{ padding: '0 20px' }}>
            <Header />
            <GeneralInfo game={game} setGame={setGame} />
            <Questions game={game} setGame={setGame} />
            {previousGameRef.current && <DeleteGameButton gameId={game.id} />}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ query, req }) => {
    const { id } = query;
    const token: string | undefined = req.cookies.token;
    if (typeof id !== 'string' || !token) return { notFound: true };

    const apollo = createApolloClient();

    const canEditGameResponse = await apollo.query({ query: CAN_EDIT_GAME, variables: { id, token } });
    if (!canEditGameResponse.data.canEditGame) return { notFound: true };

    const getGameResponse = await apollo.query({ query: GET_GAME, variables: { id } });
    const game: Game = getGameResponse.data.getGame;
    if (game) return { props: { game, isNew: false } };

    const DEFAULT_GAME: Game = { title: 'New game', description: '', id, questions: [] };
    return { props: { game: DEFAULT_GAME, isNew: true } };
};

export default EditGame;
