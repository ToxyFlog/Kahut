import { FunctionComponent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { gql, useMutation } from '@apollo/client';
import { getCookie } from '../../utils/cookies';
import Button from '../Button';

const deleteGameMutation = gql`
    mutation deleteGame($id: String!, $token: String!) {
        deleteGame(id: $id, token: $token)
    }
`;

const CLICKS_TO_DELETE = 3;

const DeleteGameButton: FunctionComponent<{ gameId: string }> = ({ gameId }) => {
    const router = useRouter();
    const [deleteGame] = useMutation(deleteGameMutation);
    const [clickCounter, setClickcounter] = useState(CLICKS_TO_DELETE);

    useEffect(() => {
        if (clickCounter === 0) deleteGame({ variables: { id: gameId, token: getCookie('token') } }).then(() => router.push('/games'));
    }, [clickCounter]);

    let buttonText;
    if (clickCounter <= 0) buttonText = 'Deleting...';
    else if (clickCounter == 1) buttonText = '1 click until deletion';
    else if (clickCounter < CLICKS_TO_DELETE) buttonText = `${clickCounter} clicks until deletion`;
    else buttonText = 'Delete Game';

    return (
        <Button onClick={() => setClickcounter(clickCounter - 1)} style={{ width: 'fit-content', marginBottom: '10px' }}>
            {buttonText}
        </Button>
    );
};

export default DeleteGameButton;
