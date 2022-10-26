import { GetServerSideProps, NextPage } from 'next';
import { useRef, useState } from 'react';
import Header from '../../components/Header';
import GameData from '../../types/gameData';
import useDebounce from '../../hooks/useDebounce';
import useWarning from '../../hooks/useWarning';
import GeneralInfo from '../../components/editGame/GeneralInfo';
import Questions from '../../components/editGame/Questions';

type Props = { game: GameData };

const EditGame: NextPage<Props> = ({ game: _game }) => {
    const setIsSafeToLeave = useWarning();

    const [game, _setGame] = useState(_game);
    const prevGameRef = useRef<GameData>(_game);

    const setGame = useDebounce(
        async game => {
            // TODO: update data on the server
            console.log(game);
            prevGameRef.current = game;
            setIsSafeToLeave(true);
        },
        (_, cur) => {
            setIsSafeToLeave(false);
            _setGame(cur);
            return cur;
        },
        500
    );

    return (
        <>
            <Header />
            <div style={{ padding: '0 20px' }}>
                <GeneralInfo game={game} setGame={setGame} />
                <Questions game={game} setGame={setGame} />
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const { id } = query;

    // if game with id=id !exists || cur.user !== game.creator => return {notFound: true}!

    return {
        props: {
            game: {
                id,
                title: 'Long title for the stupid game',
                description:
                    'Some description. Et quia ut qui consectetur porro labore dolores dolor. Officiis itaque ipsum autem consectetur. Perspiciatis labore deserunt debitis nulla possimus similique quibusdam possimus. Corrupti molestiae cumque amet aut doloremque. Et quia ut qui consectetur porro labore dolores dolor. Officiis itaque ipsum autem consectetur. Perspiciatis labore deserunt debitis nulla possimus similique quibusdam possimus. Corrupti molestiae cumque amet aut doloremque.Some description. Et quia ut qui consectetur porro labore dolores dolor. Officiis itaque ipsum autem consectetur. Perspiciatis labore deserunt debitis nulla possimus similique quibusdam possimus. Corrupti molestiae cumque amet aut doloremque. Et quia ut qui consectetur porro labore dolores dolor. Officiis itaque ipsum autem consectetur. Perspiciatis labore deserunt debitis nulla possimus similique quibusdam possimus. Corrupti molestiae cumque amet aut doloremque.Some description. Et quia ut qui consectetur porro labore dolores dolor. Officiis itaque ipsum autem consectetur. Perspiciatis labore deserunt debitis nulla possimus similique quibusdam possimus. Corrupti molestiae cumque amet aut doloremque. Et quia ut qui consectetur porro labore dolores dolor. Officiis itaque ipsum autem consectetur. Perspiciatis labore deserunt debitis nulla possimus similique quibusdam possimus. Corrupti molestiae cumque amet aut doloremque.',
                image: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fthewowstyle.com%2Fwp-content%2Fuploads%2F2015%2F01%2Fnature-images.jpg&f=1&nofb=1&ipt=8033037c9770219270aa68c8647707ac1dd1051f20f7d6595eea52ab33e55b06&ipo=images',
                questions: [
                    {
                        title: "I'm not really sure how long the title can be to still fit in this one-liner title?",
                        image: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fthewowstyle.com%2Fwp-content%2Fuploads%2F2015%2F01%2Fnature-images.jpg&f=1&nofb=1&ipt=8033037c9770219270aa68c8647707ac1dd1051f20f7d6595eea52ab33e55b06&ipo=images',
                        time: 30,
                        type: 'single',
                        id: 'sth',
                        choices: ['123', '456', '789', '011'],
                        answers: [0],
                    },
                ],
            },
        },
    };
};

export default EditGame;
